import { useState, useEffect, useRef, useCallback } from 'react';
import { FaceLandmarker, FilesetResolver, DrawingUtils } from '@mediapipe/tasks-vision';

export type ViolationType = 'no_face' | 'multiple_faces' | 'looking_away' | 'tab_switch' | 'background_noise' | 'fullscreen_exit' | 'webcam_disconnect';

export interface Violation {
  type: ViolationType;
  timestamp: number;
  message: string;
}

export interface ProctorStats {
  totalViolations: number;
  noFaceCount: number;
  multipleFacesCount: number;
  lookingAwayCount: number;
  tabSwitchCount: number;
  backgroundNoiseCount: number;
  fullscreenExitCount: number;
  webcamDisconnectCount: number;
  trustScore: number;
}

interface UseProctoringReturn {
  faceCount: number;
  isLookingAway: boolean;
  isTabFocused: boolean;
  isBackgroundNoiseDetected: boolean;
  violations: Violation[];
  currentWarning: string | null;
  isProctoring: boolean;
  isModelLoading: boolean;
  webcamRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  screenshotCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  startProctoring: () => Promise<void>;
  stopProctoring: () => void;
  captureScreenshot: () => string | null;
  addViolation: (type: ViolationType, message: string) => void;
  stats: ProctorStats;
}

// MediaPipe FaceMesh landmark indices for head pose estimation
const NOSE_TIP = 1;
const FOREHEAD = 10;
const CHIN = 152;
const LEFT_CHEEK = 234;
const RIGHT_CHEEK = 454;

function distance2D(
  a: { x: number; y: number },
  b: { x: number; y: number }
): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

/**
 * Estimates basic head pose from face landmarks.
 * Returns true if the face is turned significantly in any direction.
 */
function isHeadTurned(landmarks: { x: number; y: number; z: number }[]): boolean {
  if (landmarks.length < 468) return false;

  const noseTip = landmarks[NOSE_TIP];
  const leftCheek = landmarks[LEFT_CHEEK];
  const rightCheek = landmarks[RIGHT_CHEEK];
  const forehead = landmarks[FOREHEAD];
  const chin = landmarks[CHIN];

  // Horizontal turn: compare nose-to-left-cheek vs nose-to-right-cheek distance
  const noseToLeft = distance2D(noseTip, leftCheek);
  const noseToRight = distance2D(noseTip, rightCheek);
  const faceWidth = distance2D(leftCheek, rightCheek);

  if (faceWidth === 0) return false;

  // Asymmetry ratio: 0 = centered, higher = more turned
  const horizontalRatio = Math.abs(noseToLeft - noseToRight) / faceWidth;

  // Vertical tilt: compare nose position relative to forehead-chin midpoint
  const faceMidY = (forehead.y + chin.y) / 2;
  const faceHeight = distance2D(forehead, chin);
  const verticalOffset = faceHeight > 0 ? Math.abs(noseTip.y - faceMidY) / faceHeight : 0;

  // Z-depth based yaw detection (nose tip z vs cheek z)
  const leftZ = leftCheek.z;
  const rightZ = rightCheek.z;
  const zDiff = Math.abs(leftZ - rightZ);

  // Thresholds for "looking away"
  const isHorizontallyTurned = horizontalRatio > 0.25;
  const isVerticallyTilted = verticalOffset > 0.35;
  const isDepthTurned = zDiff > 0.06;

  return isHorizontallyTurned || isVerticallyTilted || isDepthTurned;
}

