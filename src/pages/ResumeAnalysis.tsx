import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText, Target, TrendingUp, CheckCircle2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useResume } from "@/hooks/useResume";
import { isSupabaseConfigured } from "@/integrations/supabase/client";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

const ResumeAnalysis = () => {
  const navigate = useNavigate();
  const { uploadResume, analyzeResume } = useResume();
  const [file, setFile] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useDocumentTitle("Resume Analysis");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      setFile(selectedFile);
      toast.success("File selected: " + selectedFile.name);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type === "application/pdf" || droppedFile.name.endsWith(".docx") || droppedFile.name.endsWith(".doc"))) {
      if (droppedFile.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      setFile(droppedFile);
      toast.success("File selected: " + droppedFile.name);
    } else {
      toast.error("Please upload a PDF, DOC, or DOCX file");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleAnalyze = async () => {
    if (!file) {
      toast.error("Please upload your resume");
      return;
    }
    if (!targetRole) {
      toast.error("Please enter your target role");
      return;
    }
    if (!experienceLevel) {
      toast.error("Please select your experience level");
      return;
    }

    setIsAnalyzing(true);

    try {
      if (!isSupabaseConfigured) {
        // Demo mode: simulate analysis with a short delay
        await new Promise(r => setTimeout(r, 1500));
        toast.success("Demo mode: Resume analyzed! Connect Supabase for real results.");
        navigate("/dashboard");
        return;
      }

      const uploadResult = await uploadResume.mutateAsync({
        file,
        targetRole,
        experienceLevel,
      });

      await analyzeResume.mutateAsync({
        resumeId: uploadResult.resumeId,
        fileName: file.name,
        fileSize: file.size,
      });

      toast.success("Resume analyzed successfully!");
      navigate(`/resume-report/${uploadResult.resumeId}`);
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Resume Analysis</h1>
          <p className="text-muted-foreground">
            Get AI-powered insights on your resume's ATS compatibility, strengths, and areas for improvement
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="border border-border shadow-md">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <CardTitle>Upload Your Resume</CardTitle>
                    <CardDescription>Drag & drop or browse to upload</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                    isDragging
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Upload className="w-8 h-8 text-primary" />
                    </div>
                    {file ? (
                      <div>
                        <p className="text-sm font-medium text-foreground">{file.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {(file.size / 1024).toFixed(2)} KB
                        </p>
                        <Input
                          id="file-change"
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <Label htmlFor="file-change">
                          <Button variant="outline" size="sm" className="mt-3" asChild>
                            <span>Change File</span>
                          </Button>
                        </Label>
                      </div>
                    ) : (
                      <>
                        <div>
                          <p className="text-sm font-medium text-foreground mb-1">
                            Upload Your Resume
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Drag & drop your resume here, or click to browse
                          </p>
                        </div>
                        <Input
                          id="file-upload"
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <Label htmlFor="file-upload">
                          <Button variant="outline" asChild>
                            <span>Browse Files</span>
                          </Button>
                        </Label>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">
                    Supported formats: PDF, DOC, DOCX (Max 10MB)
                  </p>
                </div>

                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="targetRole">Target Role *</Label>
                    <Input
                      id="targetRole"
                      placeholder="e.g. Software Engineer, Data Scientist"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experienceLevel">Experience Level *</Label>
                    <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
                        <SelectItem value="mid">Mid Level (3-5 years)</SelectItem>
                        <SelectItem value="senior">Senior Level (6-10 years)</SelectItem>
                        <SelectItem value="lead">Lead/Principal (10+ years)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
                >
                  {isAnalyzing ? (
                    <>
                      <Sparkles className="mr-2 w-4 h-4 animate-spin" />
                      Analyzing Resume...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 w-4 h-4" />
                      Analyze Resume
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border border-border">
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center mb-2">
                  <Target className="w-5 h-5 text-success" />
                </div>
                <CardTitle className="text-lg">What You'll Get</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">ATS compatibility score</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">Strength & weakness analysis</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">Keyword optimization tips</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">Role-specific suggestions</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">Interview prep insights</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border bg-gradient-hero">
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <CardTitle className="text-lg">Boost Your Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Candidates with optimized resumes are <strong className="text-primary">3x more likely</strong> to get interview calls
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ResumeAnalysis;
