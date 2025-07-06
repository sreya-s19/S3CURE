// src/pages/ProfilePage.jsx
import React from 'react';
import { useApp } from '../context/AppContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Badge from '../components/Badge'; // <-- IMPORT OUR NEW, SIMPLIFIED BADGE COMPONENT
import './ProfilePage.css'; // Your existing CSS for the page

const ProfilePage = () => {
  const { userProfile, loadingApp, badges, missions } = useApp();

  if (loadingApp || !userProfile) {
    return <LoadingSpinner message="Loading Profile..." />;
  }
  
  // --- THIS IS THE KEY LOGIC ---
  // We process the badge data here to include the correct image path.
  const earnedBadgesData = badges
    .filter(badge => userProfile.badges?.includes(badge.id))
    .map(badge => {
      // Create a new object to avoid changing the original data
      return {
        ...badge, // Copy all original badge properties (id, name, description, level)
        // Construct the image path based on the badge's level.
        // This path directly corresponds to your files in the /public/badges directory.
        image: `/badges/${badge.level.toLowerCase()}.svg` 
      };
    });

  const completedMissions = missions.filter(mission =>
    userProfile.completedMissions?.includes(mission.id)
  );

  const joinDate = userProfile.createdAt?.toDate ? userProfile.createdAt.toDate().toLocaleDateString() : 'N/A';

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>{userProfile.username}</h1>
        <span className="profile-rank">{userProfile.rank}</span>
      </div>

      <div className="profile-details">
        <p><strong>Email:</strong> {userProfile.email}</p>
        <p><strong>Investigator ID:</strong> {userProfile.uid}</p>
        <p><strong>Joined:</strong> {joinDate}</p>
      </div>

      <div className="profile-section">
        <h2>EARNED BADGES ({earnedBadgesData.length})</h2>
        <div className="badges-grid">
          {earnedBadgesData.length > 0 ? (
            // Loop over our NEW processed data
            earnedBadgesData.map(badge => (
              // Pass the entire badge object (which now includes the image path)
              // to our simple Badge component.
              <Badge key={badge.id} badge={badge} />
            ))
          ) : (
            <p>No badges earned yet. Complete missions to unlock them!</p>
          )}
        </div>
      </div>

      <div className="profile-section">
        <h2>COMPLETED MISSIONS ({completedMissions.length})</h2>
        <div className="completed-missions-list">
           {completedMissions.length > 0 ? (
            completedMissions.map(mission => (
              <div key={mission.id} className="completed-mission-item">
                <span className="mission-title">{mission.title}</span>
                <span className={`mission-difficulty ${mission.difficulty}`}>{mission.difficulty}</span>
              </div>
            ))
          ) : (
            <p>Mission history will be displayed here.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;