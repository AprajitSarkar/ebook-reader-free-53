
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import { UserSettingsProvider } from "@/contexts/UserSettingsContext";

// Pages
import Home from "./pages/Home";
import Search from "./pages/Search";
import Poems from "./pages/Poems";
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

  const hideSplash = () => {
    setShowSplash(false);
  };

  useEffect(() => {
    // Force dark mode
    document.documentElement.classList.add('dark');
  }, []);

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
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/poems" element={<Poems />} />
                  <Route path="/poem-details" element={<PoemDetails />} />
                  <Route path="/liked-poems" element={<LikedPoems />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
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
