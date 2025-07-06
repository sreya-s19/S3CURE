// client/src/pages/AdminPage.jsx
import { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { useApp } from '../context/AppContext';
import MissionCreator from '../components/admin/MissionCreator';
import LoadingSpinner from '../components/LoadingSpinner';
import './AdminPage.css';

const db = getFirestore();

const AdminPage = () => {
  const [missions, setMissions] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingMission, setEditingMission] = useState(null);
  const { currentUser } = useApp();

  // This is the new, more robust useEffect structure.
  useEffect(() => {
    // We define an async function inside the effect.
    const fetchAdminData = async () => {
      setLoading(true); // Set loading to true at the start.
      try {
        console.log("AdminPage: Fetching all missions...");
        const missionsSnapshot = await getDocs(collection(db, 'missions'));
        const missionsList = missionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        missionsList.sort((a, b) => a.title.localeCompare(b.title));
        setMissions(missionsList);
        console.log("AdminPage: Missions fetched successfully.");

        console.log("AdminPage: Fetching all users...");
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsers(usersList);
        console.log("AdminPage: Users fetched successfully.");

      } catch (err) {
        console.error("CRITICAL ERROR fetching admin data:", err);
        setError("Failed to load dashboard data. This is likely a Firestore Security Rules issue. Please verify your admin status and rules.");
      } finally {
        // This 'finally' block will ALWAYS run, whether the try succeeded or failed.
        // This guarantees the loading spinner will disappear.
        console.log("AdminPage: Data fetching process finished.");
        setLoading(false);
      }
    };

    // Call the async function.
    fetchAdminData();
  }, []); // Empty dependency array means this runs only once.

  const handleDeleteMission = async (missionId) => {
    if (window.confirm("Are you sure you want to delete this mission?")) {
      await deleteDoc(doc(db, "missions", missionId));
      setMissions(prev => prev.filter(m => m.id !== missionId));
    }
  };
  
  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      await deleteDoc(doc(db, "users", userId));
      setUsers(prev => prev.filter(u => u.id !== userId));
    }
  };

  const handleFormFinish = async () => {
    setEditingMission(null);
    // Instead of a full refetch, you could just update the specific mission in state.
    // But a refetch is simpler and fine for an admin panel.
    const missionsSnapshot = await getDocs(collection(db, 'missions'));
    const missionsList = missionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    missionsList.sort((a, b) => a.title.localeCompare(b.title));
    setMissions(missionsList);
  };

  if (loading) {
    return <LoadingSpinner message="Loading Admin Dashboard..." />;
  }

  if (error) {
    return <div className="admin-container error-message">{error}</div>;
  }

  return (
    <div className="admin-container">
      <h1>Admin Dashboard</h1>

      <div className="admin-section">
        <h2>{editingMission ? `Editing: ${editingMission.title}` : 'Create New Mission'}</h2>
        <MissionCreator existingMission={editingMission} onFinish={handleFormFinish} />
      </div>
      
      <div className="admin-section">
        <h2>Manage Missions ({missions.length})</h2>
        <div className="manage-list">
          {missions.map(mission => (
            <div key={mission.id} className="list-item">
              <div className="item-details">
                <span className="item-title">{mission.title}</span>
                <span className="item-subtitle">{mission.difficulty}</span>
              </div>
              <div className="item-actions">
                <button className="action-button edit-button" onClick={() => setEditingMission(mission)}>Edit</button>
                <button className="action-button delete-button" onClick={() => handleDeleteMission(mission.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="admin-section">
        <h2>Manage Users ({users.length})</h2>
        <div className="manage-list">
          {users.map(user => (
            <div key={user.id} className="list-item">
              <div className="item-details">
                <span className="item-title">{user.username}</span>
                <span className="item-subtitle">{user.email} | Rank: {user.rank}</span>
              </div>
              <div className="item-actions">
                <button 
                  className="action-button delete-button" 
                  onClick={() => handleDeleteUser(user.id)}
                  disabled={user.id === currentUser?.uid}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;