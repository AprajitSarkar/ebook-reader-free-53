
import { useEffect, useState } from "react";
import { CheckCircle2, Download, X, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/lib/toast";

interface DownloadAnimationProps {
  isOpen: boolean;
  onClose: () => void;
  filename: string;
}

const DownloadAnimation = ({ isOpen, onClose, filename }: DownloadAnimationProps) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"downloading" | "completed" | "failed">("downloading");

  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      setStatus("downloading");
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setStatus("completed");
          toast.success("Download completed");
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-card rounded-lg shadow-lg p-6 w-[90%] max-w-md border animate-scale-in">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium gradient-text">
            {status === "downloading" ? "Downloading..." : status === "completed" ? "Download Complete" : "Download Failed"}
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="space-y-2 animate-fade-in">
            <p className="text-sm text-muted-foreground line-clamp-1">{filename}</p>
            <Progress value={progress} className="h-2 overflow-hidden">
              {status === "completed" && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary/50 via-primary to-accent/80 animate-shimmer"></div>
              )}
            </Progress>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{progress}%</span>
              <span>{Math.round((progress / 100) * 2.5 * 10) / 10} MB / 2.5 MB</span>
            </div>
          </div>

          <div className="flex justify-center">
            {status === "downloading" ? (
              <div className="sparkle-element">
                <Download className="h-16 w-16 text-primary animate-bounce-gentle" />
              </div>
            ) : status === "completed" ? (
              <div className="relative">
                <CheckCircle2 className="h-16 w-16 text-green-500 animate-expand" />
                <Sparkles className="absolute -top-3 -right-3 h-8 w-8 text-yellow-300 animate-sparkle" />
                <Sparkles className="absolute -bottom-3 -left-3 h-6 w-6 text-primary animate-sparkle" style={{ animationDelay: "0.4s" }} />
              </div>
            ) : (
              <X className="h-16 w-16 text-red-500 animate-pulse" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadAnimation;
