
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X, ExternalLink, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InAppBrowserProps {
  url: string;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

const InAppBrowser = ({ url, isOpen, onClose, title = "Book Content" }: InAppBrowserProps) => {
  const [loading, setLoading] = useState(true);
  
  const handleLoad = () => {
    setLoading(false);
  };
  
  const handleOpenExternal = () => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="p-0 max-w-screen-xl w-[95vw] h-[90vh] sm:h-[85vh]">
        <div className="flex items-center justify-between p-2 border-b">
          <h2 className="text-sm font-medium truncate max-w-[60%]">{title}</h2>
          <div className="flex items-center space-x-2">
            {loading && (
              <RefreshCw className="w-4 h-4 animate-spin text-primary" />
            )}
            <Button variant="outline" size="icon" onClick={handleOpenExternal}>
              <ExternalLink className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="w-full h-full">
          <iframe
            src={url}
            className="w-full h-full"
            onLoad={handleLoad}
            title={title}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InAppBrowser;
