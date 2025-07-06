// client/src/pages/MissionViewPage.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getFirestore, doc, getDoc, updateDoc, deleteField } from 'firebase/firestore';
import { getFunctions } from "firebase/functions"; // No longer need httpsCallable here
import { useApp } from "../context/AppContext.jsx";
import { useTypewriter } from '../hooks/useTypewriter.js';

import Terminal from '../components/tools/Terminal.jsx';
import FileViewer from '../components/tools/FileViewer.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import './MissionViewPage.css';

const db = getFirestore();
// const functions = getFunctions(); // We get functions inside the component now

const MissionView = () => {
  // All hooks are called unconditionally at the top
  const { missionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, userProfile, fetchUserProfile } = useApp();
  
  const [missionData, setMissionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [feedback, setFeedback] = useState({ message: '', type: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isReplayMode = new URLSearchParams(location.search).get('replay') === 'true';
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const hasLoadedMissionRef = useRef(false);

  const currentStep = missionData?.steps[currentStepIndex];
  const fullBriefing = isSessionComplete 
    ? (isReplayMode ? "Replay complete. Good work, Investigator." : "Case file closed. Your efforts have been recorded.")
    : currentStep?.prompt;

  const typedBriefing = useTypewriter(fullBriefing || '', 20, [fullBriefing]);

  const saveProgress = useCallback(async (stepIndex) => {
    if (isReplayMode || !currentUser || !currentUser.uid) return;
    const userRef = doc(db, "users", currentUser.uid);
    try {
      await updateDoc(userRef, { [`activeMissions.${missionId}`]: stepIndex });
    } catch (err) {
      console.error("--- ERROR IN saveProgress ---", err);
      throw new Error("Failed to save progress.", { cause: err });
    }
  }, [isReplayMode, currentUser, missionId]);

  const completeMission = useCallback(async () => {
    if (isReplayMode || !currentUser || !currentUser.uid || !missionData) {
      console.warn("completeMission: Pre-conditions not met.", { isReplayMode, currentUser, missionData });
      throw new Error("Complete mission pre-conditions failed."); // Ensure an error is thrown
    }
    
    const userRef = doc(db, "users", currentUser.uid);
    
    try {
      // 1. Perform Firestore updates (badge, completed mission, active mission cleanup)
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        console.error("completeMission: User document not found for completion process.");
        throw new Error("User document not found during mission completion.");
      }
      const userData = userSnap.data();
      let updates = {};
      let earnedBadges = [...(userData.badges || [])];
      let completedMissions = [...(userData.completedMissions || [])];
      const badgeToAward = missionData.badgeId;
      if (badgeToAward && !earnedBadges.includes(badgeToAward)) {
        earnedBadges.push(badgeToAward);
        updates.badges = earnedBadges;
        console.log(`completeMission: Awarding badge: ${badgeToAward}`);
      }
      if (!completedMissions.includes(missionId)) {
        completedMissions.push(missionId);
        updates.completedMissions = completedMissions;
        console.log(`completeMission: Marking mission ${missionId} as completed.`);
      }
      updates[`activeMissions.${missionId}`] = deleteField(); 
      await updateDoc(userRef, updates);
      console.log("completeMission: Firestore updates for user profile successful.");

      // 2. Refresh global profile state (important for other components)
      if (fetchUserProfile) {
        await fetchUserProfile(currentUser.uid);
        console.log("completeMission: Global user profile refreshed.");
      }
      
      // 3. Call the Cloud Function for rank promotion
      console.log("completeMission: Attempting to call checkRankPromotion Cloud Function.");
      const functionUrl = `http://localhost:5001/${import.meta.env.VITE_FIREBASE_PROJECT_ID}/us-central1/checkRankPromotion`;
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: { userId: currentUser.uid } }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`completeMission: Cloud function response not OK. Status: ${response.status}, Body: ${errorBody}`);
        throw new Error(`Cloud function 'checkRankPromotion' failed with status ${response.status}.`);
      }
      
      const result = await response.json();
      console.log("completeMission: Rank promotion check completed successfully by function.", result);

      // No explicit state updates here, as handleSubmit handles feedback/isSessionComplete

    } catch (error) {
      console.error("completeMission: Error during mission completion process:", error);
      // Re-throw the error so handleSubmit can catch it and reset the UI
      throw new Error(`Mission completion failed: ${error.message || error}`, { cause: error });
    }
  }, [isReplayMode, currentUser, missionData, missionId, fetchUserProfile]);


  useEffect(() => {
    // This useEffect hook remains the same.
    if (!missionId || !currentUser?.uid) { setLoading(false); return; }
    if (missionData?.id === missionId && hasLoadedMissionRef.current && !isReplayMode) { setLoading(false); return; }
    if (missionData?.id !== missionId || (isReplayMode && hasLoadedMissionRef.current)) { hasLoadedMissionRef.current = false; }
    const loadMission = async () => {
      if (hasLoadedMissionRef.current) return;
      hasLoadedMissionRef.current = true;
      setLoading(true);
      setError('');
      try {
        const missionRef = doc(db, "missions", missionId);
        const missionSnap = await getDoc(missionRef);
        if (!missionSnap.exists()) {
          setError("Mission not found."); hasLoadedMissionRef.current = false; return;
        }
        const mission = { id: missionSnap.id, ...missionSnap.data() };
        setMissionData(mission);
        if (!isReplayMode && userProfile) { 
          const isMissionCompletedByUser = userProfile.completedMissions?.includes(missionId);
          if (isMissionCompletedByUser) {
            setIsSessionComplete(true);
            setFeedback({ message: "This case has already been closed. You can replay it if you wish.", type: 'success' });
            setCurrentStepIndex(mission.steps.length - 1);
          } else {
            const savedStep = userProfile.activeMissions?.[missionId] || 0;
            setCurrentStepIndex(savedStep);
          }
        } else {
            setCurrentStepIndex(0);
            setIsSessionComplete(false);
            setFeedback({ message: '', type: '' });
        }
      } catch (err) { 
        setError("Failed to load mission data.");
        console.error("MissionView: Error in loadMission useEffect:", err);
        hasLoadedMissionRef.current = false;
      } finally { setLoading(false); }
    };
    loadMission();
  }, [missionId, currentUser, isReplayMode, userProfile, saveProgress]);

  if (loading || (currentUser && !userProfile)) { 
    return <LoadingSpinner message="Loading Mission Data..." />;
  }
  if (error) {
    return <div className="mission-status error">{error}</div>;
  }
  if (!missionData) {
    return <div className="mission-status">Mission data could not be loaded. Please select a mission from the list.</div>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || isSessionComplete || !currentStep) return;
    setIsSubmitting(true);
    const correctAnswer = String(currentStep.answer || "").toLowerCase();
    const userInput = inputValue.trim().toLowerCase();
    if (userInput === correctAnswer) {
      setFeedback({ message: currentStep.successMessage || "Correct! Finalizing...", type: 'success' });
      const isLastStep = currentStepIndex >= missionData.steps.length - 1;
      await new Promise(resolve => setTimeout(resolve, 2000));
      if (isLastStep) {
        // --- THIS IS THE CRITICAL FIX ---
        try {
          if (!isReplayMode) { 
            await completeMission(); 
          }
          // If completeMission succeeds, we can finally show the success screen
          setIsSessionComplete(true);
          setFeedback({ message: isReplayMode ? "Replay complete." : "Mission Complete!", type: 'success' });

        } catch (err) {
          // If completeMission fails, catch the error and show it to the user
          console.error("Failed during final mission completion step:", err);
          setFeedback({ message: "Error finalizing mission. Please try again.", type: 'error' });
        } finally {
          // No matter what, stop the submitting process
          setIsSubmitting(false);
        }
        // --- END OF FIX ---
      } else {
        try {
          const nextStepIndex = currentStepIndex + 1;
          if (!isReplayMode) { await saveProgress(nextStepIndex); }
          setCurrentStepIndex(nextStepIndex); 
          setInputValue('');
          setFeedback({ message: '', type: '' });
        } catch (err) {
          console.error("Failed to save progress for next step:", err);
          setFeedback({ message: "Error saving progress. Please try again.", type: 'error' });
        } finally {
          setIsSubmitting(false);
        }
      }
    } else {
      setFeedback({ message: "Incorrect flag. Try again.", type: 'error' });
      setIsSubmitting(false);
    }
  };
  
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    if (feedback.type === 'error') {
        setFeedback({ message: '', type: '' });
    }
  };

  const renderTool = () => {
    if (isSessionComplete && !isReplayMode) { return <div className="mission-status">CASE CLOSED</div>; }
    if (!currentStep) return null;
    const componentKey = `tool-${currentStepIndex}-${currentStep.tool || 'terminal'}-${isSessionComplete}`; 
    switch (currentStep.tool) {
      case 'fileViewer':
        const fileName = currentStep.filesystem && Object.keys(currentStep.filesystem).length > 0 ? Object.keys(currentStep.filesystem)[0] : null;
        const fileData = fileName ? currentStep.filesystem[fileName] : null;
        if (!fileData || fileData.type !== 'image') { return <div className="mission-status error">Error: Image file data not found for this step.</div>; }
        return <FileViewer key={componentKey} fileData={fileData} />;
      case 'terminal':
      default:
        return <Terminal key={componentKey} filesystem={currentStep.filesystem} />;
    }
  };

  return (
    <div className="mission-view-container">
      <div key={`briefing-${currentStepIndex}-${isSessionComplete}`} className="mission-briefing-panel">
        <h2>Case Briefing</h2>
        <p>{typedBriefing}{typedBriefing.length < (fullBriefing?.length || 0) && <span className="blinking-cursor">_</span>}</p>
      </div>
      <div key={`tool-${currentStepIndex}-${isSessionComplete}`} className="mission-tool-panel">{renderTool()}</div>
      <div key={`answer-panel-${isSessionComplete}`} className="mission-answer-panel">
        {isSessionComplete ? (
          <div className="mission-complete-actions">
            <p className={`feedback-message success`}>{feedback.message}</p>
            <button className="action-button" onClick={() => navigate('/profile#badges')}>View Rewards</button>
            <button className="action-button secondary" onClick={() => navigate('/missions')}>Return to Missions</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <input type="text" value={inputValue} onChange={handleInputChange} placeholder="Enter flag..." className="answer-input" disabled={isSubmitting} />
            <button type="submit" className="submit-button" disabled={isSubmitting}>{isSubmitting ? 'Verifying...' : 'Submit'}</button>
            {feedback.message && (<p className={`feedback-message ${feedback.type}`}>{feedback.message}</p>)}
          </form>
        )}
      </div>
    </div>
  );
};

export default MissionView;