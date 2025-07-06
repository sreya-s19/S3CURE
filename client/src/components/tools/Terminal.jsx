// client/src/components/tools/Terminal.jsx
import { useState, useEffect, useRef } from 'react';
import './Terminal.css';

const Terminal = ({ filesystem }) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const terminalEndRef = useRef(null);

  // Automatically scroll to the bottom when new output is added
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleCommand = (command) => {
    const newHistory = [...history, { type: 'input', text: command }];
    const [cmd, ...args] = command.trim().split(' ');

    let output = '';

    switch (cmd.toLowerCase()) {
      case 'help':
        output = 'Available commands: help, ls, cat, clear, whoami';
        break;
      case 'ls':
        output = Object.keys(filesystem || {}).join('\n');
        break;
      case 'cat':
        const filename = args[0];
        if (!filename) {
          output = 'cat: missing operand. Usage: cat [filename]';
        } else if (filesystem && filesystem[filename]) {
          // --- THIS IS THE ROBUST FIX ---
          const file = filesystem[filename];
          // Check if the file is an object with a 'content' property, or just a simple string
          if (typeof file === 'object' && file !== null && file.content !== undefined) {
            output = file.content;
          } else if (typeof file === 'string') {
            output = file;
          } else {
            output = `cat: cannot read file '${filename}' - format is not recognized.`;
          }
        } else {
          output = `cat: ${filename}: No such file or directory`;
        }
        break;
      case 'clear':
        setHistory([]);
        return; // Exit early to prevent adding empty line to history
      case 'whoami':
        output = 'investigator';
        break;
      default:
        if (cmd) { // only show error if a command was actually typed
            output = `${command}: command not found. Type 'help' for available commands.`;
        }
        break;
    }

    if (output) { // only push output if there is something to show
        newHistory.push({ type: 'output', text: output });
    }
    setHistory(newHistory);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() === '') return;
    handleCommand(input);
    setInput('');
  };

  // Allow clicking on the terminal to focus the input
  const focusInput = () => {
    document.querySelector('.terminal-input')?.focus();
  };

  return (
    <div className="terminal-container" onClick={focusInput}>
      <div className="terminal-output">
        {history.map((line, index) => (
          <div key={index} className={`line ${line.type}`}>
            {line.type === 'input' && <span className="prompt">$ </span>}
            <pre>{line.text}</pre>
          </div>
        ))}
        <div className="line input">
          <span className="prompt">$ </span>
          <form onSubmit={handleSubmit} style={{ display: 'inline' }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="terminal-input"
            />
          </form>
        </div>
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
};

export default Terminal;