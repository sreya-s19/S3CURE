// src/components/Badge.jsx
import React from 'react';
import './Badge.css'; // We will use the new CSS below

// This component is now much simpler.
// It receives a 'badge' object that includes the 'image' path.
const Badge = ({ badge }) => {
  // If badge data is missing, don't render anything.
  if (!badge) {
    return null;
  }

  return (
    // The container has 'data-*' attributes. Our CSS will use these
    // to create the tooltip automatically on hover.
    <div 
      className="badge-container" 
      data-title={badge.name} 
      data-description={badge.description}
    >
      <img src={badge.image} alt={badge.name} className="badge-image" />
    </div>
  );
};

export default Badge;