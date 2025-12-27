import { Link, useLocation } from "react-router-dom";
import { MessageSquare, LayoutDashboard, Search, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Search, label: "Opportunities", path: "/dashboard" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border/50 hidden lg:flex flex-col z-50">
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
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path + item.label}>
              <Link
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                  location.pathname === item.path
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border/50">
        <div className="px-4 py-3 bg-secondary/50 rounded-xl">
          <p className="text-xs text-muted-foreground">
            Manual posting only.
            <br />
            No auto-posting.
          </p>
        </div>
      </div>
    </aside>
  );
};
