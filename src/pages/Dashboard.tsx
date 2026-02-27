import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FileUp, MessageSquare, ArrowRight, FileText, Mic, BarChart3, Clock, CheckCircle2, AlertCircle, Rocket, PartyPopper, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useResume } from "@/hooks/useResume";
import { useInterview } from "@/hooks/useInterview";
import { isSupabaseConfigured } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import PageTransition from "@/components/PageTransition";
import { toast } from "sonner";

interface ResumeAnalysis {
  overall_score?: number;
  atsScore?: number;
  skills_score?: number;
  experience_score?: number;
  communication_score?: number;
}

interface InterviewAnalysis {
  overallScore?: number;
  communicationScore?: number;
  confidenceScore?: number;
  technicalScore?: number;
  grammarScore?: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const { resumes, isLoadingResumes } = useResume();
  const { interviews, isLoadingInterviews } = useInterview();
  const isLoading = isSupabaseConfigured ? (isLoadingResumes || isLoadingInterviews) : false;
  const [progress, setProgress] = useState<number>(0);

  useDocumentTitle("Dashboard");

  // Demo data when Supabase is not configured
  const demoResumes = !isSupabaseConfigured ? [
    { id: 'demo-1', file_name: 'resume_john_doe.pdf', target_role: 'Frontend Developer', created_at: new Date().toISOString(), analysis_result: { overall_score: 82, atsScore: 82 } },
    { id: 'demo-2', file_name: 'resume_v2.pdf', target_role: 'Full Stack Engineer', created_at: new Date(Date.now() - 86400000).toISOString(), analysis_result: { overall_score: 74, atsScore: 74 } },
  ] : null;
  const demoInterviews = !isSupabaseConfigured ? [
    { id: 'demo-1', status: 'completed', created_at: new Date().toISOString(), analysis_result: { overallScore: 78, communicationScore: 85, confidenceScore: 72, technicalScore: 80, grammarScore: 90 } },
    { id: 'demo-2', status: 'completed', created_at: new Date(Date.now() - 172800000).toISOString(), analysis_result: { overallScore: 65, communicationScore: 70, confidenceScore: 60, technicalScore: 68, grammarScore: 85 } },
  ] : null;

  const effectiveResumes = (resumes?.length ? resumes : demoResumes) as typeof resumes;
  const effectiveInterviews = (interviews?.length ? interviews : demoInterviews) as typeof interviews;

  const latestResume = effectiveResumes?.[0];
  const latestInterview = effectiveInterviews?.[0];
  const hasCompletedInterview = latestInterview?.status === 'completed';

  useEffect(() => {
    let calculatedProgress = 0;
    if (effectiveResumes && effectiveResumes.length > 0) calculatedProgress += 25;
    if (latestResume?.analysis_result) calculatedProgress += 25;
    if (effectiveInterviews && effectiveInterviews.length > 0) calculatedProgress += 25;
    if (hasCompletedInterview) calculatedProgress += 25;
    setProgress(calculatedProgress);
  }, [effectiveResumes, latestResume, effectiveInterviews, hasCompletedInterview]);

  useEffect(() => {
    if (progress === 100) {
      const shown = sessionStorage.getItem('hiready-celebration-shown');
      if (!shown) {
        toast.success("You've completed all preparation steps!", {
          icon: <PartyPopper className="w-4 h-4" />,
          duration: 5000,
        });
        sessionStorage.setItem('hiready-celebration-shown', 'true');
      }
    }
  }, [progress]);

