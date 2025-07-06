// client/src/components/AdminRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useApp } from "../context/AppContext.jsx";
import LoadingSpinner from './LoadingSpinner';

const AdminRoute = () => {
  // 1. Get the userProfile and the consistent 'loadingApp' state
  // Renamed 'loading' to 'loadingApp' to match AppContext
  const { userProfile, loadingApp } = useApp(); 

  // 2. If the context is still loading user data, show a spinner.
  // This prevents premature redirects before the user's role is known.
  if (loadingApp) {
    console.log("AdminRoute: App is loading, waiting for admin verification...");
    return <LoadingSpinner message="Verifying Admin Privileges..." />;
  }

  // 3. After loading is finished, check the role.
  // If the user's profile has role 'admin', render the child route (the AdminPage).
  if (userProfile?.role === 'admin') {
    console.log("AdminRoute: Admin access verified. Rendering admin content.");
    return <Outlet />;
  } 
  // Otherwise, redirect them to the home page.
  else {
    console.log("AdminRoute: User is not an admin. Redirecting to home.");
    return <Navigate to="/" replace />;
  }
};

export default AdminRoute;