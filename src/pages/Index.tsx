
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Index page mounted, redirecting to books page");
    // Add a small delay to ensure navigation happens after component is fully mounted
    const timer = setTimeout(() => {
      navigate("/books", { replace: true });
    }, 100);
    
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
      <p className="text-lg">Redirecting to books...</p>
    </div>
  );
};

export default Index;
