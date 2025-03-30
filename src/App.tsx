
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { UserSettingsProvider } from "@/contexts/UserSettingsContext";
import { adService } from "@/services/adService";
import { Capacitor } from '@capacitor/core';
import { toast } from "@/lib/toast";

// Pages
import Poems from "./pages/Poems";
import Search from "./pages/Search";
import PoemDetails from "./pages/PoemDetails";
import LikedPoems from "./pages/LikedPoems";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Books from "./pages/Books";
import BookDetails from "./pages/BookDetails";
import LikedBooks from "./pages/LikedBooks";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsConditions from "./pages/TermsConditions";

// Components
import Navbar from "./components/Navbar";
import SplashScreen from "./components/SplashScreen";
import OfflineNotice from "./components/OfflineNotice";
import FirstTimeModal from "./components/FirstTimeModal";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});

const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineNotice, setShowOfflineNotice] = useState(false);
  const [showFirstTimeModal, setShowFirstTimeModal] = useState(false);

  const hideSplash = () => {
    console.log("Splash screen completed, showing main app");
    setShowSplash(false);
  };

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineNotice(false);
      toast.success("You're back online");
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning("You're offline. Some features may be limited.");
      
      // Only show the offline notice if the app is already loaded (past splash screen)
      if (!showSplash) {
        // Add a small delay to prevent showing the notice on brief connection fluctuations
        setTimeout(() => {
          if (!navigator.onLine) {
            setShowOfflineNotice(true);
          }
        }, 2000);
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showSplash]);

  useEffect(() => {
    // Check for first time user
    const hasVisitedBefore = localStorage.getItem("hasVisitedBefore");
    if (!hasVisitedBefore && !window.location.pathname.includes("privacy")) {
      setShowFirstTimeModal(true);
    }
    
    // Force dark mode
    document.documentElement.classList.add('dark');
    
    // Show app is loaded
    setIsLoaded(true);
    console.log("App component mounted");
    
    // Initialize AdMob if on Android
    const initAds = async () => {
      if (Capacitor.getPlatform() === 'android') {
        try {
          console.log("Initializing ads");
          await adService.initialize();
          await adService.showBanner();
          console.log("Ads initialized successfully");
        } catch (error) {
          console.error('Error initializing ads:', error);
        }
      }
    };
    
    if (!showSplash) {
      initAds();
    }
    
    return () => {
      // Clean up ads when component unmounts
      if (Capacitor.getPlatform() === 'android') {
        adService.removeBanner().catch(console.error);
      }
    };
  }, [showSplash]);

  // Special case for privacy policy - no splash screen
  useEffect(() => {
    if (window.location.pathname.includes("privacy") || window.location.pathname.includes("terms")) {
      setShowSplash(false);
    }
  }, []);

  if (!isLoaded) {
    return <div className="flex items-center justify-center min-h-screen bg-background text-foreground">Loading...</div>;
  }

  const handleOfflineRetry = () => {
    if (navigator.onLine) {
      setShowOfflineNotice(false);
      // Force refresh data
      queryClient.invalidateQueries();
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <UserSettingsProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          {showSplash && !window.location.pathname.includes("privacy") && !window.location.pathname.includes("terms") && (
            <SplashScreen onComplete={hideSplash} />
          )}
          <BrowserRouter>
            {!showSplash && (
              <>
                {showOfflineNotice ? (
                  <div className="h-screen">
                    <OfflineNotice onRetry={handleOfflineRetry} />
                  </div>
                ) : (
                  <>
                    <div className="pb-24">
                      <Routes>
                        <Route path="/" element={<Navigate to="/books" replace />} />
                        <Route path="/poems" element={<Poems />} />
                        <Route path="/search" element={<Search />} />
                        <Route path="/poem-details" element={<PoemDetails />} />
                        <Route path="/liked-poems" element={<LikedPoems />} />
                        <Route path="/liked-books" element={<LikedBooks />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/books" element={<Books />} />
                        <Route path="/book-details" element={<BookDetails />} />
                        <Route path="/privacy" element={<PrivacyPolicy />} />
                        <Route path="/terms" element={<TermsConditions />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </div>
                    {!window.location.pathname.includes("privacy") && !window.location.pathname.includes("terms") && (
                      <Navbar />
                    )}
                  </>
                )}
              </>
            )}
          </BrowserRouter>
          
          {showFirstTimeModal && (
            <FirstTimeModal 
              onAccept={() => {
                localStorage.setItem("hasVisitedBefore", "true");
                setShowFirstTimeModal(false);
              }}
              onClose={() => setShowFirstTimeModal(false)}
            />
          )}
        </TooltipProvider>
      </UserSettingsProvider>
    </QueryClientProvider>
  );
};

export default App;
