import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import LiveTracking from './pages/LiveTracking';
import Vehicles from './pages/Vehicles';
import Drivers from './pages/Drivers';
import Dispatch from './pages/Dispatch';
import Reports from './pages/Reports';
import Login from './pages/Login';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [activeView, setActiveView] = useState(() => {
    return localStorage.getItem('activeView') || 'dashboard';
  });
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('user', JSON.stringify(userData));
    if (userData.id) {
      localStorage.setItem('userId', userData.id);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    localStorage.removeItem('activeView');
    localStorage.removeItem('token');
    setActiveView('dashboard');
  };

  const handleNavigate = (view) => {
    setActiveView(view);
    localStorage.setItem('activeView', view);
    setIsSidebarOpen(false); // Close sidebar on mobile after navigation
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard user={user} />;
      case 'live-tracking':
        return <LiveTracking user={user} />;
      case 'fleet':
      case 'trips':
        return <Vehicles user={user} />;
      case 'drivers':
        return <Drivers user={user} />;
      case 'orders':
      case 'dispatch':
        return <Dispatch user={user} />;
      case 'reports':
        return <Reports user={user} />;
      default:
        return <Dashboard user={user} />;
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  const isEdgeToEdge = activeView === 'live-tracking';

  return (
    <div className="app-container">
      <div 
        className={`sidebar-overlay ${isSidebarOpen ? 'active' : ''}`} 
        onClick={() => setIsSidebarOpen(false)} 
      />
      <Sidebar 
        activeView={activeView} 
        onNavigate={handleNavigate} 
        isOpen={isSidebarOpen} 
      />

      <main id="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <Header onLogout={handleLogout} onMenuClick={toggleSidebar} />

        <div
          id="viewport"
          className={`view-container ${isEdgeToEdge ? 'edge-to-edge' : ''}`}
          key={activeView}
        >
          {renderView()}
        </div>
      </main>

      {/* Floating Action Button */}
      <button className="fab">
        <span className="material-icons" style={{ fontSize: 32 }}>add</span>
      </button>
    </div>
  );
}

export default App;
