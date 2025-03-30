
import { useEffect, useState } from "react";
import { CheckCircle2, Download, X } from "lucide-react";
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
      <div className="bg-card rounded-lg shadow-lg p-6 w-[90%] max-w-md border">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">
            {status === "downloading" ? "Downloading..." : status === "completed" ? "Download Complete" : "Download Failed"}
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground line-clamp-1">{filename}</p>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{progress}%</span>
              <span>{Math.round((progress / 100) * 2.5 * 10) / 10} MB / 2.5 MB</span>
            </div>
          </div>

          <div className="flex justify-center">
            {status === "downloading" ? (
              <Download className="h-12 w-12 text-primary animate-bounce" />
            ) : status === "completed" ? (
              <CheckCircle2 className="h-12 w-12 text-green-500 animate-pulse" />
            ) : (
              <X className="h-12 w-12 text-red-500" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadAnimation;
