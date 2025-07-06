// client/src/components/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useApp } from "../context/AppContext.jsx";
import LoadingSpinner from './LoadingSpinner'; // <-- Import the loading spinner

const ProtectedRoute = () => {
  // Destructure BOTH currentUser and the app's loading state
  const { currentUser, loadingApp } = useApp();

  // 1. If the context is still loading (i.e., checking auth state),
  // show a loading spinner. This is the essential fix.
  if (loadingApp) {
    console.log("ProtectedRoute: App is loading, waiting for auth status...");
    return <LoadingSpinner message="Authenticating..." />;
  }

  // 2. After loading is complete, check for a user.
  // If there is no logged-in user, redirect them to the /login page.
  if (!currentUser) {
    console.log("ProtectedRoute: No user found after loading. Redirecting to /login.");
    return <Navigate to="/login" replace />;
  }

  // 3. If loading is done and there IS a logged-in user, render the child route.
  // The <Outlet /> component is a placeholder for the actual page component
  // (like MissionsPage or ProfilePage) that this route is protecting.
  console.log("ProtectedRoute: User is authenticated. Rendering protected content.");
  return <Outlet />;
};

export default ProtectedRoute;