import { useRef, useCallback, useState, useEffect } from 'react';
import type { InferenceSession, Tensor } from 'onnxruntime-web';

// Classes from the proctoring YOLO model
// These match the expected output from a model trained on proctoring datasets
export const PROCTOR_CLASSES = [
  'mobile_phone',
  'book',
  'notes',
  'earphone',
  'secondary_screen',
  'extra_person',
  'hand_gesture',
  'laptop',
] as const;

export type ProctorClass = typeof PROCTOR_CLASSES[number];

export interface Detection {
  class: ProctorClass;
  classIndex: number;
  confidence: number;
  bbox: {
    x: number;      // center x (0-1 normalized)
    y: number;      // center y (0-1 normalized)
    width: number;   // width (0-1 normalized)
    height: number;  // height (0-1 normalized)
  };
}

interface UseObjectDetectionOptions {
  modelUrl: string;           // Path or URL to the .onnx model file
  confidenceThreshold?: number; // Minimum confidence to keep a detection (default: 0.5)
  iouThreshold?: number;       // NMS IoU threshold (default: 0.45)
  inputSize?: number;          // Model input size (default: 640)
  enabled?: boolean;           // Whether detection is active
}

interface UseObjectDetectionReturn {
  detections: Detection[];
  isModelLoaded: boolean;
  isModelLoading: boolean;
  loadError: string | null;
  runDetection: (video: HTMLVideoElement) => Promise<Detection[]>;
  drawDetections: (ctx: CanvasRenderingContext2D, detections: Detection[], videoWidth: number, videoHeight: number) => void;
}

/**
 * Pre-processes a video frame for YOLO input:
 * - Resizes to inputSize x inputSize
 * - Normalizes pixel values to [0, 1]
 * - Converts HWC to CHW format (channels first)
 * - Returns a Float32Array ready for ONNX inference
 */
function preprocessFrame(
  video: HTMLVideoElement,
  inputSize: number,
  canvas: HTMLCanvasElement
): Float32Array {
  canvas.width = inputSize;
  canvas.height = inputSize;
  const ctx = canvas.getContext('2d')!;

  // Draw video frame resized to inputSize x inputSize
  ctx.drawImage(video, 0, 0, inputSize, inputSize);
  const imageData = ctx.getImageData(0, 0, inputSize, inputSize);
  const { data } = imageData;

  // Convert to CHW Float32 normalized to [0, 1]
  const numPixels = inputSize * inputSize;
  const float32Data = new Float32Array(3 * numPixels);

  for (let i = 0; i < numPixels; i++) {
    const pixelOffset = i * 4; // RGBA
    float32Data[i] = data[pixelOffset] / 255.0;                    // R channel
    float32Data[numPixels + i] = data[pixelOffset + 1] / 255.0;   // G channel
    float32Data[2 * numPixels + i] = data[pixelOffset + 2] / 255.0; // B channel
  }

  return float32Data;
}

/**
 * Non-Maximum Suppression - removes overlapping detections
 */
function nms(detections: Detection[], iouThreshold: number): Detection[] {
  if (detections.length === 0) return [];

  // Sort by confidence (highest first)
  const sorted = [...detections].sort((a, b) => b.confidence - a.confidence);
  const kept: Detection[] = [];

  const suppressed = new Set<number>();

  for (let i = 0; i < sorted.length; i++) {
    if (suppressed.has(i)) continue;
    kept.push(sorted[i]);

    for (let j = i + 1; j < sorted.length; j++) {
      if (suppressed.has(j)) continue;
      if (iou(sorted[i].bbox, sorted[j].bbox) > iouThreshold) {
        suppressed.add(j);
      }
    }
  }

  return kept;
}

