import { Link } from "react-router-dom";
import { MessageSquare, Menu, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "./Sidebar";

export const TopBar = () => {
  return (
    <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border/50">
      <div className="flex items-center justify-between h-16 px-4 lg:px-8">
        {/* Mobile menu */}
        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <div className="h-full bg-card">
                {/* Logo */}
                <div className="p-6 border-b border-border/50">
                  <Link to="/" className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-orange flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-accent-foreground" />
                    </div>
                    <span className="text-lg font-bold text-foreground">RedditReply</span>
                  </Link>
                </div>

                {/* Nav items */}
                <nav className="p-4">
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium bg-secondary text-foreground"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-secondary/50"
                  >
                    Settings
                  </Link>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Title */}
        <div className="lg:ml-64">
          <h1 className="text-lg font-semibold text-foreground">Dashboard</h1>
        </div>

        {/* Disclaimer */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
          <AlertCircle className="w-4 h-4" />
          <span>Manual posting only. No auto-posting.</span>
        </div>
      </div>
    </header>
  );
};
