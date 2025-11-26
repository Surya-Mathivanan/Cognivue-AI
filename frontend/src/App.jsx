import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';
import LoadingAnimation from './components/LoadingAnimation';
import TermsOfService from './components/TermsOfService';
import { getApiUrl } from './api';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.body.className = savedTheme;
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.body.className = newTheme;
  };

  useEffect(() => {
    fetch(getApiUrl('/api/user-info'), {
      credentials: 'include'
    })
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error('Not logged in');
    })
    .then(userData => {
      setUser(userData);
    })
    .catch(error => {
      console.log('User not logged in');
    })
    .finally(() => {
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <LoadingAnimation message="Initializing application..." size="large" />
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/" element={
            user ? (
              <Dashboard user={user} setUser={setUser} theme={theme} toggleTheme={toggleTheme} />
            ) : (
              <LoginScreen setUser={setUser} />
            )
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;