
import { useNavigate, useLocation } from "react-router-dom";
import { Search, BookOpen, Heart, Settings } from "lucide-react";
import { Capacitor } from '@capacitor/core';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Helper to check if a route is active
  const isActive = (path: string) => location.pathname === path;

  // Adjust position for Android with ads
  const navbarPosition = Capacitor.getPlatform() === 'android' 
    ? "bottom-16" // Position above the ad banner
    : "bottom-6"; // Normal position for other platforms

  return (
    <nav className={`fixed ${navbarPosition} w-full z-50 flex justify-center`}>
      <div className="glass-card flex items-center justify-around px-6 py-4 gap-4 sm:gap-8 animate-fade-in">
        <button 
          onClick={() => navigate("/poems")}
          className={`flex flex-col items-center gap-1 transition-colors ${
            isActive("/poems") ? "text-primary" : "text-foreground/80 hover:text-primary" 
          }`}
        >
          <BookOpen size={20} />
          <span className="text-xs">Poems</span>
        </button>
        
        <button 
          onClick={() => navigate("/search")}
          className={`flex flex-col items-center gap-1 transition-colors ${
            isActive("/search") ? "text-primary" : "text-foreground/80 hover:text-primary" 
          }`}
        >
          <Search size={20} />
          <span className="text-xs">Search</span>
        </button>
        
        <button 
          onClick={() => navigate("/liked-poems")}
          className={`flex flex-col items-center gap-1 transition-colors ${
            isActive("/liked-poems") ? "text-primary" : "text-foreground/80 hover:text-primary" 
          }`}
        >
          <Heart size={20} fill={isActive("/liked-poems") ? "currentColor" : "none"} />
          <span className="text-xs">Favorites</span>
        </button>
        
        <button 
          onClick={() => navigate("/settings")}
          className={`flex flex-col items-center gap-1 transition-colors ${
            isActive("/settings") ? "text-primary" : "text-foreground/80 hover:text-primary" 
          }`}
        >
          <Settings size={20} />
          <span className="text-xs">Settings</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
