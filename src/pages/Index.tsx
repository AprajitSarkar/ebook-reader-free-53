
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Index page mounted, navigating to /poems");
    navigate("/poems");
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
      <p>Initializing...</p>
    </div>
  );
};

export default Index;
