import { useParams, useSearchParams, Link } from "react-router-dom";
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import Breadcrumb from "@/components/Breadcrumb";
import PageTransition from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, MessageSquare, CheckCircle2, AlertTriangle, AlertCircle, Loader2, ThumbsUp, ThumbsDown, Shield, Eye, Camera, Monitor, Phone, User, Clock, ShieldAlert, Volume2, Maximize } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

interface InterviewAnalysisResult {
  communicationScore?: number;
  confidenceScore?: number;
  technicalScore?: number;
  grammarScore?: number;
  overallScore?: number;
  strengths?: string[];
  weaknesses?: string[];
  improvements?: string[];
  overallSummary?: string;
  recommendation?: string;
}

const InterviewReport = () => {
  const { interviewId: paramId } = useParams<{ interviewId: string }>();
  const [searchParams] = useSearchParams();
  const queryId = searchParams.get('id');
  const interviewId = paramId || queryId;

  useDocumentTitle("Interview Report");

  const { data: interview, isLoading } = useQuery({
    queryKey: ['interview', interviewId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('interviews')
        .select('*, resumes(*)')
        .eq('id', interviewId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!interviewId && isSupabaseConfigured,
  });

  // Fetch proctoring flags for this interview
  const { data: proctoringData } = useQuery({
    queryKey: ['proctoring', interviewId],
    queryFn: async () => {
      // First get the proctoring session
      const { data: sessions } = await supabase
        .from('proctoring_sessions')
        .select('*')
        .eq('interview_id', interviewId!)
        .order('start_time', { ascending: false })
        .limit(1);

      const session = sessions?.[0];
      if (!session) return { session: null, flags: [] };

      // Then get all flags for that session
      const { data: flags } = await supabase
        .from('proctoring_flags')
        .select('*')
        .eq('session_id', session.id)
        .order('timestamp', { ascending: true });

      return { session, flags: flags || [] };
    },
    enabled: !!interviewId && isSupabaseConfigured,
  });

  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!interview || !interview.analysis_result) {
    return (
      <DashboardLayout>
        <div className="p-6 lg:p-8 max-w-6xl mx-auto">
          <Card className="border border-border shadow-md">
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">No report found for this interview</p>
              <div className="flex justify-center mt-4">
                <Link to="/voice-interview">
                  <Button>Start an Interview</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const analysis = interview.analysis_result as InterviewAnalysisResult;

  const communicationScore = analysis.communicationScore || 0;
  const confidenceScore = analysis.confidenceScore || 0;
  const technicalScore = analysis.technicalScore || 0;
  const grammarScore = analysis.grammarScore || 0;
  const overallScore = analysis.overallScore || Math.round((communicationScore + confidenceScore + technicalScore + grammarScore) / 4 * 10);

  const reportData = {
    role: interview.resumes?.target_role || "Position",
    overallScore,
    communicationScore: communicationScore * 10,
    confidenceScore: confidenceScore * 10,
    technicalScore: technicalScore * 10,
    grammarScore: grammarScore * 10,
    strengths: analysis.strengths || [],
    weaknesses: analysis.weaknesses || [],
    improvements: analysis.improvements || [],
    overallSummary: analysis.overallSummary || '',
    recommendation: analysis.recommendation || 'Pending',
  };

  const performanceData = [
    { category: 'Communication', score: reportData.communicationScore },
    { category: 'Confidence', score: reportData.confidenceScore },
    { category: 'Technical', score: reportData.technicalScore },
    { category: 'Grammar', score: reportData.grammarScore }
  ];

  const radarData = [
    { skill: 'Communication', A: reportData.communicationScore, fullMark: 100 },
    { skill: 'Confidence', A: reportData.confidenceScore, fullMark: 100 },
    { skill: 'Technical', A: reportData.technicalScore, fullMark: 100 },
    { skill: 'Grammar', A: reportData.grammarScore, fullMark: 100 },
    { skill: 'Overall', A: reportData.overallScore, fullMark: 100 }
  ];

  const isHireRecommendation = reportData.recommendation?.toLowerCase().includes('hire') &&
    !reportData.recommendation?.toLowerCase().includes('no hire');

  return (
    <DashboardLayout>
      <PageTransition>
      <div className="p-6 lg:p-8 max-w-6xl mx-auto">
        <Breadcrumb items={[{ label: "Mock Interview", href: "/voice-interview" }, { label: "Interview Report" }]} />
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 w-4 h-4" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="h-8 w-px bg-border" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Interview Feedback Report</h1>
              <p className="text-sm text-muted-foreground mt-1">
                For the role of <span className="text-primary font-medium">{reportData.role}</span>
              </p>
            </div>
          </div>
          <Link to="/voice-interview">
            <Button className="bg-gradient-primary hover:opacity-90 transition-opacity">
              <MessageSquare className="mr-2 w-4 h-4" />
              Start a New Interview
            </Button>
          </Link>
        </div>

        <Card className={`mb-6 border-2 ${isHireRecommendation ? 'border-success bg-success/5' : 'border-warning bg-warning/5'}`}>
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {isHireRecommendation ? (
                  <ThumbsUp className="w-10 h-10 text-success" />
                ) : (
                  <ThumbsDown className="w-10 h-10 text-warning" />
                )}
                <div>
                  <h2 className="text-xl font-bold text-foreground">AI Recommendation</h2>
                  <p className="text-muted-foreground">{reportData.recommendation}</p>
                </div>
              </div>
              <Badge
                variant={isHireRecommendation ? "default" : "secondary"}
                className={`text-lg px-4 py-2 ${isHireRecommendation ? 'bg-success' : 'bg-warning'}`}
              >
                {reportData.overallScore}% Overall
              </Badge>
            </div>
          </CardContent>
        </Card>

        {reportData.overallSummary && (
          <Card className="mb-6 border border-border shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">Interview Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground leading-relaxed">{reportData.overallSummary}</p>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="border border-border shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Communication</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-primary">{reportData.communicationScore}%</span>
              </div>
              <Progress value={reportData.communicationScore} className="h-2 mt-2" />
            </CardContent>
          </Card>

          <Card className="border border-border shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Confidence</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-primary">{reportData.confidenceScore}%</span>
              </div>
              <Progress value={reportData.confidenceScore} className="h-2 mt-2" />
            </CardContent>
          </Card>

          <Card className="border border-border shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Technical Depth</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-primary">{reportData.technicalScore}%</span>
              </div>
              <Progress value={reportData.technicalScore} className="h-2 mt-2" />
            </CardContent>
          </Card>

          <Card className="border border-border shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Grammar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-primary">{reportData.grammarScore}%</span>
              </div>
              <Progress value={reportData.grammarScore} className="h-2 mt-2" />
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="border border-border shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">Performance Breakdown</CardTitle>
              <CardDescription>Detailed scoring across key areas</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="category" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                  <Bar dataKey="score" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border border-border shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">Skills Assessment</CardTitle>
              <CardDescription>Comprehensive evaluation across competencies</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="skill" stroke="hsl(var(--muted-foreground))" />
                  <PolarRadiusAxis stroke="hsl(var(--muted-foreground))" domain={[0, 100]} />
                  <Radar name="Your Score" dataKey="A" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.5} />
                  <Legend />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {reportData.strengths.length > 0 && (
          <Card className="mb-6 border-l-4 border-l-success border border-border">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-success" />
                <CardTitle className="text-success">Key Strengths</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {reportData.strengths.map((strength: string, index: number) => (
                  <li key={index} className="flex items-start gap-3 p-3 rounded-lg bg-success/5">
                    <CheckCircle2 className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-foreground">{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {reportData.weaknesses.length > 0 && (
          <Card className="mb-6 border-l-4 border-l-destructive border border-border">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-destructive" />
                <CardTitle className="text-destructive">Areas of Concern</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {reportData.weaknesses.map((weakness: string, index: number) => (
                  <li key={index} className="flex items-start gap-3 p-3 rounded-lg bg-destructive/5">
                    <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-foreground">{weakness}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {reportData.improvements.length > 0 && (
          <Card className="mb-6 border-l-4 border-l-warning border border-border">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warning" />
                <CardTitle className="text-warning">Recommended Improvements</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {reportData.improvements.map((improvement: string, index: number) => (
                  <li key={index} className="flex items-start gap-3 p-3 rounded-lg bg-warning/5">
                    <AlertTriangle className="w-5 h-5 text-warning mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-foreground">{improvement}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Proctoring Results - Dynamic */}
        <ProctoringSection
          flags={proctoringData?.flags || []}
          onScreenshotClick={(url) => setSelectedScreenshot(url)}
        />

        {/* Screenshot Dialog */}
        <Dialog open={!!selectedScreenshot} onOpenChange={() => setSelectedScreenshot(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Proctoring Evidence</DialogTitle>
            </DialogHeader>
            {selectedScreenshot && (
              <img
                src={selectedScreenshot}
                alt="Proctoring screenshot"
                className="w-full rounded-lg border border-border"
              />
            )}
          </DialogContent>
        </Dialog>

        <div className="mt-8 p-6 bg-gradient-hero rounded-lg border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">Recommended Next Steps</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <Link to="/resume-analysis" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="text-sm">Optimize Your Resume</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">Improve your resume's ATS compatibility and get more interview calls</p>
                </CardContent>
              </Card>
            </Link>
            <Link to="/voice-interview" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="text-sm">Practice More</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">Take another mock interview to improve your skills</p>
                </CardContent>
              </Card>
            </Link>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardHeader>
                <CardTitle className="text-sm">Review Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Access our library of interview tips and best practices</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      </PageTransition>
    </DashboardLayout>
  );
};

export default InterviewReport;

// ============================================================================
// Proctoring Section Sub-Component
// ============================================================================

interface ProctoringFlag {
  id: string;
  flag_type: string;
  confidence_score: number | null;
  screenshot_url: string | null;
  source: string;
  details: unknown;
  timestamp: string;
}

const FLAG_CONFIG: Record<string, { icon: React.ElementType; label: string; color: string; severity: number }> = {
  NO_FACE: { icon: Camera, label: 'No Face Detected', color: 'text-red-500', severity: 3 },
  MULTIPLE_FACES: { icon: User, label: 'Multiple Faces', color: 'text-red-500', severity: 5 },
  LOOKING_AWAY: { icon: Eye, label: 'Looking Away', color: 'text-yellow-500', severity: 2 },
  TAB_SWITCH: { icon: Monitor, label: 'Tab Switch', color: 'text-orange-500', severity: 4 },
  PHONE_DETECTED: { icon: Phone, label: 'Phone Detected', color: 'text-red-600', severity: 8 },
  UNAUTHORIZED_OBJECT: { icon: ShieldAlert, label: 'Unauthorized Object', color: 'text-red-500', severity: 6 },
  SECONDARY_MONITOR: { icon: Monitor, label: 'Secondary Monitor', color: 'text-orange-500', severity: 5 },
  ANOTHER_PERSON: { icon: User, label: 'Another Person', color: 'text-red-600', severity: 7 },
  BACKGROUND_NOISE: { icon: Volume2, label: 'Background Noise', color: 'text-yellow-500', severity: 2 },
  FULLSCREEN_EXIT: { icon: Maximize, label: 'Exited Fullscreen', color: 'text-orange-500', severity: 4 },
  WEBCAM_DISCONNECT: { icon: Camera, label: 'Camera Disconnected', color: 'text-red-600', severity: 8 },
  CONTEXT_MENU_ATTEMPT: { icon: ShieldAlert, label: 'Context Menu Attempt', color: 'text-orange-500', severity: 3 },
  OTHER: { icon: AlertTriangle, label: 'Other', color: 'text-yellow-500', severity: 3 },
};

function ProctoringSection({
  flags,
  onScreenshotClick,
}: {
  flags: ProctoringFlag[];
  onScreenshotClick: (url: string) => void;
}) {
  // Count flags by type
  const countByType = flags.reduce<Record<string, number>>((acc, f) => {
    acc[f.flag_type] = (acc[f.flag_type] || 0) + 1;
    return acc;
  }, {});

  const noFaceCount = countByType['NO_FACE'] || 0;
  const lookingAwayCount = countByType['LOOKING_AWAY'] || 0;
  const tabSwitchCount = countByType['TAB_SWITCH'] || 0;
  const multipleFacesCount = countByType['MULTIPLE_FACES'] || 0;

  // Calculate trust score: deduct based on severity
  const totalDeduction = flags.reduce((sum, f) => {
    const config = FLAG_CONFIG[f.flag_type] || FLAG_CONFIG['OTHER'];
    return sum + config.severity;
  }, 0);
  const trustScore = Math.max(0, 100 - totalDeduction);

  const getTrustColor = () => {
    if (trustScore >= 80) return 'text-green-500';
    if (trustScore >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getTrustBgColor = () => {
    if (trustScore >= 80) return 'bg-green-500/10 border-green-500/20';
    if (trustScore >= 50) return 'bg-yellow-500/10 border-yellow-500/20';
    return 'bg-red-500/10 border-red-500/20';
  };

  const getTrustBarColor = () => {
    if (trustScore >= 80) return 'bg-green-500';
    if (trustScore >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getVerdict = () => {
    if (trustScore >= 80) return 'Passed';
    if (trustScore >= 50) return 'Warning';
    return 'Failed';
  };

  return (
    <Card className="mb-6 border border-border shadow-md">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          <CardTitle className="text-lg">Trust & Safety / Proctoring Analysis</CardTitle>
        </div>
        <CardDescription>AI-powered integrity monitoring during the interview</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className={`text-center p-3 rounded-lg border ${getTrustBgColor()}`}>
            <Shield className={`w-5 h-5 mx-auto mb-1 ${getTrustColor()}`} />
            <p className={`text-2xl font-bold ${getTrustColor()}`}>{trustScore}%</p>
            <p className="text-xs text-muted-foreground">Trust Score</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50 border border-border">
            <Camera className={`w-5 h-5 mx-auto mb-1 ${noFaceCount > 0 ? 'text-red-400' : 'text-muted-foreground'}`} />
            <p className="text-2xl font-bold text-foreground">{noFaceCount}</p>
            <p className="text-xs text-muted-foreground">No Face</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50 border border-border">
            <Eye className={`w-5 h-5 mx-auto mb-1 ${lookingAwayCount > 0 ? 'text-yellow-400' : 'text-muted-foreground'}`} />
            <p className="text-2xl font-bold text-foreground">{lookingAwayCount}</p>
            <p className="text-xs text-muted-foreground">Looked Away</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50 border border-border">
            <AlertTriangle className={`w-5 h-5 mx-auto mb-1 ${tabSwitchCount > 0 ? 'text-orange-400' : 'text-muted-foreground'}`} />
            <p className="text-2xl font-bold text-foreground">{tabSwitchCount}</p>
            <p className="text-xs text-muted-foreground">Tab Switches</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50 border border-border">
            <User className={`w-5 h-5 mx-auto mb-1 ${multipleFacesCount > 0 ? 'text-red-400' : 'text-muted-foreground'}`} />
            <p className="text-2xl font-bold text-foreground">{multipleFacesCount}</p>
            <p className="text-xs text-muted-foreground">Multi-Face</p>
          </div>
        </div>

        {/* Trust bar */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getTrustBarColor()}`}
              style={{ width: `${trustScore}%` }}
            />
          </div>
          <Badge variant="default" className={getTrustBarColor()}>
            {getVerdict()}
          </Badge>
        </div>

        {/* Violation Timeline */}
        {flags.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Violation Timeline
            </h4>
            <div className="relative pl-6 space-y-4">
              {/* Vertical line */}
              <div className="absolute left-2 top-2 bottom-2 w-px bg-border" />

              {flags.map((flag) => {
                const config = FLAG_CONFIG[flag.flag_type] || FLAG_CONFIG['OTHER'];
                const IconComponent = config.icon;
                const details = flag.details as Record<string, string> | null;

                return (
                  <div key={flag.id} className="relative flex items-start gap-3">
                    {/* Timeline dot */}
                    <div className={`absolute -left-4 mt-1 w-4 h-4 rounded-full border-2 border-background flex items-center justify-center ${
                      config.severity >= 6 ? 'bg-red-500' : config.severity >= 4 ? 'bg-orange-500' : 'bg-yellow-500'
                    }`}>
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    </div>

                    <div className="flex-1 bg-muted/30 rounded-lg p-3 border border-border">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <IconComponent className={`w-4 h-4 ${config.color}`} />
                          <span className="text-sm font-medium text-foreground">{config.label}</span>
                          <Badge variant="outline" className="text-[10px] px-1.5">
                            {flag.source === 'vision_llm' ? 'AI Vision' : 'Client CV'}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(flag.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </div>

                      {details?.reason && (
                        <p className="text-xs text-muted-foreground mt-1">{details.reason}</p>
                      )}

                      <div className="flex items-center gap-3 mt-2">
                        {flag.confidence_score != null && flag.confidence_score > 0 && (
                          <span className="text-[10px] text-muted-foreground">
                            Confidence: {Math.round(flag.confidence_score * 100)}%
                          </span>
                        )}

                        {flag.screenshot_url && (
                          <button
                            onClick={() => onScreenshotClick(flag.screenshot_url!)}
                            className="text-[10px] text-primary hover:underline flex items-center gap-1"
                          >
                            <Camera className="w-3 h-3" />
                            View Evidence
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {flags.length === 0 && (
          <div className="text-center py-4 text-sm text-muted-foreground">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-500" />
            No violations detected during this interview.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
