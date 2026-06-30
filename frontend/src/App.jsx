import React, { useState, useEffect } from 'react';
import Signup from './components/Signup';
import Login from './components/Login';
import Welcome from './components/Welcome';

function App() {
  const [token, setToken] = useState(null);
  const [view, setView] = useState('login'); // 'login' | 'signup' | 'welcome'

  useEffect(() => {
    // Check if token exists in localStorage on startup
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      setView('welcome');
    } else {
      setView('login');
    }
  }, []);

  const handleLoginSuccess = (userToken) => {
    setToken(userToken);
    setView('welcome');
  };

  const handleLogout = () => {
    setToken(null);
    setView('login');
  };

  return (
    <>
      {view === 'login' && (
        <div className="auth-container">
          <Login 
            onLoginSuccess={handleLoginSuccess} 
            onNavigateToSignup={() => setView('signup')} 
          />
        </div>
      )}
      
      {view === 'signup' && (
        <div className="auth-container">
          <Signup 
            onNavigateToLogin={() => setView('login')} 
          />
        </div>
      )}
      
      {view === 'welcome' && (
        <Welcome 
          onLogout={handleLogout} 
        />
      )}
    </>
  );
}

export default App;
