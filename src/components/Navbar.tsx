
import { useNavigate } from "react-router-dom";
import { Home, Search, BookOpen } from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-6 w-full z-50 flex justify-center">
      <div className="glass-card flex items-center justify-around px-8 py-4 gap-8 sm:gap-16 animate-fade-in">
        <button 
          onClick={() => navigate("/")}
          className="flex flex-col items-center gap-1 text-foreground/80 hover:text-primary transition-colors"
        >
          <Home size={24} />
          <span className="text-xs">Home</span>
        </button>
        
        <button 
          onClick={() => navigate("/search")}
          className="flex flex-col items-center gap-1 text-foreground/80 hover:text-primary transition-colors"
        >
          <Search size={24} />
          <span className="text-xs">Search</span>
        </button>
        
        <button 
          onClick={() => navigate("/poems")}
          className="flex flex-col items-center gap-1 text-foreground/80 hover:text-primary transition-colors"
        >
          <BookOpen size={24} />
          <span className="text-xs">Poems</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
