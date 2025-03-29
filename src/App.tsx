
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

// Components
import Navbar from "./components/Navbar";
import SplashScreen from "./components/SplashScreen";

const queryClient = new QueryClient();

const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const hideSplash = () => {
    console.log("Splash screen completed, showing main app");
    setShowSplash(false);
  };

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("You're back online");
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning("You're offline. Some features may be limited.");
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
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

  if (!isLoaded) {
    return <div className="flex items-center justify-center min-h-screen bg-background text-foreground">Loading...</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <UserSettingsProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          {showSplash && <SplashScreen onComplete={hideSplash} />}
          <BrowserRouter>
            {!showSplash && (
              <>
                <div className="pb-24">
                  <Routes>
                    <Route path="/" element={<Poems />} />
                    <Route path="/poems" element={<Poems />} />
                    <Route path="/search" element={<Search />} />
                    <Route path="/poem-details" element={<PoemDetails />} />
                    <Route path="/liked-poems" element={<LikedPoems />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
                <Navbar />
              </>
            )}
          </BrowserRouter>
        </TooltipProvider>
      </UserSettingsProvider>
    </QueryClientProvider>
  );
};

export default App;
