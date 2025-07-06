// client/src/pages/LoginPage.jsx
import { useState } from 'react';
// NEW IMPORTS: Link and useNavigate
import { Link, useNavigate } from 'react-router-dom';
import './AuthForm.css';


// NEW IMPORTS: The sign-in function and our auth object
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../firebase'; // Make sure this path is correct

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // NEW: Get the navigate function
  const navigate = useNavigate();

  // NEW: Make the function async
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    if (!email || !password) {
      setError('All fields are required.');
      return;
    }
    
    // --- Firebase Sign-in Logic ---
    try {
      // This function sends the credentials to Firebase for verification
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // The user is now signed in!
      console.log('User logged in successfully:', userCredential.user);
      
      // Redirect the user to the missions page after successful login
      navigate('/missions');

    } catch (err) {
      // Handle login errors from Firebase
      console.error("Firebase login error:", err.code, err.message);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please try again.');
      } else {
        setError('Failed to login. Please try again later.');
      }
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h1 className="auth-title">Investigator Login</h1>
        
        {error && <p className="auth-error">{error}</p>}
        
        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input 
            type="email" 
            id="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="input-group">
          <label htmlFor="password">Password</label>
          <input 
            type="password" 
            id="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <button type="submit" className="auth-button">
          Login
        </button>

        <p className="auth-switch">
          Need an account? <Link to="/register">Create Profile</Link>
        </p>
      </form>
    </div>
  );
};
export default LoginPage;