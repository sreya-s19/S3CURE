// client/src/components/Header.jsx

import { Link, NavLink, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useApp } from "../context/AppContext.jsx";
import './Header.css';

const Header = () => {
  // 1. Get the currentUser from our context
  const { currentUser } = useApp();
  const navigate = useNavigate();

  // 2. Create a handleLogout function
  const handleLogout = async () => {
    try {
      await signOut(auth);
      // After successful logout, Firebase's onAuthStateChanged will trigger,
      // and our context will update.
      // We can also navigate the user back to the home page.
      navigate('/');
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  return (
    <header className="site-header">
      <Link to="/" className="logo">
        S3CURE
      </Link>
      <nav className="main-nav">
        <NavLink to="/missions">Missions</NavLink>

        {/* 3. Conditional Rendering */}
        {currentUser ? (
          // If a user is logged in, show Profile and Logout
          <>
            <NavLink to="/profile">Profile</NavLink>
            <button onClick={handleLogout} className="nav-logout-button">
              Logout
            </button>
          </>
        ) : (
          // If no user is logged in, show Login and Join
          <>
            <NavLink to="/login">Login</NavLink>
            <NavLink to="/register" className="nav-button">
              Join
            </NavLink>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;