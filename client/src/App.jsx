// client/src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { useApp } from './context/AppContext'; // Use the AppContext

// Import all your pages and components
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute'; // Assuming you have this
import MissionsPage from './pages/MissionsPage';
import MissionView from './pages/MissionViewPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage'; // Assuming you have this
import LoadingSpinner from './components/LoadingSpinner';

const NotFoundPage = () => <div style={{padding: '50px', textAlign: 'center'}}><h1>404 Not Found</h1></div>;

function App() {
  const { currentUser, loading: appLoading } = useApp(); // Get basic status from AppContext
  const [userProfile, setUserProfile] = useState(null); // App.jsx now owns userProfile
  const [profileLoading, setProfileLoading] = useState(true); // Loading for userProfile

  // Function to manually fetch the latest user profile data
  const fetchUserProfile = useCallback(async () => {
    if (!currentUser) {
      setUserProfile(null);
      setProfileLoading(false);
      console.log("App.jsx: No currentUser, profile cleared.");
      return;
    }
    setProfileLoading(true); // Start loading profile data
    const db = getFirestore();
    const userRef = doc(db, 'users', currentUser.uid);
    try {
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        setUserProfile(docSnap.data());
        console.log("App.jsx: User profile fetched and updated.");
      } else {
        setUserProfile(null);
        console.warn("App.jsx: User profile document not found for:", currentUser.uid);
      }
    } catch (error) {
      console.error("App.jsx: Error fetching user profile:", error);
      setUserProfile(null);
    } finally {
      setProfileLoading(false); // Finish loading profile data
    }
  }, [currentUser]); // Recreate this function if currentUser object changes

  // Effect to trigger fetching user profile when currentUser changes
  useEffect(() => {
    console.log("App.jsx: currentUser changed, triggering fetchUserProfile.");
    fetchUserProfile();
  }, [fetchUserProfile]); // Dependency on the memoized fetchUserProfile function

  const isLoading = appLoading || profileLoading; // Overall loading status for the app

  if (isLoading) {
    return <LoadingSpinner message="Initializing S3CURE..." />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Public Routes */}
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />

          {/* Protected Routes - receive props from App.jsx */}
          <Route element={<ProtectedRoute currentUser={currentUser} isLoading={isLoading} userProfile={userProfile} />}>
            <Route 
              path="missions" 
              element={<MissionsPage userProfile={userProfile} />} 
            />
            <Route 
              path="mission/:missionId" 
              element={<MissionView onMissionComplete={fetchUserProfile} />} 
            />
            <Route 
              path="profile" 
              element={<ProfilePage userProfile={userProfile} />} 
            />
          </Route>

          {/* Admin-only Routes - assuming AdminRoute exists and takes props */}
          <Route element={<AdminRoute currentUser={currentUser} isLoading={isLoading} userProfile={userProfile} />}>
            <Route path="admin" element={<AdminPage />} />
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;