function iou(
  a: Detection['bbox'],
  b: Detection['bbox']
): number {
  const aLeft = a.x - a.width / 2;
  const aRight = a.x + a.width / 2;
  const aTop = a.y - a.height / 2;
  const aBottom = a.y + a.height / 2;

  const bLeft = b.x - b.width / 2;
  const bRight = b.x + b.width / 2;
  const bTop = b.y - b.height / 2;
  const bBottom = b.y + b.height / 2;

  const interLeft = Math.max(aLeft, bLeft);
  const interRight = Math.min(aRight, bRight);
  const interTop = Math.max(aTop, bTop);
  const interBottom = Math.min(aBottom, bBottom);

  if (interRight <= interLeft || interBottom <= interTop) return 0;

  const interArea = (interRight - interLeft) * (interBottom - interTop);
  const aArea = a.width * a.height;
  const bArea = b.width * b.height;

  return interArea / (aArea + bArea - interArea);
}

/**
 * Parse YOLOv8/v11 output tensor.
 * YOLOv8+ output shape: [1, numClasses+4, numAnchors]
 * First 4 rows = cx, cy, w, h (normalized)
 * Remaining rows = class confidences
 */
function parseYoloOutput(
  output: Tensor,
  numClasses: number,
  confidenceThreshold: number,
  iouThreshold: number,
  inputSize: number
): Detection[] {
  const data = output.data as Float32Array;
  const shape = output.dims; // [1, 4+numClasses, numAnchors]

  const numAnchors = shape[2];

  const rawDetections: Detection[] = [];

  for (let a = 0; a < numAnchors; a++) {
    // Extract bbox
    const cx = data[0 * numAnchors + a];
    const cy = data[1 * numAnchors + a];
    const w = data[2 * numAnchors + a];
    const h = data[3 * numAnchors + a];

    // Find best class
    let bestConf = 0;
    let bestClass = 0;
    for (let c = 0; c < numClasses; c++) {
      const conf = data[(4 + c) * numAnchors + a];
      if (conf > bestConf) {
        bestConf = conf;
        bestClass = c;
      }
    }

    if (bestConf >= confidenceThreshold) {
      rawDetections.push({
        class: PROCTOR_CLASSES[bestClass] || ('unknown' as ProctorClass),
        classIndex: bestClass,
        confidence: bestConf,
        bbox: {
          x: cx / inputSize,
          y: cy / inputSize,
          width: w / inputSize,
          height: h / inputSize,
        },
      });
    }
  }

  return nms(rawDetections, iouThreshold);
}

// Detection color map
const CLASS_COLORS: Record<string, string> = {
  mobile_phone: '#ef4444',    // red
  book: '#f97316',            // orange
  notes: '#f59e0b',           // amber
  earphone: '#8b5cf6',        // violet
  secondary_screen: '#3b82f6', // blue
  extra_person: '#ef4444',    // red
  hand_gesture: '#eab308',    // yellow
  laptop: '#06b6d4',          // cyan
};