  return (
    <DashboardLayout>
      <PageTransition>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {user?.user_metadata?.full_name || 'there'}
          </h1>
          <p className="text-muted-foreground">Ready to ace your next interview?</p>
        </div>

        {/* Progress Card */}
        {!isLoading && !effectiveResumes?.length && !effectiveInterviews?.length && (
          <Card className="mb-8 border-2 border-dashed border-primary/30 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center flex-shrink-0">
                  <Rocket className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-1">Get Started with HiREady</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Complete these steps to prepare for your next interview
                  </p>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <Link to="/resume-analysis">
                      <div className="p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">1</span>
                          <span className="text-sm font-medium text-foreground">Upload Resume</span>
                        </div>
                        <p className="text-xs text-muted-foreground ml-7">Get your ATS score</p>
                      </div>
                    </Link>
                    <Link to="/voice-interview">
                      <div className="p-3 rounded-lg border border-border hover:border-accent/50 hover:bg-accent/5 transition-all cursor-pointer">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-5 h-5 rounded-full bg-accent text-accent-foreground text-xs flex items-center justify-center font-bold">2</span>
                          <span className="text-sm font-medium text-foreground">Mock Interview</span>
                        </div>
                        <p className="text-xs text-muted-foreground ml-7">Practice with AI</p>
                      </div>
                    </Link>
                    <Link to="/profile">
                      <div className="p-3 rounded-lg border border-border hover:border-success/50 hover:bg-success/5 transition-all cursor-pointer">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-5 h-5 rounded-full bg-success text-success-foreground text-xs flex items-center justify-center font-bold">3</span>
                          <span className="text-sm font-medium text-foreground">Set Preferences</span>
                        </div>
                        <p className="text-xs text-muted-foreground ml-7">Target role & level</p>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Progress Card */}
        <Card className="mb-8 border-0 shadow-lg bg-gradient-primary">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-primary-foreground mb-2">Your Progress</CardTitle>
                <CardDescription className="text-primary-foreground/80">
                  Complete your interview preparation journey
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-primary-foreground">{progress}%</div>
                <p className="text-sm text-primary-foreground/80">Complete</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={progress} className="h-2 bg-primary-foreground/20" />
            <div className="grid grid-cols-4 gap-4 mt-6">
              <div className="text-center">
                <p className="text-sm text-primary-foreground/80 mb-1">Resume Upload</p>
                <p className="text-xs text-primary-foreground/60">{progress >= 25 ? "Done" : "Pending"}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-primary-foreground/80 mb-1">Analysis</p>
                <p className="text-xs text-primary-foreground/60">{progress >= 50 ? "Done" : "Pending"}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-primary-foreground/80 mb-1">Interview</p>
                <p className="text-xs text-primary-foreground/60">{progress >= 75 ? "Done" : "Pending"}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-primary-foreground/80 mb-1">Complete</p>
                <p className="text-xs text-primary-foreground/60">{progress === 100 ? "Done" : "Pending"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border border-border shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <FileUp className="w-6 h-6 text-accent" />
              </div>
              <CardTitle>Upload Your Resume</CardTitle>
              <CardDescription>
                Get started with AI-powered resume analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/resume-analysis">
                <Button className="bg-gradient-accent hover:opacity-90 transition-opacity">
                  Upload Resume <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border border-border shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Start Mock Interview</CardTitle>
              <CardDescription>
                Practice with our autonomous AI interviewer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to={latestResume ? `/voice-interview?resumeId=${latestResume.id}` : "/voice-interview"}>
                <Button className="bg-gradient-primary hover:opacity-90 transition-opacity">
                  Start Interview <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border border-border shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-success" />
              </div>
              <CardTitle>View Reports</CardTitle>
              <CardDescription>
                Review your interview performance and insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to={latestInterview && hasCompletedInterview ? `/interview-report/${latestInterview.id}` : "#"}>
                <Button
                  className="bg-gradient-accent hover:opacity-90 transition-opacity"
                  disabled={!hasCompletedInterview}
                >
                  View Report <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              {!hasCompletedInterview && (
                <p className="text-xs text-muted-foreground mt-2">
                  Complete an interview to unlock reports
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">ATS Score</CardTitle>
              <div className="w-10 h-10 rounded-lg bg-metric/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-metric" />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div>
                  <Skeleton className="h-9 w-20 mb-1" />
                  <Skeleton className="h-4 w-40 mt-1" />
                </div>
              ) : (
                <>
                  <div className="text-3xl font-bold text-foreground">
                    {(() => {
                      const analysis = latestResume?.analysis_result as ResumeAnalysis | null;
                      return analysis?.overall_score ?? analysis?.atsScore ?? 0;
                    })()}%
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {latestResume?.analysis_result ? "Resume compatibility score" : "Upload resume to see score"}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Interview Score</CardTitle>
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Mic className="w-5 h-5 text-warning" />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div>
                  <Skeleton className="h-9 w-20 mb-1" />
                  <Skeleton className="h-4 w-48 mt-1" />
                </div>
              ) : (
                <>
                  <div className="text-3xl font-bold text-foreground">
                    {(() => {
                      const analysis = latestInterview?.analysis_result as InterviewAnalysis | null;
                      return analysis?.overallScore ?? 0;
                    })()}%
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {hasCompletedInterview ? "Interview performance score" : "Complete interview to see score"}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="mt-8 border border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Recent Activity
            </CardTitle>
            <CardDescription>Your latest resume analyses and interview sessions</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-3">
                    <Skeleton className="w-10 h-10 rounded-lg" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-40 mb-2" />
                      <Skeleton className="h-3 w-28" />
                    </div>
                    <Skeleton className="h-5 w-12" />
                  </div>
                ))}
              </div>
            ) : (!effectiveResumes?.length && !effectiveInterviews?.length) ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No activity yet. Start by uploading a resume or taking an interview.
              </p>
            ) : (
              <div className="space-y-3">
                {effectiveResumes?.slice(0, 3).map((resume) => {
                  const analysis = resume.analysis_result as ResumeAnalysis | null;
                  const score = analysis?.overall_score ?? analysis?.atsScore;
                  return (
                    <Link
                      key={resume.id}
                      to={analysis ? `/resume-report/${resume.id}` : '#'}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{resume.file_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {resume.target_role || 'Resume'} &middot; {new Date(resume.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {analysis ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-success" />
                            <span className="text-sm font-medium text-foreground">{score}%</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-4 h-4 text-warning" />
                            <span className="text-xs text-muted-foreground">Pending</span>
                          </>
                        )}
                      </div>
                    </Link>
                  );
                })}
                {effectiveInterviews?.slice(0, 3).map((interview) => {
                  const analysis = interview.analysis_result as InterviewAnalysis | null;
                  return (
                    <Link
                      key={interview.id}
                      to={interview.status === 'completed' ? `/interview-report/${interview.id}` : '#'}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Mic className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">Mock Interview</p>
                        <p className="text-xs text-muted-foreground">
                          {interview.status === 'completed' ? 'Completed' : 'In progress'} &middot; {new Date(interview.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {interview.status === 'completed' ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-success" />
                            <span className="text-sm font-medium text-foreground">{analysis?.overallScore ?? 0}%</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-4 h-4 text-warning" />
                            <span className="text-xs text-muted-foreground">In progress</span>
                          </>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      </PageTransition>
    </DashboardLayout>
  );
};

export default Dashboard;