export const useProctoring = (): UseProctoringReturn => {
  const [faceCount, setFaceCount] = useState(0);
  const [isLookingAway, setIsLookingAway] = useState(false);
  const [isTabFocused, setIsTabFocused] = useState(true);
  const [isBackgroundNoiseDetected, setIsBackgroundNoiseDetected] = useState(false);
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
    backgroundNoiseCount: 0,
    fullscreenExitCount: 0,
    webcamDisconnectCount: 0,
    trustScore: 100,
  });

  const webcamRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const screenshotCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectionIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const lastViolationRef = useRef<string>('');
  const lastViolationTimeRef = useRef<number>(0);

  // Debounce counters: require sustained detection before firing alert
  const noFaceFramesRef = useRef(0);
  const lookingAwayFramesRef = useRef(0);
  const NO_FACE_THRESHOLD = 5; // ~2.5s at 500ms intervals
  const LOOKING_AWAY_THRESHOLD = 6; // ~3s at 500ms intervals

  // Audio proctoring refs
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioAnalyserRef = useRef<AnalyserNode | null>(null);
  const audioDataRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const audioNoiseFramesRef = useRef(0);
  const audioIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const NOISE_RMS_THRESHOLD = 0.04; // RMS level considered "noise" (0-1 scale)
  const BACKGROUND_NOISE_THRESHOLD = 8; // ~1.6s of sustained noise at 200ms checks

  const addViolation = useCallback((type: ViolationType, message: string) => {
    const now = Date.now();
    // Debounce: same violation type within 3 seconds is ignored
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
        case 'background_noise': updated.backgroundNoiseCount += 1; break;
        case 'fullscreen_exit': updated.fullscreenExitCount += 1; break;
        case 'webcam_disconnect': updated.webcamDisconnectCount += 1; break;
      }
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
      const focused = !document.hidden;
      setIsTabFocused(focused);
      if (document.hidden) {
        addViolation('tab_switch', 'Tab switch detected! Stay on the interview page.');
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [isProctoring, addViolation]);

  const detectFaces = useCallback(() => {
    if (!faceLandmarkerRef.current || !webcamRef.current || !isProctoring) return;

    const video = webcamRef.current;
    if (video.readyState < 2 || video.videoWidth === 0) return;

    try {
      const startTimeMs = performance.now();
      const results = faceLandmarkerRef.current.detectForVideo(video, startTimeMs);

      const faces = results.faceLandmarks || [];
      setFaceCount(faces.length);

      // Draw face overlay on canvas
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          const drawingUtils = new DrawingUtils(ctx);
          faces.forEach(landmarks => {
            drawingUtils.drawConnectors(
              landmarks,
              FaceLandmarker.FACE_LANDMARKS_TESSELATION,
              { color: '#22c55e30', lineWidth: 0.5 }
            );
            drawingUtils.drawConnectors(
              landmarks,
              FaceLandmarker.FACE_LANDMARKS_FACE_OVAL,
              { color: '#22c55e', lineWidth: 1.5 }
            );
          });
        }
      }

      if (faces.length === 0) {
        noFaceFramesRef.current += 1;
        lookingAwayFramesRef.current = 0;
        setIsLookingAway(false);

        if (noFaceFramesRef.current >= NO_FACE_THRESHOLD) {
          addViolation('no_face', 'No face detected! Please face the camera.');
          noFaceFramesRef.current = 0;
        }
      } else if (faces.length > 1) {
        noFaceFramesRef.current = 0;
        lookingAwayFramesRef.current = 0;
        setIsLookingAway(false);
        addViolation('multiple_faces', 'Multiple faces detected! Only the candidate should be visible.');
      } else {
        noFaceFramesRef.current = 0;
        const landmarks = faces[0];

        // Convert normalized landmarks to {x, y, z} for head pose check
        const points = landmarks.map(l => ({ x: l.x, y: l.y, z: l.z ?? 0 }));
        const headTurned = isHeadTurned(points);

        if (headTurned) {
          lookingAwayFramesRef.current += 1;
          setIsLookingAway(true);
          if (lookingAwayFramesRef.current >= LOOKING_AWAY_THRESHOLD) {
            addViolation('looking_away', 'Please look at the camera. Looking away detected.');
            lookingAwayFramesRef.current = 0;
          }
        } else {
          lookingAwayFramesRef.current = 0;
          setIsLookingAway(false);
        }
      }
    } catch {
      // Silently continue on detection errors
    }
  }, [isProctoring, addViolation]);

  /**
   * Capture a screenshot from the webcam as a base64 JPEG string.
   * Used to send frames to the Vision LLM for deeper analysis.
   */
  const captureScreenshot = useCallback((): string | null => {
    const video = webcamRef.current;
    const canvas = screenshotCanvasRef.current;
    if (!video || !canvas || video.readyState < 2) return null;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.7).split(',')[1]; // Return only base64 data
  }, []);

  const startProctoring = useCallback(async () => {
    try {
      setIsModelLoading(true);

      // Initialize MediaPipe WASM + FaceLandmarker (uses local WASM matching npm version)
      const vision = await FilesetResolver.forVisionTasks(
        '/wasm/mediapipe'
      );

      const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numFaces: 3,
        outputFaceBlendshapes: false,
        outputFacialTransformationMatrixes: false,
      });

      faceLandmarkerRef.current = faceLandmarker;

      // Get webcam stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
      });
      streamRef.current = stream;

      if (webcamRef.current) {
        webcamRef.current.srcObject = stream;
        await webcamRef.current.play();
      }

      // Set up audio monitoring for background noise detection
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioStreamRef.current = audioStream;
        const audioCtx = new AudioContext();
        const source = audioCtx.createMediaStreamSource(audioStream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 512;
        source.connect(analyser);

        audioContextRef.current = audioCtx;
        audioAnalyserRef.current = analyser;
        audioDataRef.current = new Uint8Array(analyser.frequencyBinCount);
      } catch {
        // Audio monitoring is optional - continue without it
        console.warn('Audio monitoring unavailable - microphone access denied.');
      }

      setIsModelLoading(false);
      setIsProctoring(true);
    } catch (err) {
      setIsModelLoading(false);
      console.error('Failed to start proctoring:', err);
      throw new Error('Camera access denied or face detection model failed to load.');
    }
  }, []);

  // Start detection loop at ~500ms intervals when proctoring is active
  useEffect(() => {
    if (isProctoring) {
      detectionIntervalRef.current = setInterval(detectFaces, 500);
    }
    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
        detectionIntervalRef.current = null;
      }
    };
  }, [isProctoring, detectFaces]);

  // Audio noise detection loop at ~200ms intervals
  useEffect(() => {
    if (!isProctoring) return;

    audioIntervalRef.current = setInterval(() => {
      const analyser = audioAnalyserRef.current;
      const dataArray = audioDataRef.current;
      if (!analyser || !dataArray) return;

      analyser.getByteTimeDomainData(dataArray);

      // Calculate RMS level (0-1 scale)
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        const normalized = (dataArray[i] - 128) / 128;
        sum += normalized * normalized;
      }
      const rms = Math.sqrt(sum / dataArray.length);

      if (rms > NOISE_RMS_THRESHOLD) {
        audioNoiseFramesRef.current += 1;
        if (audioNoiseFramesRef.current >= BACKGROUND_NOISE_THRESHOLD) {
          setIsBackgroundNoiseDetected(true);
          addViolation('background_noise', 'Unusual background audio detected. Ensure you are in a quiet environment.');
          audioNoiseFramesRef.current = 0;
        }
      } else {
        audioNoiseFramesRef.current = Math.max(0, audioNoiseFramesRef.current - 1);
        if (audioNoiseFramesRef.current === 0) {
          setIsBackgroundNoiseDetected(false);
        }
      }
    }, 200);

    return () => {
      if (audioIntervalRef.current) {
        clearInterval(audioIntervalRef.current);
        audioIntervalRef.current = null;
      }
    };
  }, [isProctoring, addViolation]);

  const stopProctoring = useCallback(() => {
    setIsProctoring(false);

    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }

    if (audioIntervalRef.current) {
      clearInterval(audioIntervalRef.current);
      audioIntervalRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
      audioAnalyserRef.current = null;
      audioDataRef.current = null;
    }

    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop());
      audioStreamRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (faceLandmarkerRef.current) {
      faceLandmarkerRef.current.close();
      faceLandmarkerRef.current = null;
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
    faceCount,
    isLookingAway,
    isTabFocused,
    isBackgroundNoiseDetected,
    violations,
    currentWarning,
    isProctoring,
    isModelLoading,
    webcamRef,
    canvasRef,
    screenshotCanvasRef,
    startProctoring,
    stopProctoring,
    captureScreenshot,
    addViolation,
    stats,
  };
};
