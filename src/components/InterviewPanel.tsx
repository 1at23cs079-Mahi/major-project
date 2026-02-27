import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2 } from "lucide-react";
import CaptionCard from "@/components/CaptionCard";

interface Scores {
  communicationScore: number;
  confidenceScore: number;
  technicalScore: number;
  grammarScore: number;
}

interface InterviewPanelProps {
  isAISpeaking: boolean;
  isProcessing: boolean;
  isInitializing: boolean;
  isRecording: boolean;
  caption: string;
  scores: Scores;
  questionCount: number;
  maxQuestions: number;
  onToggleRecording: () => void;
  onEndInterview: () => void;
}

const InterviewPanel = ({
  isAISpeaking,
  isProcessing,
  isInitializing,
  isRecording,
  caption,
  scores,
  questionCount,
  maxQuestions,
  onToggleRecording,
  onEndInterview,
}: InterviewPanelProps) => {
  const progress = (questionCount / maxQuestions) * 100;

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
              <span className="text-white text-sm font-bold">AI</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">AI Interview Session</h2>
              <Badge variant="outline" className="text-xs">
                <div className="w-2 h-2 rounded-full bg-success mr-1.5 animate-pulse" />
                Question {questionCount} of {maxQuestions}
              </Badge>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onEndInterview}
            className="text-destructive hover:text-destructive"
            disabled={isProcessing}
          >
            {questionCount > 1 ? 'End & Get Report' : 'Cancel Interview'}
          </Button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {questionCount > 1 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <Card className="p-3 md:p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Communication</p>
              <p className="text-xl md:text-2xl font-bold text-primary">{scores.communicationScore}/10</p>
            </Card>
            <Card className="p-3 md:p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Confidence</p>
              <p className="text-xl md:text-2xl font-bold text-primary">{scores.confidenceScore}/10</p>
            </Card>
            <Card className="p-3 md:p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Technical</p>
              <p className="text-xl md:text-2xl font-bold text-primary">{scores.technicalScore}/10</p>
            </Card>
            <Card className="p-3 md:p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Grammar</p>
              <p className="text-xl md:text-2xl font-bold text-primary">{scores.grammarScore}/10</p>
            </Card>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="relative overflow-hidden border-2 border-border bg-card/50 backdrop-blur">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
            <div className="relative p-8 flex flex-col items-center justify-center min-h-[320px]">
              <div className={`relative mb-6 ${isAISpeaking ? 'animate-pulse' : ''}`}>
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <div className="w-28 h-28 rounded-full bg-background flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                      {isAISpeaking ? (
                        <div className="flex gap-1">
                          <div className="w-1 h-8 bg-primary rounded-full animate-pulse" />
                          <div className="w-1 h-12 bg-primary rounded-full animate-pulse delay-75" />
                          <div className="w-1 h-8 bg-primary rounded-full animate-pulse delay-150" />
                        </div>
                      ) : isInitializing || isProcessing ? (
                        <Loader2 className="w-10 h-10 text-primary animate-spin" />
                      ) : (
                        <Mic className="w-10 h-10 text-primary" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-1">AI Interviewer</h3>
              <p className="text-sm text-muted-foreground">
                {isAISpeaking ? 'Speaking...' : isProcessing ? 'Thinking...' : 'Listening'}
              </p>
            </div>
          </Card>

          <Card className="relative overflow-hidden border-2 border-border bg-card/50 backdrop-blur">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-primary/5" />
            <div className="relative p-8 flex flex-col items-center justify-center min-h-[320px]">
              <div className={`relative mb-6 ${isRecording ? 'ring-4 ring-destructive/30 rounded-full' : ''}`}>
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center">
                  <div className="w-28 h-28 rounded-full bg-background flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
                      <span className="text-4xl font-bold text-primary">You</span>
                    </div>
                  </div>
                </div>
                {isRecording && (
                  <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
                    <Badge variant="destructive" className="animate-pulse">Recording</Badge>
                  </div>
                )}
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-1">Candidate</h3>
              <p className="text-sm text-muted-foreground">
                {isRecording ? 'Speaking...' : 'Ready to respond'}
              </p>
            </div>
          </Card>
        </div>

        <CaptionCard caption={caption} />

        <div className="flex flex-col items-center gap-4">
          <Button
            size="lg"
            onClick={onToggleRecording}
            disabled={isAISpeaking || isProcessing || isInitializing}
            className={`w-20 h-20 rounded-full transition-all ${
              isRecording ? "bg-destructive hover:bg-destructive/90 scale-110" : "bg-gradient-primary hover:opacity-90"
            }`}
          >
            {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
          </Button>
          {!isRecording && !isAISpeaking && !isProcessing && !isInitializing && (
            <p className="text-sm text-muted-foreground text-center">Click the microphone to respond</p>
          )}
          {isInitializing && (
            <p className="text-sm text-muted-foreground text-center">Starting interview...</p>
          )}
        </div>

        <div className="mt-8">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Progress</span>
            <span>{questionCount}/{maxQuestions} questions</span>
          </div>
          <div className="h-2 w-full rounded bg-muted overflow-hidden">
            <div className="h-2 bg-primary" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewPanel;
