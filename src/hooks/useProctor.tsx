import { useState, useEffect, useRef, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';

export interface Violation {
  type: 'no_face' | 'multiple_faces' | 'looking_away' | 'tab_switch';
  timestamp: number;
  message: string;
}

export interface ProctorStats {
  totalViolations: number;
  noFaceCount: number;
  multipleFacesCount: number;
  lookingAwayCount: number;
  tabSwitchCount: number;
  trustScore: number;
}

interface UseProctorReturn {
  violations: Violation[];
  currentWarning: string | null;
  isProctoring: boolean;
  isModelLoading: boolean;
  webcamRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  startProctoring: () => Promise<void>;
  stopProctoring: () => void;
  stats: ProctorStats;
}

// Face landmark indices for MediaPipeFaceMesh (468 points)
const LEFT_EYE = [33, 160, 158, 133, 153, 144];
const RIGHT_EYE = [362, 385, 387, 263, 373, 380];
const NOSE_TIP = 1;
const LEFT_EAR = 234;
const RIGHT_EAR = 454;

function distance(
  a: { x: number; y: number },
  b: { x: number; y: number }
): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function eyeAspectRatio(landmarks: { x: number; y: number }[], indices: number[]): number {
  const p1 = landmarks[indices[0]];
  const p2 = landmarks[indices[1]];
  const p3 = landmarks[indices[2]];
  const p4 = landmarks[indices[3]];
  const p5 = landmarks[indices[4]];
  const p6 = landmarks[indices[5]];

  const vertical1 = distance(p2, p6);
  const vertical2 = distance(p3, p5);
  const horizontal = distance(p1, p4);

  if (horizontal === 0) return 0;
  return (vertical1 + vertical2) / (2 * horizontal);
}

export const useProctor = (): UseProctorReturn => {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [currentWarning, setCurrentWarning] = useState<string | null>(null);
  const [isProctoring, setIsProctoring] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [stats, setStats] = useState<ProctorStats>({
    totalViolations: 0,
    noFaceCount: 0,
    multipleFacesCount: 0,
    lookingAwayCount: 0,
    tabSwitchCount: 0,
    trustScore: 100,
  });

  const webcamRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const detectorRef = useRef<faceLandmarksDetection.FaceLandmarksDetector | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number>(0);
  const warningTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const lastViolationRef = useRef<string>('');
  const lastViolationTimeRef = useRef<number>(0);
  const noFaceFramesRef = useRef<number>(0);
  const lookingAwayFramesRef = useRef<number>(0);

  const addViolation = useCallback((type: Violation['type'], message: string) => {
    const now = Date.now();
    // Debounce: don't add same violation type within 3 seconds
    if (lastViolationRef.current === type && now - lastViolationTimeRef.current < 3000) {
      return;
    }
    lastViolationRef.current = type;
    lastViolationTimeRef.current = now;

    const violation: Violation = { type, timestamp: now, message };
    setViolations(prev => [...prev, violation]);
    setCurrentWarning(message);

    setStats(prev => {
      const updated = { ...prev };
      updated.totalViolations += 1;
      switch (type) {
        case 'no_face': updated.noFaceCount += 1; break;
        case 'multiple_faces': updated.multipleFacesCount += 1; break;
        case 'looking_away': updated.lookingAwayCount += 1; break;
        case 'tab_switch': updated.tabSwitchCount += 1; break;
      }
      // Trust score decreases by 2 per violation, min 0
      updated.trustScore = Math.max(0, 100 - updated.totalViolations * 2);
      return updated;
    });

    // Clear warning after 3s
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    warningTimerRef.current = setTimeout(() => setCurrentWarning(null), 3000);
  }, []);

  // Tab visibility detection
  useEffect(() => {
    if (!isProctoring) return;

    const handleVisibility = () => {
      if (document.hidden) {
        addViolation('tab_switch', 'Tab switch detected! Stay on the interview page.');
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [isProctoring, addViolation]);

  const detectFaces = useCallback(async () => {
    if (!detectorRef.current || !webcamRef.current || !isProctoring) return;

    const video = webcamRef.current;
    if (video.readyState < 2) {
      animFrameRef.current = requestAnimationFrame(detectFaces);
      return;
    }

    try {
      const faces = await detectorRef.current.estimateFaces(video, {
        flipHorizontal: false,
      });

      // Draw face overlay on canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          faces.forEach(face => {
            const box = face.box;
            ctx.strokeStyle = '#22c55e';
            ctx.lineWidth = 2;
            ctx.strokeRect(box.xMin, box.yMin, box.width, box.height);
          });
        }
      }

      if (faces.length === 0) {
        noFaceFramesRef.current += 1;
        lookingAwayFramesRef.current = 0;
        // Only flag after 15 consecutive frames (~0.5s at 30fps)
        if (noFaceFramesRef.current > 15) {
          addViolation('no_face', 'No face detected! Please face the camera.');
          noFaceFramesRef.current = 0;
        }
      } else if (faces.length > 1) {
        noFaceFramesRef.current = 0;
        lookingAwayFramesRef.current = 0;
        addViolation('multiple_faces', 'Multiple faces detected! Only the candidate should be visible.');
      } else {
        noFaceFramesRef.current = 0;
        const face = faces[0];
        const keypoints = face.keypoints;

        if (keypoints && keypoints.length >= 468) {
          const landmarks = keypoints.map(k => ({ x: k.x, y: k.y }));

          // Eye aspect ratio check
          const leftEAR = eyeAspectRatio(landmarks, LEFT_EYE);
          const rightEAR = eyeAspectRatio(landmarks, RIGHT_EYE);
          const avgEAR = (leftEAR + rightEAR) / 2;

          // Head pose check: nose position relative to ears
          const noseTip = landmarks[NOSE_TIP];
          const leftEar = landmarks[LEFT_EAR];
          const rightEar = landmarks[RIGHT_EAR];
          const faceCenterX = (leftEar.x + rightEar.x) / 2;
          const faceWidth = distance(leftEar, rightEar);
          const noseOffset = Math.abs(noseTip.x - faceCenterX) / (faceWidth || 1);

          // Looking away: low EAR (looking down/eyes closed) or head turned significantly
          if (avgEAR < 0.15 || noseOffset > 0.25) {
            lookingAwayFramesRef.current += 1;
            if (lookingAwayFramesRef.current > 20) {
              addViolation('looking_away', 'Please look at the camera. Looking away detected.');
              lookingAwayFramesRef.current = 0;
            }
          } else {
            lookingAwayFramesRef.current = 0;
          }
        }
      }
    } catch {
      // Silently continue on detection errors
    }

    animFrameRef.current = requestAnimationFrame(detectFaces);
  }, [isProctoring, addViolation]);

  const startProctoring = useCallback(async () => {
    try {
      setIsModelLoading(true);

      // Initialize TensorFlow.js
      await tf.ready();

      // Get webcam stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
      });
      streamRef.current = stream;

      if (webcamRef.current) {
        webcamRef.current.srcObject = stream;
        await webcamRef.current.play();
      }

      // Load face detection model
      const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
      const detector = await faceLandmarksDetection.createDetector(model, {
        runtime: 'tfjs',
        refineLandmarks: true,
        maxFaces: 3,
      });
      detectorRef.current = detector;

      setIsModelLoading(false);
      setIsProctoring(true);
    } catch (err) {
      setIsModelLoading(false);
      console.error('Failed to start proctoring:', err);
      throw new Error('Camera access denied or face detection model failed to load.');
    }
  }, []);

  // Start detection loop when proctoring is active
  useEffect(() => {
    if (isProctoring) {
      animFrameRef.current = requestAnimationFrame(detectFaces);
    }
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isProctoring, detectFaces]);

  const stopProctoring = useCallback(() => {
    setIsProctoring(false);

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = 0;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (detectorRef.current) {
      detectorRef.current.dispose();
      detectorRef.current = null;
    }

    if (webcamRef.current) {
      webcamRef.current.srcObject = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopProctoring();
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    };
  }, [stopProctoring]);

  return {
    violations,
    currentWarning,
    isProctoring,
    isModelLoading,
    webcamRef,
    canvasRef,
    startProctoring,
    stopProctoring,
    stats,
  };
};
