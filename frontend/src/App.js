import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import {
  auth,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from './firebase';

const actionCodeSettings = {
  url: 'http://localhost:3000',
  handleCodeInApp: true,
};

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [darkMode, setDarkMode] = useState(() =>
    localStorage.getItem('theme') === 'dark'
  );

  const toggleTheme = () => {
    const newTheme = !darkMode;
    setDarkMode(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', newTheme ? 'dark' : 'light');
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const getClientInfo = async () => {
    const ipRes = await axios.get('https://ipapi.co/json/');
    return {
      ip: ipRes.data.ip,
      city: ipRes.data.city,
      region: ipRes.data.region,
      deviceInfo: navigator.userAgent,
    };
  };

  const handleRegister = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      const clientInfo = await getClientInfo();
      await axios.post('http://localhost:5000/api/auth', { email, ...clientInfo });
      setMessage('Registration and login successful!');
    } catch (err) {
      setMessage(err.message);
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      const clientInfo = await getClientInfo();
      await axios.post('http://localhost:5000/api/auth', { email, ...clientInfo });
      setMessage('Login successful & logged.');
    } catch (err) {
      setMessage(err.message);
    }
  };

  const sendLink = async () => {
  try {
    const exists = await checkUserExists(email);
    if (!exists) {
      setMessage("This email is not registered. Please sign up first.");
      return;
    }
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    window.localStorage.setItem('emailForSignIn', email);
    setMessage('Check your email for login link');
  } catch (err) {
    setMessage(err.message);
  }
};


  const checkUserExists = async (email) => {
  try {
    const res = await axios.post('http://localhost:5000/api/checkUser', { email });
    return res.data.exists;
  } catch (err) {
    console.error("Error checking user existence:", err);
    return false;
  }
};


  useEffect(() => {
    const tryLogin = async () => {
      if (isSignInWithEmailLink(auth, window.location.href)) {
        let email = window.localStorage.getItem('emailForSignIn');
        if (!email) email = window.prompt('Please provide your email for confirmation');
        try {
          await signInWithEmailLink(auth, email, window.location.href);
          window.localStorage.removeItem('emailForSignIn');
          const clientInfo = await getClientInfo();
          await axios.post('http://localhost:5000/api/auth', { email, ...clientInfo });
          setMessage(`Welcome back, ${email}! Login successful.`);
        } catch (err) {
          setMessage('Login failed: ' + err.message);
        }
      }
    };
    tryLogin();
  }, []);

  return (
    <div className="app-container">
      <div className="glass-card">
        <div className="theme-toggle">
          <label className="switch-container">
            <input type="checkbox" checked={darkMode} onChange={toggleTheme} />
            <span className="slider"></span>
            <span className="switch-label">Dark Mode</span>
          </label>
        </div>

        <div className="logo-section">
          <div className="logo-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="main-title">SecureBank</h1>
          <p className="subtitle">Access your account securely</p>
        </div>

        <div className="auth-toggle">
          <label className="switch-container">
            <input
              type="checkbox"
              checked={useFallback}
              onChange={() => setUseFallback(!useFallback)}
            />
            <span className="slider"></span>
            <span className="switch-label">Use Email/Password</span>
          </label>
        </div>

        <div className="form-section">
          <div className="input-group">
            <div className="input-wrapper">
              <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input"
              />
            </div>
          </div>

          {useFallback && (
            <>
              <div className="input-group">
                <div className="input-wrapper">
                  <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="12" cy="16" r="1" fill="currentColor"/>
                    <path d="M7 11V7A5 5 0 0 1 17 7V11" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="input"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20C7 20 2.73 16.39 1 12A11.4 11.4 0 0 1 6.06 6.06L17.94 17.94Z" stroke="currentColor" strokeWidth="2"/>
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4C17 4 21.27 7.61 23 12A11.5 11.5 0 0 1 19.5 16.17" stroke="currentColor" strokeWidth="2"/>
                        <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button onClick={isRegister ? handleRegister : handleLogin} className="btn primary-btn">
                <span className="btn-text">{isRegister ? 'Create Account' : 'Sign In'}</span>
                <svg className="btn-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 3H19A2 2 0 0 1 21 5V19A2 2 0 0 1 19 21H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="10,17 15,12 10,7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="15" y1="12" x2="3" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              <p className="toggle-link" onClick={() => setIsRegister(!isRegister)}>
                {isRegister ? 'Already have an account? Sign in' : 'New to SecureBank? Create account'}
              </p>
            </>
          )}

          {!useFallback && (
  <>
    <button onClick={sendLink} className="btn secondary-btn">
      <span className="btn-text">Send Magic Link</span>
      <svg className="btn-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>

    <p className="toggle-link" onClick={() => { setUseFallback(true); setIsRegister(true); }}>
      New to SecureBank? Create account
    </p>
  </>
)}

        </div>
        

        {message && (
          <div className={`message ${message.includes('successful') || message.includes('Welcome')  || message.includes('Check your email') ? 'success' : 'error'}`}>
            <div className="message-icon">
              {message.includes('successful') || message.includes('Welcome')  || message.includes('Check your email') ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <polyline points="20,6 9,17 4,12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
                  <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
                </svg>
              )}
            </div>
            <span>{message}</span>
          </div>
        )}

        <div className="footer">
          <p>Protected by enterprise-grade security</p>
        </div>
      </div>
    </div>
  );
}

export default App;