import { useState, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { GraduationCap, LayoutDashboard, FileText, MessageSquare, LogOut, Menu, X, Moon, Sun, Settings, Keyboard, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { isSupabaseConfigured } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Show keyboard shortcuts hint on first visit
  useEffect(() => {
    const hasSeenHint = localStorage.getItem('hiready-shortcuts-shown');
    if (!hasSeenHint) {
      const timer = setTimeout(() => {
        toast("Keyboard shortcuts available!", {
          description: "Alt+1-4 to navigate, Alt+D for dark mode, Esc to close sidebar",
          duration: 6000,
          icon: <Keyboard className="w-4 h-4" />,
        });
        localStorage.setItem('hiready-shortcuts-shown', 'true');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Escape to close sidebar
    if (e.key === 'Escape' && isSidebarOpen) {
      setIsSidebarOpen(false);
      return;
    }

    // Only handle shortcuts when not typing in an input
    const tag = (e.target as HTMLElement).tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

    if (e.altKey) {
      switch (e.key) {
        case '1': e.preventDefault(); navigate('/dashboard'); break;
        case '2': e.preventDefault(); navigate('/resume-analysis'); break;
        case '3': e.preventDefault(); navigate('/voice-interview'); break;
        case '4': e.preventDefault(); navigate('/profile'); break;
        case 'd': e.preventDefault(); toggleTheme(); break;
      }
    }
  }, [isSidebarOpen, navigate, toggleTheme]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard, shortcut: "Alt+1" },
    { path: "/resume-analysis", label: "Resume Analysis", icon: FileText, shortcut: "Alt+2" },
    { path: "/voice-interview", label: "Mock Interview", icon: MessageSquare, shortcut: "Alt+3" },
    { path: "/profile", label: "Settings", icon: Settings, shortcut: "Alt+4" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-foreground">HiREady</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-sidebar border-r border-sidebar-border z-40 transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 w-64`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-sidebar-foreground">HiREady</h1>
              <p className="text-xs text-muted-foreground">AI Interview Coach</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </div>
                <span className="text-[10px] opacity-40 hidden lg:inline">{item.shortcut}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 mb-3">
            <Avatar>
              <AvatarFallback className="bg-primary text-primary-foreground">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-medium text-sidebar-foreground">
                {user?.user_metadata?.full_name || 'User'}
              </p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-sidebar-foreground hover:bg-sidebar-accent"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              onClick={() => signOut()}
              className="flex-1 justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen flex flex-col">
        <div className="flex-1">
          {!isSupabaseConfigured && (
            <div className="bg-primary/5 border-b border-primary/10 px-4 py-2 flex items-center justify-center gap-2 text-xs text-primary">
              <FlaskConical className="w-3.5 h-3.5" />
              <span>Demo Mode — Add your Supabase credentials in <code className="bg-primary/10 px-1 rounded">.env</code> for full functionality</span>
            </div>
          )}
          {children}
        </div>
        <footer className="border-t border-border py-4 px-6">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>HiREady v1.0</span>
            <span>&copy; {new Date().getFullYear()} HiREady. All rights reserved.</span>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default DashboardLayout;
