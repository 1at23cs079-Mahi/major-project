import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import Breadcrumb from "@/components/Breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, CheckCircle2, AlertTriangle, AlertCircle, TrendingUp, Loader2, RefreshCw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

const getScoreLabel = (score: number): string => {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 50) return "Needs improvement";
  return "Low";
};

const getScoreColor = (score: number): string => {
  if (score >= 85) return "text-green-500";
  if (score >= 70) return "text-blue-500";
  if (score >= 50) return "text-yellow-500";
  return "text-red-500";
};

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

const ResumeReport = () => {
  const { resumeId } = useParams<{ resumeId: string }>();
  const queryClient = useQueryClient();

  useDocumentTitle("Resume Report");

  const { data: resume, isLoading } = useQuery({
    queryKey: ['resume', resumeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('id', resumeId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!resumeId && isSupabaseConfigured,
    refetchInterval: (query) => {
      // Auto-refetch while analysis is still processing
      const result = query.state.data?.analysis_result;
      if (result && typeof result === 'object' && 'status' in result && result.status === 'processing') {
        return 3000;
      }
      return false;
    },
  });

  const analysis = resume?.analysis_result as Record<string, unknown> | null;
  const isProcessing = analysis && typeof analysis === 'object' && 'status' in analysis && analysis.status === 'processing';

  // Extract data from the LLM analysis result — wrap in useMemo for referential stability
  const sections = useMemo(() =>
    (analysis?.sections as Record<string, { score: number; present: boolean; feedback: string; suggestions: string[] }>) || {},
    [analysis]
  );
  const parsedData = useMemo(() =>
    (analysis?.parsed_data as Record<string, unknown>) || {},
    [analysis]
  );
  const keywordAnalysis = useMemo(() =>
    (analysis?.keyword_analysis as { matched_keywords: string[]; missing_keywords: string[]; keyword_density_score: number }) || null,
    [analysis]
  );
  const atsCompat = useMemo(() =>
    (analysis?.ats_compatibility as { score: number; issues: string[]; suggestions: string[] }) || null,
    [analysis]
  );
  const suggestions = useMemo(() =>
    (analysis?.improvement_suggestions as { category: string; priority: string; current: string; recommended: string }[]) || [],
    [analysis]
  );
  const overallScore = (analysis?.overall_score as number) || 0;

  // Build score data for charts
  const scoreData = useMemo(() => [
    { name: 'Contact', score: sections.contact_info?.score || 0 },
    { name: 'Summary', score: sections.summary?.score || 0 },
    { name: 'Experience', score: sections.experience?.score || 0 },
    { name: 'Education', score: sections.education?.score || 0 },
    { name: 'Skills', score: sections.skills?.score || 0 },
    { name: 'Format', score: sections.formatting?.score || 0 },
  ], [sections]);

  // Build skills data for pie chart
  const skills = useMemo(() =>
    (parsedData.skills as string[]) || [],
    [parsedData]
  );
  const skillCategories = useMemo(() => {
    const categories: Record<string, number> = {};
    skills.forEach(skill => {
      const lower = skill.toLowerCase();
      if (['javascript', 'typescript', 'python', 'java', 'c++', 'rust', 'go', 'react', 'node', 'sql', 'html', 'css', 'aws', 'docker', 'kubernetes'].some(t => lower.includes(t))) {
        categories['Technical'] = (categories['Technical'] || 0) + 1;
      } else if (['leadership', 'communication', 'teamwork', 'management', 'agile', 'scrum'].some(t => lower.includes(t))) {
        categories['Soft Skills'] = (categories['Soft Skills'] || 0) + 1;
      } else if (['git', 'jira', 'figma', 'vscode', 'postman', 'jenkins', 'ci/cd'].some(t => lower.includes(t))) {
        categories['Tools'] = (categories['Tools'] || 0) + 1;
      } else {
        categories['Other'] = (categories['Other'] || 0) + 1;
      }
    });
    if (Object.keys(categories).length === 0) {
      return [{ name: 'Technical', value: 45 }, { name: 'Soft Skills', value: 25 }, { name: 'Tools', value: 20 }, { name: 'Other', value: 10 }];
    }
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [skills]);

  // Strengths from sections with good scores
  const strengths = useMemo(() => {
    const result: string[] = [];
    Object.entries(sections).forEach(([, section]) => {
      if (section.score >= 70 && section.feedback) {
        result.push(section.feedback);
      }
    });
    if (keywordAnalysis && keywordAnalysis.keyword_density_score >= 70) {
      result.push(`Strong keyword match (${keywordAnalysis.matched_keywords.length} relevant keywords found)`);
    }
    return result.slice(0, 5);
  }, [sections, keywordAnalysis]);

  // Improvements from suggestions
  const improvements = useMemo(() => {
    return suggestions
      .filter(s => s.priority === 'medium' || s.priority === 'low')
      .map(s => s.recommended)
      .slice(0, 5);
  }, [suggestions]);

  // Critical issues
  const criticalIssues = useMemo(() => {
    const issues: string[] = [];
    suggestions
      .filter(s => s.priority === 'high')
      .forEach(s => issues.push(s.recommended));
    if (atsCompat) {
      atsCompat.issues.forEach(issue => issues.push(issue));
    }
    return issues.slice(0, 5);
  }, [suggestions, atsCompat]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (isProcessing) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <h2 className="text-xl font-semibold">Analyzing your resume...</h2>
          <p className="text-muted-foreground">This usually takes 10-30 seconds.</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!resume || !analysis || !analysis.overall_score) {
    return (
      <DashboardLayout>
        <div className="p-6 lg:p-8 max-w-6xl mx-auto">
          <Card className="border border-border shadow-md">
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">No analysis found for this resume.</p>
              <div className="flex justify-center mt-4 gap-3">
                <Button
                  variant="outline"
                  onClick={() => queryClient.invalidateQueries({ queryKey: ['resume', resumeId] })}
                >
                  <RefreshCw className="mr-2 w-4 h-4" />
                  Refresh
                </Button>
                <Link to="/resume-analysis">
                  <Button>Analyze a Resume</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const atsScore = atsCompat?.score || sections.formatting?.score || 0;
  const keywordScore = keywordAnalysis?.keyword_density_score || sections.skills?.score || 0;
  const formatScore = sections.formatting?.score || 0;

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-6xl mx-auto">
        <Breadcrumb items={[{ label: "Resume Analysis", href: "/resume-analysis" }, { label: "Resume Report" }]} />
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
              <h1 className="text-3xl font-bold text-foreground">Resume Analysis Report</h1>
              <p className="text-sm text-muted-foreground mt-1">
                For <span className="text-primary font-medium">{resume.target_role || 'General'}</span> position
                {resume.file_name && <span> &mdash; {resume.file_name}</span>}
              </p>
            </div>
          </div>
          <Link to="/resume-analysis">
            <Button className="bg-gradient-primary hover:opacity-90 transition-opacity">
              <FileText className="mr-2 w-4 h-4" />
              Upload New Resume
            </Button>
          </Link>
        </div>

        {/* Overall Score */}
        <Card className="mb-8 border border-border shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Overall Score</h2>
                <p className="text-muted-foreground">{getScoreLabel(overallScore)}</p>
              </div>
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="none" className="text-muted" />
                  <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="none" strokeDasharray={`${(overallScore / 100) * 251} 251`} className={getScoreColor(overallScore)} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold">{overallScore}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Three Score Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border border-border shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">ATS Compatibility</CardTitle>
              <CardDescription>How well your resume passes ATS systems</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20">
                  <svg className="w-20 h-20 transform -rotate-90">
                    <circle cx="40" cy="40" r="35" stroke="currentColor" strokeWidth="8" fill="none" className="text-muted" />
                    <circle cx="40" cy="40" r="35" stroke="currentColor" strokeWidth="8" fill="none" strokeDasharray={`${(atsScore / 100) * 220} 220`} className="text-green-500" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-foreground">{atsScore}%</span>
                  </div>
                </div>
                <div className="flex-1">
                  <Progress value={atsScore} className="h-2" />
                  <p className="text-sm text-muted-foreground mt-2">{getScoreLabel(atsScore)} compatibility</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">Keyword Match</CardTitle>
              <CardDescription>Relevance to target role requirements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20">
                  <svg className="w-20 h-20 transform -rotate-90">
                    <circle cx="40" cy="40" r="35" stroke="currentColor" strokeWidth="8" fill="none" className="text-muted" />
                    <circle cx="40" cy="40" r="35" stroke="currentColor" strokeWidth="8" fill="none" strokeDasharray={`${(keywordScore / 100) * 220} 220`} className="text-yellow-500" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-foreground">{keywordScore}%</span>
                  </div>
                </div>
                <div className="flex-1">
                  <Progress value={keywordScore} className="h-2" />
                  <p className="text-sm text-muted-foreground mt-2">{getScoreLabel(keywordScore)} match</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">Format Quality</CardTitle>
              <CardDescription>Structure and readability assessment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20">
                  <svg className="w-20 h-20 transform -rotate-90">
                    <circle cx="40" cy="40" r="35" stroke="currentColor" strokeWidth="8" fill="none" className="text-muted" />
                    <circle cx="40" cy="40" r="35" stroke="currentColor" strokeWidth="8" fill="none" strokeDasharray={`${(formatScore / 100) * 220} 220`} className="text-blue-500" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-foreground">{formatScore}%</span>
                  </div>
                </div>
                <div className="flex-1">
                  <Progress value={formatScore} className="h-2" />
                  <p className="text-sm text-muted-foreground mt-2">{getScoreLabel(formatScore)} format</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="border border-border shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">Section Scores</CardTitle>
              <CardDescription>Detailed analysis of each resume section</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={scoreData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                  <Bar dataKey="score" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border border-border shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">Skills Distribution</CardTitle>
              <CardDescription>Breakdown of skill categories found in your resume</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={skillCategories}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="hsl(var(--primary))"
                    dataKey="value"
                  >
                    {skillCategories.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Keywords */}
        {keywordAnalysis && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="border border-border shadow-md">
              <CardHeader>
                <CardTitle className="text-lg text-green-600">Matched Keywords</CardTitle>
                <CardDescription>Keywords found that match the target role</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {keywordAnalysis.matched_keywords.map((kw, i) => (
                    <Badge key={i} variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      {kw}
                    </Badge>
                  ))}
                  {keywordAnalysis.matched_keywords.length === 0 && (
                    <p className="text-sm text-muted-foreground">No matched keywords found</p>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card className="border border-border shadow-md">
              <CardHeader>
                <CardTitle className="text-lg text-red-600">Missing Keywords</CardTitle>
                <CardDescription>Important keywords to add to your resume</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {keywordAnalysis.missing_keywords.map((kw, i) => (
                    <Badge key={i} variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                      {kw}
                    </Badge>
                  ))}
                  {keywordAnalysis.missing_keywords.length === 0 && (
                    <p className="text-sm text-muted-foreground">All important keywords present</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Strengths */}
        {strengths.length > 0 && (
          <Card className="mb-6 border-l-4 border-l-green-500 border border-border">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <CardTitle className="text-green-600">Key Strengths</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-3 p-3 rounded-lg bg-green-500/5">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-foreground">{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Improvements */}
        {improvements.length > 0 && (
          <Card className="mb-6 border-l-4 border-l-yellow-500 border border-border">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                <CardTitle className="text-yellow-600">Areas for Improvement</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {improvements.map((improvement, index) => (
                  <li key={index} className="flex items-start gap-3 p-3 rounded-lg bg-yellow-500/5">
                    <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-foreground">{improvement}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Critical Issues */}
        {criticalIssues.length > 0 && (
          <Card className="border-l-4 border-l-red-500 border border-border mb-8">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <CardTitle className="text-red-600">Critical Issues to Fix</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {criticalIssues.map((issue, index) => (
                  <li key={index} className="flex items-start gap-3 p-3 rounded-lg bg-red-500/5">
                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-foreground">{issue}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Next Steps */}
        <div className="p-6 bg-gradient-hero rounded-lg border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">Recommended Next Steps</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <Link to="/resume-analysis" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="text-sm">Update & Re-analyze</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">Make improvements and upload your updated resume</p>
                </CardContent>
              </Card>
            </Link>
            <Link to="/voice-interview" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="text-sm">Practice Interview</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">Prepare for interviews with our AI interviewer</p>
                </CardContent>
              </Card>
            </Link>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardHeader>
                <CardTitle className="text-sm">
                  <TrendingUp className="w-4 h-4 inline mr-1" />
                  Success Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Learn best practices for resume optimization</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ResumeReport;
