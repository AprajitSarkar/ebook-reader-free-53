
import { WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

interface OfflineNoticeProps {
  onRetry?: () => void;
}

const OfflineNotice = ({ onRetry }: OfflineNoticeProps) => {
  const [isRetrying, setIsRetrying] = useState(false);
  
  const handleRetry = () => {
    setIsRetrying(true);
    // Wait a bit to show the spinner
    setTimeout(() => {
      if (navigator.onLine && onRetry) {
        onRetry();
      }
      setIsRetrying(false);
    }, 1500);
  };
  
  return (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center">
      <div className="relative">
        <div className="absolute inset-0 bg-destructive/10 blur-xl rounded-full scale-150"></div>
        <WifiOff className="h-20 w-20 text-muted-foreground relative animate-pulse" />
      </div>
      
      <h2 className="text-2xl font-bold mt-6 mb-2">You're Offline</h2>
      <p className="text-muted-foreground max-w-xs mb-6">
        Please check your internet connection and try again.
      </p>
      
      <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
        <Button onClick={handleRetry} disabled={isRetrying}>
          {isRetrying ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default OfflineNotice;
