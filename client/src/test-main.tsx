import { createRoot } from "react-dom/client";
import "./index.css";

function TestApp() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Body Mastery Index - Test Load</h1>
      <p>If you can see this, React is working correctly!</p>
      <p>Testing basic functionality...</p>
    </div>
  );
}

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(<TestApp />);
} else {
  console.error("Root element not found!");
}