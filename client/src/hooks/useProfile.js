// client/src/hooks/useProfile.js
import { useState, useEffect } from 'react';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';

export const useProfile = (uid) => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true); // Start as true

  useEffect(() => {
    // --- THIS IS THE CRITICAL FIX ---
    // If no UID is passed (because currentUser is still null),
    // immediately set loading to false and do nothing else.
    // The AdminRoute will then see loading=false and currentUser=null and correctly redirect.
    if (!uid) {
      setLoading(false);
      return;
    }

    setLoading(true); // Set loading to true only when we have a UID to fetch
    const db = getFirestore();
    const docRef = doc(db, "users", uid);

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setProfileData(docSnap.data());
      } else {
        setProfileData(null); 
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching profile:", error);
      setProfileData(null);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [uid]);

  return { profileData, loading };
};