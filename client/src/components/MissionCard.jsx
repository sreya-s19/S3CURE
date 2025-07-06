// client/src/components/MissionCard.jsx
import { Link } from 'react-router-dom';
import { useRef } from 'react';
import { useMousePosition } from '../hooks/useMousePosition';
import './MissionCard.css';

const MissionCard = ({ mission, completedMissions }) => {
  const cardRef = useRef(null);
  const { x, y } = useMousePosition(cardRef);

  // --- FIX: A more robust check to prevent errors ---
  // This ensures 'completedMissions' is a valid array before we try to use .includes()
  const isCompleted = Array.isArray(completedMissions) && completedMissions.includes(mission.id);

  const difficultyClass = `difficulty-${mission.difficulty.toLowerCase()}`;

  return (
    <div 
      ref={cardRef} 
      className="mission-card"
      style={{
        '--mouse-x': `${x}px`,
        '--mouse-y': `${y}px`,
      }}
    >
      {/* This will now render correctly based on the robust 'isCompleted' check */}
      {isCompleted && <div className="completed-badge">Case Closed</div>}

      <div className="mission-header">
        <h2 className="mission-title">{mission.title}</h2>
        <span className={`mission-difficulty ${difficultyClass}`}>
          {mission.difficulty}
        </span>
      </div>
      <p className="mission-briefing">{mission.briefing}</p>

      {/* This conditional rendering will also now work reliably */}
      {isCompleted ? (
        <Link to={`/mission/${mission.id}?replay=true`} className="mission-replay-button">
          Replay Case
        </Link>
      ) : (
        <Link to={`/mission/${mission.id}`} className="mission-start-button">
          Start Investigation
        </Link>
      )}
    </div>
  );
};

export default MissionCard;