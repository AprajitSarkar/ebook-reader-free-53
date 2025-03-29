
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Add error handling for initial render
const container = document.getElementById("root");
if (!container) {
  console.error("Failed to find the root element");
} else {
  const root = createRoot(container);
  root.render(<App />);
}
