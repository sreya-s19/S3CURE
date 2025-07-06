// client/src/components/admin/MissionCreator.jsx
import { useState, useEffect } from 'react';
import { getFirestore, collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import './MissionCreator.css';

const MissionCreator = ({ existingMission, onFinish }) => {
  const [title, setTitle] = useState('');
  const [briefing, setBriefing] = useState('');
  const [difficulty, setDifficulty] = useState('easy');
  const [badgeId, setBadgeId] = useState('');
  const [steps, setSteps] = useState([{ tool: 'terminal', prompt: '', answer: '', successMessage: '' }]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!existingMission;
  const db = getFirestore();

  useEffect(() => {
    if (isEditing && existingMission) {
      setTitle(existingMission.title || '');
      setBriefing(existingMission.briefing || '');
      setDifficulty(existingMission.difficulty || 'easy');
      setBadgeId(existingMission.badgeId || '');
      setSteps(existingMission.steps && existingMission.steps.length > 0 
        ? existingMission.steps 
        : [{ tool: 'terminal', prompt: '', answer: '', successMessage: '' }]
      );
    } else {
      resetForm();
    }
  }, [existingMission, isEditing]);

  const resetForm = () => {
    setTitle('');
    setBriefing('');
    setDifficulty('easy');
    setBadgeId('');
    setSteps([{ tool: 'terminal', prompt: '', answer: '', successMessage: '' }]);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!title || !briefing || steps.some(step => !step.prompt || !step.answer)) {
        throw new Error("All required fields must be filled.");
      }

      // --- THIS IS THE FIX ---
      // We build the payload carefully, ensuring no undefined values.
      const missionPayload = {
        title: title,
        briefing: briefing,
        difficulty: difficulty,
        status: 'Available',
        badgeId: badgeId || null, // Convert empty string to null
        steps: steps.map(step => ({
          tool: step.tool || 'terminal',
          prompt: step.prompt || '',
      	  answer: step.answer || '',
          successMessage: step.successMessage || '',
          // Preserve existing filesystem data during an edit, or default to an empty object
          filesystem: step.filesystem || {} 
        }))
      };

      if (isEditing) {
        const missionRef = doc(db, "missions", existingMission.id);
        await updateDoc(missionRef, missionPayload);
      } else {
        await addDoc(collection(db, "missions"), missionPayload);
      }
      
      onFinish();
      
    } catch (err) {
      console.error("Error saving mission:", err);
      // Give a more specific error message if it's the undefined issue
      const userMessage = err.message.includes("undefined")
        ? "A field was left empty or has invalid data. Please check all steps."
        : "An error occurred while saving the mission.";
      setError(userMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleStepChange = (index, field, value) => {
    const newSteps = [...steps];
    newSteps[index][field] = value;
    setSteps(newSteps);
  };

  const addStep = () => {
    setSteps([...steps, { tool: 'terminal', prompt: '', answer: '', successMessage: '' }]);
  };

  const removeStep = (index) => {
    if (steps.length <= 1) return;
    const newSteps = steps.filter((_, i) => i !== index);
    setSteps(newSteps);
  };

  return (
    <div className="mission-creator">
      <h3>{isEditing ? `Editing: ${existingMission?.title || 'Mission'}` : 'Create New Mission'}</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Briefing (Overall Mission Description)</label>
          <textarea value={briefing} onChange={(e) => setBriefing(e.target.value)} required />
        </div>
        <div className="form-group-inline">
            <div className="form-group">
                <label>Difficulty</label>
                <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                    <option value="elite">Elite</option>
                </select>
            </div>
            <div className="form-group">
                <label>Badge ID (Optional)</label>
                <input type="text" value={badgeId} onChange={(e) => setBadgeId(e.target.value)} placeholder="e.g., ghost-in-server-1" />
            </div>
        </div>

        <hr className="form-divider" />
        <h4>Mission Steps</h4>
        {steps.map((step, index) => (
          <div key={index} className="step-form-group">
            <div className="step-header">
              <h5>Step {index + 1}</h5>
              <button type="button" onClick={() => removeStep(index)} className="remove-step-btn" disabled={steps.length <= 1}>
                Remove
              </button>
            </div>
            <div className="form-group">
              <label>Tool</label>
              <select value={step.tool} onChange={(e) => handleStepChange(index, 'tool', e.target.value)}>
                <option value="terminal">Terminal</option>
                <option value="fileViewer">File Viewer</option>
              </select>
            </div>
            <div className="form-group">
              <label>Prompt / Briefing for this step</label>
              <textarea value={step.prompt} onChange={(e) => handleStepChange(index, 'prompt', e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Answer / Flag for this step</label>
              <input type="text" value={step.answer} onChange={(e) => handleStepChange(index, 'answer', e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Success Message for this step</label>
              <input type="text" value={step.successMessage} onChange={(e) => handleStepChange(index, 'successMessage', e.target.value)} required />
            </div>
          </div>
        ))}
        <button type="button" onClick={addStep} className="add-step-btn">+ Add Another Step</button>
        <hr className="form-divider" />

        <div className="form-actions">
            {isEditing && (
              <button type="button" className="cancel-btn" onClick={onFinish}>
                Cancel Edit
              </button>
            )}
            <button type="submit" className="submit-mission-btn" disabled={loading}>
                {loading ? 'Saving...' : (isEditing ? 'Update Mission' : 'Create Mission')}
            </button>
        </div>
        {error && <p className="form-error">{error}</p>}
      </form>
    </div>
  );
};

export default MissionCreator;