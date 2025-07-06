// client/src/pages/MissionsPage.jsx
import { useApp } from '../context/AppContext';
import MissionCard from '../components/MissionCard';
import LoadingSpinner from '../components/LoadingSpinner';
import './MissionsPage.css';

const MissionsPage = ({ userProfile }) => { // Receives userProfile as a prop
  const { missions, loading: appLoading } = useApp(); // Get static mission data from context

  // Check overall loading of the app
  if (appLoading) {
    return <LoadingSpinner message="Loading Case Files..." />;
  }

  // Filter missions to only show those with status "Available"
  const availableMissions = missions.filter(m => m.status === 'Available');

  return (
    <div className="missions-container">
      <h1 className="missions-title">Available Missions</h1>
      <div className="missions-grid">
        {availableMissions.length > 0 ? (
          availableMissions.map(mission => (
            <MissionCard 
              key={mission.id} 
              mission={mission} 
              completedMissions={userProfile?.completedMissions || []}
            />
          ))
        ) : (
          <p className="missions-status">No missions available at this time. Check back later, Investigator.</p>
        )}
      </div>
    </div>
  );
};

export default MissionsPage;