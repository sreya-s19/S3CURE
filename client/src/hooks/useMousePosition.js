// client/src/hooks/useMousePosition.js
import { useState, useEffect } from 'react';

export const useMousePosition = (ref) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Check if the ref is connected to an element
    if (!ref.current) return;

    const element = ref.current;

    const handleMouseMove = (e) => {
      // Get the position of the element on the page
      const rect = element.getBoundingClientRect();
      // Calculate the mouse position relative to the element's top-left corner
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setPosition({ x, y });
    };

    element.addEventListener('mousemove', handleMouseMove);

    // Cleanup function to remove the event listener
    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
    };
  }, [ref]); // Rerun effect if the ref changes

  return position;
};