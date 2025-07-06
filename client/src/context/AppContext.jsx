// client/src/context/AppContext.jsx
import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AppContext = createContext();

export const useApp = () => {
  return useContext(AppContext);
};

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null); // State for user profile data
  const [missions, setMissions] = useState([]);
  const [badges, setBadges] = useState([]);
  const [loadingApp, setLoadingApp] = useState(true); // Tracks overall app loading (auth + profile)

  // Memoized function to fetch user profile for a given UID
  const fetchUserProfile = useCallback(async (uid) => {
    if (!uid) {
      setUserProfile(null);
      console.log("AppContext: No UID provided for fetchUserProfile, clearing profile.");
      return;
    }
    try {
      const userDocRef = doc(db, 'users', uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const profile = userDocSnap.data();
        setUserProfile(profile);
        console.log("AppContext: User profile fetched/updated:", profile);
      } else {
        console.warn("AppContext: User profile document does not exist for UID:", uid);
        setUserProfile(null);
      }
    } catch (err) {
      console.error("AppContext: Error fetching user profile:", err);
      setUserProfile(null);
    }
  }, []);

  useEffect(() => {
    // 1. Fetch static game data (missions and badge definitions)
    const fetchGameData = async () => {
      try {
        const missionsRef = collection(db, 'missions');
        // Fetch all missions. Adjust query if you only want 'Available' ones or hidden ones later.
        const missionsSnap = await getDocs(missionsRef); 
        setMissions(missionsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        const badgesRef = collection(db, 'badges');
        const badgesSnap = await getDocs(badgesRef);
        setBadges(badgesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        
        console.log("AppContext: Static game data (missions & badges) loaded.");
      } catch (error) {
        console.error("AppContext: Failed to fetch core game data:", error);
      }
    };
    fetchGameData();
    
    // 2. Listen for Firebase Auth state changes (login/logout)
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // If a user is logged in, fetch their specific profile data
        await fetchUserProfile(user.uid); 
      } else {
        // If no user, clear the profile data
        setUserProfile(null); 
      }
      setLoadingApp(false); // Auth state and profile fetch attempt is complete
      console.log("AppContext: Auth state changed. User:", user ? user.uid : "None");
    });

    return () => {
      unsubscribeAuth(); // Cleanup on unmount
    };
  }, [fetchUserProfile]); // fetchUserProfile is a stable dependency due to useCallback

  const value = {
    currentUser,
    userProfile, // Expose userProfile
    missions,
    badges,
    loadingApp, // Expose loadingApp
    fetchUserProfile // Expose the function to manually refresh profile
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};