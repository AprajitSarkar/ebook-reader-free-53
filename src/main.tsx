
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'

// Add error handling for initial render
const container = document.getElementById("root");
if (!container) {
  console.error("Failed to find the root element");
} else {
  const root = createRoot(container);
  // Wrap the App component with BrowserRouter to ensure router context is available
  root.render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}
