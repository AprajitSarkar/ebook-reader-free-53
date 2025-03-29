
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Search, BookOpen, Heart } from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Helper to check if a route is active
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-6 w-full z-50 flex justify-center">
      <div className="glass-card flex items-center justify-around px-6 py-4 gap-6 sm:gap-12 animate-fade-in">
        <button 
          onClick={() => navigate("/")}
          className={`flex flex-col items-center gap-1 transition-colors ${
            isActive("/") ? "text-primary" : "text-foreground/80 hover:text-primary" 
          }`}
        >
          <Home size={24} />
          <span className="text-xs">Home</span>
        </button>
        
        <button 
          onClick={() => navigate("/search")}
          className={`flex flex-col items-center gap-1 transition-colors ${
            isActive("/search") ? "text-primary" : "text-foreground/80 hover:text-primary" 
          }`}
        >
          <Search size={24} />
          <span className="text-xs">Search</span>
        </button>
        
        <button 
          onClick={() => navigate("/poems")}
          className={`flex flex-col items-center gap-1 transition-colors ${
            isActive("/poems") ? "text-primary" : "text-foreground/80 hover:text-primary" 
          }`}
        >
          <BookOpen size={24} />
          <span className="text-xs">Poems</span>
        </button>
        
        <button 
          onClick={() => navigate("/liked-poems")}
          className={`flex flex-col items-center gap-1 transition-colors ${
            isActive("/liked-poems") ? "text-primary" : "text-foreground/80 hover:text-primary" 
          }`}
        >
          <Heart size={24} fill={isActive("/liked-poems") ? "currentColor" : "none"} />
          <span className="text-xs">Favorites</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
