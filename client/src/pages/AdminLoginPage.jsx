// client/src/pages/AdminLoginPage.jsx
import { useState } from 'react';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../firebase';
import { useAuthRedirect } from '../hooks/useAuthRedirect'; // Import the hook
import './AuthForm.css'; // Reuse the same styles

const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // This hook will now handle redirecting the user to the /admin page
  // AFTER they have successfully logged in and the app state has updated.
  useAuthRedirect('/admin');

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // We only need to try signing in. Firebase handles if the user/pass is correct.
      await signInWithEmailAndPassword(auth, email, password);
      
      // DO NOT navigate here. The useAuthRedirect hook will take care of it.
      // This is the key fix to prevent race conditions.
      console.log("Admin sign-in successful. Waiting for redirect...");

    } catch (err) {
      setError("Invalid credentials or admin user not found.");
      console.error("Admin login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleAdminLogin}>
        <h1 className="auth-title">Admin Access</h1>
        {error && <p className="auth-error">{error}</p>}
        <div className="input-group">
          <label htmlFor="email">Admin Email</label>
          <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} />
        </div>
        <div className="input-group">
          <label htmlFor="password">Admin Password</label>
          <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading} />
        </div>
        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? 'Authenticating...' : 'Enter'}
        </button>
      </form>
    </div>
  );
};

export default AdminLoginPage;