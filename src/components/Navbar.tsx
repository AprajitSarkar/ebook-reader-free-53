
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BookOpen, Search, Heart, Settings, Feather, BookmarkCheck } from "lucide-react";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState("");
  
  useEffect(() => {
    const path = location.pathname.split("/")[1] || "books";
    setActiveItem(path);
  }, [location]);

  const navItems = [
    { name: "books", icon: <BookOpen className="w-5 h-5" />, label: "Books" },
    { name: "poems", icon: <Feather className="w-5 h-5" />, label: "Poems" },
    { name: "search", icon: <Search className="w-5 h-5" />, label: "Search" },
    { name: "liked-books", icon: <BookmarkCheck className="w-5 h-5" />, label: "Saved" },
    { name: "settings", icon: <Settings className="w-5 h-5" />, label: "Settings" }
  ];

  const handleNavigation = (path: string) => {
    navigate(`/${path}`);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-white/10 backdrop-blur-lg z-50 shadow-lg">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {navItems.map(item => (
          <div 
            key={item.name}
            onClick={() => handleNavigation(item.name)}
            className={`flex flex-col items-center justify-center w-full h-full cursor-pointer transition-all ${
              activeItem === item.name 
                ? "text-primary" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {item.icon}
            <span className="text-xs mt-1">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Navbar;
