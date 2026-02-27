import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import InterviewPanel from "@/components/InterviewPanel";
import ProctorOverlay from "@/components/ProctorOverlay";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useInterview } from "@/hooks/useInterview";
import { useProctoring } from "@/hooks/useProctoring";
import type { ViolationType } from "@/hooks/useProctoring";
import { useVisionProctor } from "@/hooks/useVisionProctor";
import { useAssessmentLockdown } from "@/hooks/useAssessmentLockdown";
import { useObjectDetection } from "@/hooks/useObjectDetection";
import { isSupabaseConfigured } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { ShieldAlert, Camera } from "lucide-react";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ScoreData {
  communicationScore: number;
  confidenceScore: number;
  technicalScore: number;
  grammarScore: number;
}

const VoiceInterview = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resumeId = searchParams.get('resumeId') || undefined;

  useDocumentTitle("Voice Interview");

  const {
    isLookingAway,
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
    stats: proctorStats,
  } = useProctoring();

  const [isRecording, setIsRecording] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [caption, setCaption] = useState("");
  const [sttProvider, setSttProvider] = useState<'deepgram' | 'whisper'>('deepgram');
  const [sttLanguage, setSttLanguage] = useState<string>('en');
  const [questionCount, setQuestionCount] = useState(0);
  const [interviewId, setInterviewId] = useState<string | null>(null);
  const [, setMessages] = useState<Message[]>([]);

  // YOLO object detection (optional - only active if model is available)
  const { detections: yoloDetections, isModelLoaded: isYoloLoaded, runDetection } = useObjectDetection({
    modelUrl: '/models/proctor-yolo.onnx',
    enabled: isProctoring,
  });

  // Vision LLM proctoring - smart triggering for deep analysis
  useVisionProctor({
    interviewId,
    isProctoring,
    isLookingAway,
    captureScreenshot,
    objectDetections: yoloDetections,
  });

  // Map lockdown violation types to proctoring violation types
  const handleLockdownViolation = useCallback((type: string, message: string) => {
    const violationMap: Record<string, ViolationType> = {
      FULLSCREEN_EXIT: 'fullscreen_exit',
      WEBCAM_DISCONNECT: 'webcam_disconnect',
      CONTEXT_MENU_ATTEMPT: 'tab_switch',
    };
    addViolation(violationMap[type] || 'tab_switch', message);
  }, [addViolation]);

  // Assessment lockdown (fullscreen, context menu, webcam disconnect)
  const { isPaused, isWebcamDisconnected, requestFullscreen } = useAssessmentLockdown({
    isActive: isProctoring,
    onViolation: handleLockdownViolation,
  });

  // Run YOLO detection periodically on webcam frames
  useEffect(() => {
    if (!isProctoring || !isYoloLoaded || !webcamRef.current) return;
    const interval = setInterval(() => {
      if (webcamRef.current) runDetection(webcamRef.current);
    }, 1000);
    return () => clearInterval(interval);
  }, [isProctoring, isYoloLoaded, runDetection, webcamRef]);

  // Wrap startProctoring to surface errors to the user
  const handleStartProctoring = useCallback(async () => {
    try {
      await startProctoring();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to start monitoring. Check camera permissions.');
    }
  }, [startProctoring]);

  const [scores, setScores] = useState<ScoreData>({
    communicationScore: 0,
    confidenceScore: 0,
    technicalScore: 0,
    grammarScore: 0,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const vadIntervalRef = useRef<number | null>(null);
  const lastSpeechTimeRef = useRef<number>(0);
  const SILENCE_MS = 1500;
  const VAD_THRESHOLD = 0.02;

  const {
    createInterview,
    sendMessage,
    speechToText,
    textToSpeech,
    generateReport
  } = useInterview();

  const MAX_QUESTIONS = 8;

  const playAudio = useCallback(async (audioBase64: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        const audio = new Audio(`data:audio/mpeg;base64,${audioBase64}`);
        audioRef.current = audio;

        audio.onended = () => {
          setIsAISpeaking(false);
          resolve();
        };

        audio.onerror = (e) => {
          setIsAISpeaking(false);
          reject(e);
        };

        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          try { mediaRecorderRef.current.stop(); } catch { /* already stopped */ }
          setIsRecording(false);
        }

        setIsAISpeaking(true);
        audio.play();
      } catch (error) {
        setIsAISpeaking(false);
        reject(error);
      }
    });
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        if (vadIntervalRef.current) {
          clearInterval(vadIntervalRef.current);
          vadIntervalRef.current = null;
        }
        if (audioContextRef.current) {
          try { audioContextRef.current.close(); } catch { /* already closed */ }
          audioContextRef.current = null;
        }
        analyserRef.current = null;
        mediaStreamSourceRef.current = null;
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processRecording(audioBlob);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      toast.info("Recording started - speak now");

      try {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const audioContext = new AudioContextClass();
        audioContextRef.current = audioContext;
        const source = audioContext.createMediaStreamSource(stream);
        mediaStreamSourceRef.current = source;
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 1024;
        analyserRef.current = analyser;
        source.connect(analyser);
        const data = new Float32Array(analyser.fftSize);
        lastSpeechTimeRef.current = performance.now();
        vadIntervalRef.current = window.setInterval(() => {
          if (!analyserRef.current) return;
          analyserRef.current.getFloatTimeDomainData(data);
          let sum = 0;
          for (let i = 0; i < data.length; i++) sum += data[i] * data[i];
          const rms = Math.sqrt(sum / data.length);
          const now = performance.now();
          if (rms > VAD_THRESHOLD) {
            lastSpeechTimeRef.current = now;
          }
          if (now - lastSpeechTimeRef.current > SILENCE_MS) {
            stopRecording();
          }
        }, 200);
      } catch (e) {
        console.warn('VAD setup failed, continuing without auto-stop', e);
      }
    } catch (error) {
      console.error('Failed to start recording:', error);
      toast.error('Failed to access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processRecording = async (audioBlob: Blob) => {
    if (!interviewId) return;

    setIsProcessing(true);
    setCaption("Processing your response...");

    try {
      const sttResponse = await speechToText.mutateAsync({ audioBlob, provider: sttProvider, language: sttLanguage });
      const transcript = sttResponse?.transcript || '';

      if (!transcript.trim()) {
        toast.error("Couldn't hear you clearly. Please try again.");
        setCaption("");
        setIsProcessing(false);
        return;
      }

      setCaption(`You said: "${transcript}"`);

      let updatedMessages: Message[] = [];
      setMessages(prev => {
        updatedMessages = [...prev, { role: 'user', content: transcript }];
        return updatedMessages;
      });

      if (questionCount >= MAX_QUESTIONS) {
        await finishInterview();
        return;
      }

      const chatResponse = await sendMessage.mutateAsync({
        messages: updatedMessages,
        resumeId,
        interviewId,
      });

      const nextQuestion = chatResponse?.nextQuestion || '';
      const reportUpdate = chatResponse?.reportUpdate;

      if (reportUpdate) {
        setScores(prev => ({
          communicationScore: reportUpdate.communicationScore || prev.communicationScore,
          confidenceScore: reportUpdate.confidenceScore || prev.confidenceScore,
          technicalScore: reportUpdate.technicalScore || prev.technicalScore,
          grammarScore: reportUpdate.grammarScore || prev.grammarScore,
        }));
      }

      setMessages([...updatedMessages, { role: 'assistant', content: nextQuestion }]);
      setCaption(nextQuestion);
      setQuestionCount(prev => prev + 1);

      try {
        const ttsResponse = await textToSpeech.mutateAsync({ text: nextQuestion });
        if (ttsResponse?.audioContent) {
          await playAudio(ttsResponse.audioContent);
          await startRecording();
        } else {
          await startRecording();
        }
      } catch {
        await startRecording();
      }

      setIsProcessing(false);
    } catch (error) {
      console.error('Error processing recording:', error);
      toast.error('Failed to process your response');
      setCaption("");
      setIsProcessing(false);
    }
  };

  const finishInterview = async () => {
    if (!interviewId) return;

    setIsProcessing(true);
    setCaption("Generating your interview report...");

    try {
      await generateReport.mutateAsync(interviewId);
      toast.success("Interview completed!");
      navigate(`/interview-report/${interviewId}`);
    } catch (error) {
      console.error('Error finishing interview:', error);
      toast.error('Failed to generate report');
      setIsProcessing(false);
    }
  };

  const initializeInterview = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setCaption("Welcome to the AI Interview! This is a demo — connect Supabase for the full experience. Press the mic to start recording.");
      setMessages([{ role: 'assistant', content: "Welcome! Tell me about yourself and your experience." }]);
      setQuestionCount(1);
      setIsInitializing(false);
      return;
    }

    try {
      setIsInitializing(true);

      const interview = await createInterview.mutateAsync({ resumeId });
      if (!interview) throw new Error('Failed to create interview');

      setInterviewId(interview.id);

      const response = await sendMessage.mutateAsync({
        messages: [],
        resumeId,
        interviewId: interview.id,
      });

      const firstQuestion = response.nextQuestion || "Introduce yourself and tell me about your background.";
      setCaption(firstQuestion);
      setMessages([{ role: 'assistant', content: firstQuestion }]);
      setQuestionCount(1);

      try {
        const ttsResponse = await textToSpeech.mutateAsync({ text: firstQuestion });
        if (ttsResponse?.audioContent) {
          await playAudio(ttsResponse.audioContent);
          await startRecording();
        } else {
          await startRecording();
        }
      } catch {
        await startRecording();
      }

      setIsInitializing(false);
    } catch (error) {
      console.error('Failed to initialize interview:', error);
      toast.error('Failed to start interview. Please try again.');
      setIsInitializing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createInterview, sendMessage, textToSpeech, resumeId, playAudio]);

  useEffect(() => {
    initializeInterview();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleEndInterview = async () => {
    if (interviewId && questionCount > 1) {
      await finishInterview();
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <DashboardLayout>
      <ProctorOverlay
        isProctoring={isProctoring}
        isModelLoading={isModelLoading}
        currentWarning={currentWarning}
        stats={proctorStats}
        webcamRef={webcamRef}
        canvasRef={canvasRef}
        screenshotCanvasRef={screenshotCanvasRef}
        onStart={handleStartProctoring}
        onStop={stopProctoring}
        objectDetections={yoloDetections}
        isYoloLoaded={isYoloLoaded}
      />

      {/* Assessment Lockdown Overlay */}
      {isPaused && (
        <div className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center">
          <div className="text-center text-white space-y-4 max-w-md">
            {isWebcamDisconnected ? (
              <>
                <Camera className="w-16 h-16 mx-auto text-red-500" />
                <h2 className="text-2xl font-bold">Camera Disconnected</h2>
                <p className="text-gray-300">Your camera has been disconnected. Please reconnect your camera to continue the assessment.</p>
              </>
            ) : (
              <>
                <ShieldAlert className="w-16 h-16 mx-auto text-orange-500" />
                <h2 className="text-2xl font-bold">Assessment Paused</h2>
                <p className="text-gray-300">You exited fullscreen mode. Please return to fullscreen to continue your interview.</p>
                <Button onClick={requestFullscreen} className="mt-4">Return to Fullscreen</Button>
              </>
            )}
          </div>
        </div>
      )}

      <InterviewPanel
        isAISpeaking={isAISpeaking}
        isProcessing={isProcessing}
        isInitializing={isInitializing}
        isRecording={isRecording}
        caption={caption}
        scores={scores}
        questionCount={questionCount}
        maxQuestions={MAX_QUESTIONS}
        onToggleRecording={toggleRecording}
        onEndInterview={handleEndInterview}
      />
      <div className="max-w-5xl mx-auto px-6 mt-4">
        <div className="flex gap-4 items-center text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Label className="text-muted-foreground">STT:</Label>
            <Select
              value={sttProvider}
              onValueChange={(val) => setSttProvider(val as 'deepgram' | 'whisper')}
              disabled={isRecording || isAISpeaking || isProcessing}
            >
              <SelectTrigger className="w-[130px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="deepgram">Deepgram</SelectItem>
                <SelectItem value="whisper">Whisper</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-muted-foreground">Lang:</Label>
            <Input
              className="w-16 h-8"
              value={sttLanguage}
              onChange={(e) => setSttLanguage(e.target.value)}
              disabled={isRecording || isAISpeaking || isProcessing}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default VoiceInterview;
