import { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

function App() {
  const userEmail = localStorage.getItem('userEmail');
  const navigate = useNavigate();

  // Redirect to /dashboard if already logged in and currently at /
  useEffect(() => {
    if (userEmail && window.location.pathname === '/') {
      navigate('/dashboard');
    }
  }, [userEmail, navigate]);

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route
        path="/dashboard"
        element={userEmail ? <Dashboard /> : <Navigate to="/" />}
      />
    </Routes>
  );
}

export default App;
