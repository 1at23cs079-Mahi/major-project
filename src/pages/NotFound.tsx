import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GraduationCap, Home, ArrowLeft, FileText, MessageSquare, LayoutDashboard } from "lucide-react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

const NotFound = () => {
  useDocumentTitle("Page Not Found");

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center space-y-8">
        {/* Animated 404 */}
        <div className="relative">
          <h1 className="text-[10rem] font-extrabold leading-none text-muted/20 select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center shadow-lg animate-bounce">
              <GraduationCap className="w-10 h-10 text-primary-foreground" />
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-foreground">
            Page not found
          </h2>
          <p className="text-muted-foreground max-w-sm mx-auto">
            The page you're looking for doesn't exist or has been moved.
            Let's get you back on track.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/">
            <Button className="bg-gradient-primary hover:opacity-90 transition-opacity w-full sm:w-auto">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>

        {/* Quick Links */}
        <div className="pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground mb-4">Or try one of these pages:</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <LayoutDashboard className="w-3.5 h-3.5 mr-1.5" />
                Dashboard
              </Button>
            </Link>
            <Link to="/resume-analysis">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <FileText className="w-3.5 h-3.5 mr-1.5" />
                Resume Analysis
              </Button>
            </Link>
            <Link to="/voice-interview">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                Mock Interview
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
