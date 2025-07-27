import React, { useCallback, useEffect, useState } from 'react';
import { clearUserSession } from '../utils/auth';
import { useNavigate } from 'react-router-dom';
import { getLoginLogs } from '../utils/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Dashboard() {
  const navigate = useNavigate();
  const email = localStorage.getItem('userEmail');
  const [logs, setLogs] = useState([]);

  const handleLogout = () => {
    clearUserSession();
    navigate('/');
  };

  const fetchLoginHistory = useCallback(() => {
    if (email) {
      getLoginLogs(email)
        .then(setLogs)
        .catch(err => console.error('Failed to fetch logs:', err));
    }
  },[email]); // email is a dependency

  useEffect(() => {
    fetchLoginHistory();
  }, [fetchLoginHistory]);

 const sendFeedback = async (logId, feedback) => {
  try {
    await fetch('http://localhost:5000/api/logins/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ logId, feedback })
    });

    if (feedback === 'confirmed') {
      toast.success('✅ You confirmed: This was you', {
        position: 'top-center',
        autoClose: 2500,
      });
    } else {
      toast.error('⚠️ You reported: This wasn’t you', {
        position: 'top-center',
        autoClose: 2500,
      });
    }

    fetchLoginHistory(); // refresh logs
  } catch (err) {
    console.error('Error sending feedback:', err);
    toast.error('❌ Failed to submit feedback', {
      position: 'top-center',
      autoClose: 2500,
    });
  }
};

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <ToastContainer position="top-center" autoClose={4500} hideProgressBar={false} />
      <h2>Welcome, {email}</h2>
      <p>This is your dashboard.</p>
      <button onClick={handleLogout}>Logout</button>

      <h3 style={{ marginTop: '30px' }}>Login History</h3>
      {logs.length === 0 ? (
        <p>No login records found.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
          <thead>
            <tr>
              <th style={thStyle}>Timestamp</th>
              <th style={thStyle}>IP</th>
              <th style={thStyle}>City</th>
              <th style={thStyle}>Region</th>
              <th style={thStyle}>Country</th>
              <th style={thStyle}>Timezone</th>
              <th style={thStyle}>User Agent</th>
              <th style={thStyle}>Anomaly</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, idx) => (
              <tr key={idx}>
                <td style={tdStyle}>{new Date(log.timestamp).toLocaleString()}</td>
                <td style={tdStyle}>{log.ip}</td>
                <td style={tdStyle}>{log.city}</td>
                <td style={tdStyle}>{log.region}</td>
                <td style={tdStyle}>{log.country || '-'}</td>
                <td style={tdStyle}>{log.timezone || '-'}</td>
                <td style={{ ...tdStyle, maxWidth: '200px', wordBreak: 'break-word' }}>
                  {log.userAgent || 'N/A'}
                </td>
                <td style={{ ...tdStyle }}>
                  {log.anomalous ? (
                    <div style={{ color: 'red' }}>
                      ⚠️ Yes
                      {log.feedback === 'confirmed' && <span style={{ color: 'green' }}> (You confirmed)</span>}
                      {log.feedback === 'rejected' && <span style={{ color: 'red' }}> (You rejected)</span>}
                      {!log.feedback && (
                        <div style={{ marginTop: '5px' }}>
                          <button
                            onClick={() => sendFeedback(log._id, 'confirmed')}
                            style={{ marginRight: '5px', padding: '4px 8px' }}
                          >
                            This was me
                          </button>
                          <button
                            onClick={() => sendFeedback(log._id, 'rejected')}
                            style={{ padding: '4px 8px' }}
                          >
                            This wasn't me
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <span style={{ color: 'green' }}>✓ No</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const thStyle = {
  border: '1px solid #ccc',
  padding: '8px',
  backgroundColor: '#f2f2f2',
  textAlign: 'left',
};

const tdStyle = {
  border: '1px solid #ccc',
  padding: '8px',
  textAlign: 'left',
};

export default Dashboard;
