import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Camera, CameraOff, Shield, ShieldAlert, ShieldX, Eye, Loader2 } from "lucide-react";
import type { ProctorStats } from "@/hooks/useProctor";

interface ProctorOverlayProps {
  isProctoring: boolean;
  isModelLoading: boolean;
  currentWarning: string | null;
  stats: ProctorStats;
  webcamRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  onStart: () => void;
  onStop: () => void;
}

const ProctorOverlay = ({
  isProctoring,
  isModelLoading,
  currentWarning,
  stats,
  webcamRef,
  canvasRef,
  onStart,
  onStop,
}: ProctorOverlayProps) => {
  const getStatusColor = () => {
    if (!isProctoring) return "bg-muted-foreground";
    if (currentWarning) return "bg-red-500";
    if (stats.totalViolations > 5) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStatusLabel = () => {
    if (!isProctoring) return "Inactive";
    if (currentWarning) return "Violation";
    if (stats.totalViolations > 5) return "Warning";
    return "Monitoring";
  };

  const getTrustColor = () => {
    if (stats.trustScore >= 80) return "text-green-500";
    if (stats.trustScore >= 50) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <>
      {/* Warning Banner */}
      {currentWarning && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-red-500/95 text-white px-4 py-3 text-center text-sm font-medium animate-in slide-in-from-top duration-300 flex items-center justify-center gap-2">
          <ShieldAlert className="w-4 h-4" />
          {currentWarning}
        </div>
      )}

      {/* Webcam Preview Card */}
      <Card className="fixed bottom-4 right-4 z-50 overflow-hidden shadow-lg border-2 border-border w-48">
        {/* Status Header */}
        <div className="flex items-center justify-between px-3 py-2 bg-card border-b border-border">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${getStatusColor()} ${isProctoring && !currentWarning ? 'animate-pulse' : ''}`} />
            <span className="text-xs font-medium text-foreground">{getStatusLabel()}</span>
          </div>
          {isProctoring && stats.totalViolations > 0 && (
            <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
              {stats.totalViolations}
            </Badge>
          )}
        </div>

        {/* Video Preview */}
        <div className="relative bg-black aspect-[4/3]">
          <video
            ref={webcamRef}
            className="w-full h-full object-cover mirror"
            style={{ transform: 'scaleX(-1)' }}
            autoPlay
            playsInline
            muted
          />
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
            style={{ transform: 'scaleX(-1)' }}
          />
          {!isProctoring && !isModelLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/80 gap-2">
              <CameraOff className="w-6 h-6 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Camera off</span>
            </div>
          )}
          {isModelLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/80 gap-2">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
              <span className="text-xs text-muted-foreground">Loading AI...</span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="px-3 py-2 bg-card">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">Trust</span>
            </div>
            <span className={`text-xs font-bold ${getTrustColor()}`}>
              {stats.trustScore}%
            </span>
          </div>

          {/* Trust Score Bar */}
          <div className="w-full h-1.5 bg-muted rounded-full mb-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                stats.trustScore >= 80
                  ? 'bg-green-500'
                  : stats.trustScore >= 50
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${stats.trustScore}%` }}
            />
          </div>

          <Button
            size="sm"
            variant={isProctoring ? "destructive" : "default"}
            className="w-full h-7 text-xs"
            onClick={isProctoring ? onStop : onStart}
            disabled={isModelLoading}
          >
            {isModelLoading ? (
              <>
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                Loading...
              </>
            ) : isProctoring ? (
              <>
                <CameraOff className="w-3 h-3 mr-1" />
                Stop
              </>
            ) : (
              <>
                <Camera className="w-3 h-3 mr-1" />
                Start Monitor
              </>
            )}
          </Button>
        </div>

        {/* Violation Details (when there are any) */}
        {isProctoring && stats.totalViolations > 0 && (
          <div className="px-3 py-2 border-t border-border bg-muted/30">
            <div className="grid grid-cols-2 gap-1 text-[10px]">
              {stats.noFaceCount > 0 && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <ShieldX className="w-3 h-3 text-red-400" />
                  No face: {stats.noFaceCount}
                </div>
              )}
              {stats.multipleFacesCount > 0 && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <ShieldAlert className="w-3 h-3 text-orange-400" />
                  Multi: {stats.multipleFacesCount}
                </div>
              )}
              {stats.lookingAwayCount > 0 && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Eye className="w-3 h-3 text-yellow-400" />
                  Away: {stats.lookingAwayCount}
                </div>
              )}
              {stats.tabSwitchCount > 0 && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Shield className="w-3 h-3 text-purple-400" />
                  Tab: {stats.tabSwitchCount}
                </div>
              )}
            </div>
          </div>
        )}
      </Card>
    </>
  );
};

export default ProctorOverlay;
