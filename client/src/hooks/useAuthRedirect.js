// client/src/hooks/useAuthRedirect.js
import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const useAuthRedirect = (redirectTo = '/missions') => { // Default redirect path
  const { currentUser, loadingApp, userProfile } = useApp(); // Get userProfile too
  const navigate = useNavigate();
  const location = useLocation();

  const hasNavigated = useRef(false); // Ref to prevent multiple navigations

  useEffect(() => {
    console.log(`useAuthRedirect: Effect triggered. loadingApp: ${loadingApp}, currentUser: ${currentUser ? 'Yes' : 'No'}, userProfile: ${userProfile ? 'Yes' : 'No'}, hasNavigated: ${hasNavigated.current}, pathname: ${location.pathname}`);

    // Phase 1: Wait for app to finish initial loading (auth state and user profile)
    // If we are still loading OR (user is logged in but profile hasn't loaded yet), do nothing.
    // This is CRITICAL for preventing premature redirects.
    if (loadingApp || (currentUser && !userProfile)) {
        console.log("useAuthRedirect: App or user profile still loading. Waiting...");
        return;
    }

    // Phase 2: Handle redirection after loading is complete
    // If there IS a logged-in user AND their profile is loaded AND we haven't navigated yet...
    if (currentUser && userProfile && !hasNavigated.current) {
      // ...and they are currently on the login or register page...
      if (location.pathname === '/login' || location.pathname === '/register') {
        // ...redirect them to the specified path.
        console.log(`useAuthRedirect: User is logged in and profile loaded. Redirecting from ${location.pathname} to ${redirectTo}.`);
        navigate(redirectTo);
        hasNavigated.current = true; // Mark that navigation has occurred
      }
    } 
    // Phase 3: Reset navigation flag if user logs out or is not logged in
    else if (!currentUser) {
      hasNavigated.current = false; // Reset the flag so future logins can redirect
      console.log("useAuthRedirect: No user or logged out. Resetting navigation flag.");
    }

    // No return cleanup needed for this specific ref usage, as it's about
    // preventing re-navigation *after* initial navigation, not during unmounts.

  }, [currentUser, userProfile, loadingApp, navigate, location.pathname, redirectTo]); // Dependencies for useEffect
};