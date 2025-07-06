// client/src/hooks/useTypewriter.js
import { useState, useEffect } from 'react';

/**
 * A custom React hook that simulates a typewriter effect.
 * @param {string} text - The full text to be typed out.
 * @param {number} speed - The typing speed in milliseconds per character.
 * @returns {string} - The portion of the text that has been "typed" so far.
 */
export const useTypewriter = (text, speed = 50) => {
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    // Reset the displayText whenever the input 'text' changes.
    // This is crucial for when the user moves to a new mission step.
    setDisplayText('');

    if (text) {
      let i = 0;
      // Set an interval to add one character at a time.
      const typingInterval = setInterval(() => {
        if (i < text.length) {
          setDisplayText(text.slice(0, i + 1));
          i++;
        } else {
          clearInterval(typingInterval);
        }
      }, speed);


      // Cleanup function: This will be called if the component unmounts
      // or if the 'text' prop changes before the typing is finished.
      return () => {
        clearInterval(typingInterval);
      };
    }
  }, [text, speed]); // The effect re-runs if 'text' or 'speed' changes.

  return displayText;
};