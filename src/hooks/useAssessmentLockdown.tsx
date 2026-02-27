import { useState, useEffect, useCallback, useRef } from 'react';

interface UseAssessmentLockdownOptions {
  isActive: boolean;
  onViolation?: (type: string, message: string) => void;
}

interface UseAssessmentLockdownReturn {
  isFullScreen: boolean;
  isWebcamDisconnected: boolean;
  isPaused: boolean;
  exitFullscreenCount: number;
  contextMenuAttempts: number;
  requestFullscreen: () => Promise<void>;
}

export const useAssessmentLockdown = ({
  isActive,
  onViolation,
}: UseAssessmentLockdownOptions): UseAssessmentLockdownReturn => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isWebcamDisconnected, setIsWebcamDisconnected] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [exitFullscreenCount, setExitFullscreenCount] = useState(0);
  const [contextMenuAttempts, setContextMenuAttempts] = useState(0);

  const wasFullScreenRef = useRef(false);
  const onViolationRef = useRef(onViolation);
  useEffect(() => { onViolationRef.current = onViolation; }, [onViolation]);

  const requestFullscreen = useCallback(async () => {
    try {
      await document.documentElement.requestFullscreen();
      // State updates handled by fullscreenchange event listener
      setIsPaused(false);
    } catch {
      console.warn('Fullscreen request denied.');
    }
  }, []);

  // Fullscreen change detection
  useEffect(() => {
    if (!isActive) return;

    const handleFullscreenChange = () => {
      const isFs = !!document.fullscreenElement;
      setIsFullScreen(isFs);

      if (!isFs && wasFullScreenRef.current) {
        // User exited fullscreen after it was active
        setExitFullscreenCount(prev => prev + 1);
        setIsPaused(true);
        onViolationRef.current?.('FULLSCREEN_EXIT', 'Fullscreen mode exited. Please return to fullscreen to continue.');
      }

      wasFullScreenRef.current = isFs;
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [isActive]);

  // Context menu blocking
  useEffect(() => {
    if (!isActive) return;

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      setContextMenuAttempts(prev => prev + 1);
      onViolationRef.current?.('CONTEXT_MENU_ATTEMPT', 'Right-click is disabled during the assessment.');
    };

    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, [isActive]);

  // Webcam disconnect detection - monitors all active video tracks
  useEffect(() => {
    if (!isActive) return;

    const trackedListeners: { track: MediaStreamTrack; handler: () => void }[] = [];
    let recursiveTimer: ReturnType<typeof setTimeout> | undefined;

    const checkVideoTracks = () => {
      const videoElements = document.querySelectorAll('video');
      let hasActiveTrack = false;

      videoElements.forEach(video => {
        const stream = (video as HTMLVideoElement).srcObject as MediaStream | null;
        if (stream) {
          const videoTracks = stream.getVideoTracks();
          videoTracks.forEach(track => {
            if (track.readyState === 'live') {
              hasActiveTrack = true;

              // Only add listener if not already tracked for this track
              const alreadyTracked = trackedListeners.some(t => t.track === track);
              if (!alreadyTracked) {
                const handler = () => {
                  setIsWebcamDisconnected(true);
                  setIsPaused(true);
                  onViolationRef.current?.('WEBCAM_DISCONNECT', 'Camera disconnected. Assessment paused.');
                };
                track.addEventListener('ended', handler);
                trackedListeners.push({ track, handler });
              }
            }
          });
        }
      });

      if (!hasActiveTrack && document.querySelectorAll('video').length > 0) {
        recursiveTimer = setTimeout(checkVideoTracks, 2000);
      }
    };

    const initTimer = setTimeout(checkVideoTracks, 1000);

    return () => {
      clearTimeout(initTimer);
      if (recursiveTimer) clearTimeout(recursiveTimer);
      trackedListeners.forEach(({ track, handler }) => {
        track.removeEventListener('ended', handler);
      });
    };
  }, [isActive]);

  // Auto-request fullscreen when lockdown becomes active
  useEffect(() => {
    if (isActive) {
      // Call DOM API directly; the fullscreenchange event handler updates state
      document.documentElement.requestFullscreen().catch(() => {
        console.warn('Fullscreen request denied.');
      });
    }
  }, [isActive]);

  return {
    isFullScreen,
    isWebcamDisconnected,
    isPaused,
    exitFullscreenCount,
    contextMenuAttempts,
    requestFullscreen,
  };
};
