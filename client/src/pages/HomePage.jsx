// client/src/pages/HomePage.jsx
import { Link } from 'react-router-dom';
import { useTypewriter } from '../hooks/useTypewriter';
import '../App.css'; 

const HomePage = () => {
  // --- FIX 1: Corrected the typo in "You" ---
  const fullTagline = "You are not a player. You are the investigator.";
  
  const typedTagline = useTypewriter(fullTagline, 75);

  // --- FIX 2: Check if typing is complete ---
  const isTypingComplete = typedTagline.length === fullTagline.length;

  return (
    <div className="app-container"> 
      <header className="landing-header">
        <h1 className="landing-title">S3CURE</h1>
        <p className="landing-tagline">
          {typedTagline}
          {/* --- FIX 3: Conditionally render the cursor --- */}
          {/* This now correctly checks if typing is NOT complete */}
          {!isTypingComplete && <span className="blinking-cursor">_</span>}
        </p>
      </header>
      
      <main className="landing-main">
        <Link to="/register" className="cta-button">
          Join the Agency
        </Link>
      </main>
    </div>
  );
};

export default HomePage;