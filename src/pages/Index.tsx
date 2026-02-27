import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GraduationCap, FileCheck, MessageSquare, TrendingUp, ArrowRight, CheckCircle2, Moon, Sun, Users, Zap, Award, Star } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useTheme } from "@/hooks/useTheme";
import { useCountUp } from "@/hooks/useCountUp";
import ScrollToTop from "@/components/ScrollToTop";

const Index = () => {
  const { theme, toggleTheme } = useTheme();
  const usersCount = useCountUp(10000);
  const interviewsCount = useCountUp(50000);
  const successCount = useCountUp(95);
  const responseCount = useCountUp(2);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">HiREady</h1>
              <p className="text-xs text-muted-foreground">AI Interview Coach</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <Link to="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/signup">
              <Button className="bg-gradient-primary hover:opacity-90 transition-opacity">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-hero py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-5xl font-bold text-foreground mb-6">
                Ace Your Next Interview with{" "}
                <span className="text-primary">AI-Powered</span> Preparation
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Get personalized feedback on your resume and practice with our autonomous AI interviewer. Build confidence and land your dream job.
              </p>
              <div className="flex gap-4">
                <Link to="/signup">
                  <Button size="lg" className="bg-gradient-primary hover:opacity-90 transition-opacity">
                    Start Free Trial <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline">
                    Watch Demo
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="w-full aspect-video rounded-2xl shadow-xl bg-gradient-primary flex items-center justify-center">
                <GraduationCap className="w-24 h-24 text-primary-foreground opacity-50" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-b border-border bg-card">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div ref={usersCount.ref}>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="w-5 h-5 text-primary" />
                <span className="text-3xl font-bold text-foreground">{usersCount.count.toLocaleString()}+</span>
              </div>
              <p className="text-sm text-muted-foreground">Active Users</p>
            </div>
            <div ref={interviewsCount.ref}>
              <div className="flex items-center justify-center gap-2 mb-2">
                <MessageSquare className="w-5 h-5 text-accent" />
                <span className="text-3xl font-bold text-foreground">{interviewsCount.count.toLocaleString()}+</span>
              </div>
              <p className="text-sm text-muted-foreground">Interviews Practiced</p>
            </div>
            <div ref={successCount.ref}>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Award className="w-5 h-5 text-success" />
                <span className="text-3xl font-bold text-foreground">{successCount.count}%</span>
              </div>
              <p className="text-sm text-muted-foreground">Success Rate</p>
            </div>
            <div ref={responseCount.ref}>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-warning" />
                <span className="text-3xl font-bold text-foreground">&lt;{responseCount.count}s</span>
              </div>
              <p className="text-sm text-muted-foreground">AI Response Time</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-foreground mb-4">
              Everything You Need to Succeed
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our AI-powered platform provides comprehensive interview preparation tools to help you stand out
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-border">
              <div className="w-14 h-14 rounded-lg bg-accent/10 flex items-center justify-center mb-6">
                <FileCheck className="w-7 h-7 text-accent" />
              </div>
              <h4 className="text-xl font-semibold text-foreground mb-3">AI Resume Analysis</h4>
              <p className="text-muted-foreground mb-4">
                Get instant feedback on your resume's ATS compatibility, strengths, and areas for improvement
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">ATS compatibility score</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">Keyword optimization tips</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">Role-specific suggestions</span>
                </li>
              </ul>
            </div>

            <div className="bg-card p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-border">
              <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                <MessageSquare className="w-7 h-7 text-primary" />
              </div>
              <h4 className="text-xl font-semibold text-foreground mb-3">Real-Time Mock Interviews</h4>
              <p className="text-muted-foreground mb-4">
                Practice with our autonomous AI interviewer that adapts questions based on your responses
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">Autonomous question flow</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">Real-time transcript</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">Natural conversation flow</span>
                </li>
              </ul>
            </div>

            <div className="bg-card p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-border">
              <div className="w-14 h-14 rounded-lg bg-metric/10 flex items-center justify-center mb-6">
                <TrendingUp className="w-7 h-7 text-metric" />
              </div>
              <h4 className="text-xl font-semibold text-foreground mb-3">Detailed Performance Insights</h4>
              <p className="text-muted-foreground mb-4">
                Receive comprehensive feedback on your interview performance with actionable insights
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">Confidence & communication scores</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">Content relevance analysis</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">Improvement recommendations</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-card border-t border-border">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-foreground mb-4">
              How It Works
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get interview-ready in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-primary-foreground">1</span>
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-2">Upload Your Resume</h4>
              <p className="text-sm text-muted-foreground">
                Upload your resume and get instant AI-powered analysis with ATS compatibility scoring
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-accent flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-accent-foreground">2</span>
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-2">Practice Interview</h4>
              <p className="text-sm text-muted-foreground">
                Have a realistic voice interview with our AI that adapts questions based on your resume and role
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-primary-foreground">3</span>
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-2">Get Your Report</h4>
              <p className="text-sm text-muted-foreground">
                Receive detailed scores on communication, confidence, technical ability, and actionable improvement tips
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-foreground mb-4">
              What Our Users Say
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Hear from candidates who landed their dream jobs with HiREady
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-warning text-warning" />
                ))}
              </div>
              <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                "HiREady completely transformed my interview prep. The AI interviewer felt like a real conversation, and the feedback helped me identify weaknesses I didn't know I had."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
                  <span className="text-sm font-bold text-primary-foreground">PS</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Priya S.</p>
                  <p className="text-xs text-muted-foreground">Software Engineer at Google</p>
                </div>
              </div>
            </div>

            <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-warning text-warning" />
                ))}
              </div>
              <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                "The resume analysis caught formatting issues that were getting me rejected by ATS systems. After fixing them, I started getting callbacks within a week."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-accent flex items-center justify-center">
                  <span className="text-sm font-bold text-accent-foreground">MR</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Marcus R.</p>
                  <p className="text-xs text-muted-foreground">Data Analyst at Amazon</p>
                </div>
              </div>
            </div>

            <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-warning text-warning" />
                ))}
              </div>
              <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                "As a career switcher, I was terrified of interviews. HiREady's mock interviews gave me the confidence I needed. The detailed scoring helped me track my improvement over time."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
                  <span className="text-sm font-bold text-primary-foreground">AL</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Aisha L.</p>
                  <p className="text-xs text-muted-foreground">Product Manager at Stripe</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-card border-t border-border">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to know about HiREady
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-left text-foreground hover:no-underline">
                  How does the AI interview work?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Our AI interviewer uses advanced language models to conduct realistic mock interviews. It asks role-specific questions, follows up based on your answers, and evaluates your responses in real-time for communication, confidence, technical accuracy, and grammar.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger className="text-left text-foreground hover:no-underline">
                  What file formats are supported for resume upload?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  We support PDF, DOC, and DOCX file formats. For best results, we recommend uploading your resume as a PDF to preserve formatting. The maximum file size is 10MB.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger className="text-left text-foreground hover:no-underline">
                  How accurate is the ATS compatibility score?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Our ATS scoring algorithm analyzes your resume against the same criteria used by major Applicant Tracking Systems. It checks formatting, keyword density, section structure, and role alignment to give you a comprehensive compatibility score with actionable improvement suggestions.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger className="text-left text-foreground hover:no-underline">
                  Can I practice for specific roles or industries?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes! You can specify your target role, experience level, and industry before starting a mock interview. The AI will tailor its questions accordingly, covering both behavioral and technical aspects relevant to your specific career path.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger className="text-left text-foreground hover:no-underline">
                  Is my data secure and private?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Absolutely. Your resume data and interview recordings are encrypted and stored securely. We never share your personal information with third parties. You can delete your data at any time from your account settings.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6">
                <AccordionTrigger className="text-left text-foreground hover:no-underline">
                  How many mock interviews can I take?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  There's no limit to the number of mock interviews you can take. We encourage you to practice regularly to track your improvement over time. Each interview generates a detailed report you can review anytime.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-primary py-20">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-4xl font-bold text-primary-foreground mb-6">
            Ready to Ace Your Next Interview?
          </h3>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Join thousands of job seekers who have improved their interview skills with HiREady
          </p>
          <Link to="/signup">
            <Button size="lg" variant="secondary" className="bg-card hover:bg-card/90">
              Get Started for Free <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} HiREady. All rights reserved.
          </p>
        </div>
      </footer>

      <ScrollToTop />
    </div>
  );
};

export default Index;
