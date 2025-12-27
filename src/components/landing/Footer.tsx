import { MessageSquare } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-foreground py-12">
      <div className="container px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-accent-foreground" />
            </div>
            <span className="text-lg font-semibold text-primary-foreground">
              RedditReply
            </span>
          </div>
          
          <div className="flex items-center gap-8 text-sm text-primary-foreground/60">
            <a href="#" className="hover:text-primary-foreground transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-primary-foreground transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-primary-foreground transition-colors">
              Contact
            </a>
          </div>
          
          <p className="text-sm text-primary-foreground/60">
            © {new Date().getFullYear()} RedditReply. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
