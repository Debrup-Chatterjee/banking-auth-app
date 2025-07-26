import React, { useEffect, useState } from 'react';
import { clearUserSession } from '../utils/auth';
import { useNavigate } from 'react-router-dom';
import { getLoginLogs } from '../utils/api';

function Dashboard() {
  const navigate = useNavigate();
  const email = localStorage.getItem('userEmail');
  const [logs, setLogs] = useState([]);

  const handleLogout = () => {
    clearUserSession();
    navigate('/');
  };

  useEffect(() => {
    if (email) {
      getLoginLogs(email)
        .then(setLogs)
        .catch(err => console.error('Failed to fetch logs:', err));
    }
  }, [email]);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
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
              <th style={thStyle}>Device Info</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, idx) => (
              <tr key={idx}>
                <td style={tdStyle}>{new Date(log.timestamp).toLocaleString()}</td>
                <td style={tdStyle}>{log.ip}</td>
                <td style={tdStyle}>{log.city}</td>
                <td style={tdStyle}>{log.region}</td>
                <td style={tdStyle}>{log.deviceInfo}</td>
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