/**
 * Hook for running YOLO object detection on webcam frames in the browser.
 *
 * Loads an ONNX-exported YOLOv11 model and runs inference using
 * ONNX Runtime Web (with WASM/WebGL backend).
 *
 * The onnxruntime-web module (~550KB) is dynamically imported on first use
 * to avoid bloating the main bundle.
 *
 * Usage:
 *   const { detections, runDetection, isModelLoaded } = useObjectDetection({
 *     modelUrl: '/models/proctor-yolo.onnx',
 *   });
 *   // Call runDetection(videoElement) periodically
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useObjectDetection = ({
  modelUrl,
  confidenceThreshold = 0.5,
  iouThreshold = 0.45,
  inputSize = 640,
  enabled = true,
}: UseObjectDetectionOptions): UseObjectDetectionReturn => {
  const [detections, setDetections] = useState<Detection[]>([]);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const sessionRef = useRef<InferenceSession | null>(null);
  const ortRef = useRef<typeof import('onnxruntime-web') | null>(null);
  const preprocessCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Load ONNX model
  useEffect(() => {
    if (!enabled || !modelUrl) return;

    let cancelled = false;

    const loadModel = async () => {
      setIsModelLoading(true);
      setLoadError(null);

      try {
        // Check if model file exists before attempting full load
        const checkResponse = await fetch(modelUrl, { method: 'HEAD' });
        if (!checkResponse.ok) {
          if (!cancelled) {
            setIsModelLoading(false);
            // Model not deployed yet - this is expected during development
            console.info(`YOLO model not available at ${modelUrl} (optional)`);
          }
          return;
        }

        // Dynamically import ONNX Runtime Web (~550KB) only when needed
        const ort = await import('onnxruntime-web');
        ortRef.current = ort;

        // Configure ONNX Runtime for browser (uses local WASM matching npm version)
        ort.env.wasm.wasmPaths = '/wasm/ort/';

        const session = await ort.InferenceSession.create(modelUrl, {
          executionProviders: ['webgl', 'wasm'],
          graphOptimizationLevel: 'all',
        });

        if (!cancelled) {
          sessionRef.current = session;
          setIsModelLoaded(true);
          setIsModelLoading(false);
        } else {
          // Effect was cancelled during load - release the session immediately
          session.release();
        }
      } catch (err) {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : 'Failed to load YOLO model';
          setLoadError(msg);
          setIsModelLoading(false);
          console.error('YOLO model load error:', err);
        }
      }
    };

    loadModel();

    return () => {
      cancelled = true;
      // Release session when enabled toggles off
      if (sessionRef.current) {
        sessionRef.current.release();
        sessionRef.current = null;
        setIsModelLoaded(false);
      }
    };
  }, [modelUrl, enabled]);

  // Create offscreen canvas for preprocessing
  useEffect(() => {
    if (typeof document !== 'undefined') {
      preprocessCanvasRef.current = document.createElement('canvas');
    }
  }, []);

  /**
   * Run YOLO inference on a single video frame.
   * Returns the list of detections and also updates internal state.
   */
  const runDetection = useCallback(
    async (video: HTMLVideoElement): Promise<Detection[]> => {
      const session = sessionRef.current;
      const canvas = preprocessCanvasRef.current;
      const ort = ortRef.current;
      if (!session || !canvas || !ort || video.readyState < 2) return [];

      try {
        // Preprocess frame
        const inputData = preprocessFrame(video, inputSize, canvas);
        const inputTensor = new ort.Tensor('float32', inputData, [1, 3, inputSize, inputSize]);

        // Get input name from model
        const inputName = session.inputNames[0];

        // Run inference
        const results = await session.run({ [inputName]: inputTensor });

        // Get output tensor (first output)
        const outputName = session.outputNames[0];
        const outputTensor = results[outputName];

        // Parse detections
        const numClasses = PROCTOR_CLASSES.length;
        const parsed = parseYoloOutput(outputTensor, numClasses, confidenceThreshold, iouThreshold, inputSize);

        setDetections(parsed);
        return parsed;
      } catch (err) {
        console.error('YOLO inference error:', err);
        return [];
      }
    },
    [inputSize, confidenceThreshold, iouThreshold]
  );

  /**
   * Draw detection bounding boxes on a canvas overlay.
   */
  const drawDetections = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      dets: Detection[],
      videoWidth: number,
      videoHeight: number
    ) => {
      dets.forEach((det) => {
        const color = CLASS_COLORS[det.class] || '#ffffff';

        // Convert normalized bbox to pixel coords
        const x = (det.bbox.x - det.bbox.width / 2) * videoWidth;
        const y = (det.bbox.y - det.bbox.height / 2) * videoHeight;
        const w = det.bbox.width * videoWidth;
        const h = det.bbox.height * videoHeight;

        // Draw bounding box
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, w, h);

        // Draw label background
        const label = `${det.class} ${Math.round(det.confidence * 100)}%`;
        ctx.font = '12px monospace';
        const textWidth = ctx.measureText(label).width;
        ctx.fillStyle = color;
        ctx.fillRect(x, y - 18, textWidth + 8, 18);

        // Draw label text
        ctx.fillStyle = '#ffffff';
        ctx.fillText(label, x + 4, y - 4);
      });
    },
    []
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sessionRef.current) {
        sessionRef.current.release();
        sessionRef.current = null;
      }
    };
  }, []);

  return {
    detections,
    isModelLoaded,
    isModelLoading,
    loadError,
    runDetection,
    drawDetections,
  };
};
