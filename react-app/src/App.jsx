import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import LiveTracking from './pages/LiveTracking';
import Vehicles from './pages/Vehicles';
import Drivers from './pages/Drivers';
import Dispatch from './pages/Dispatch';
import Reports from './pages/Reports';
import Login from './pages/Login';
import TripHistory from './pages/TripHistory';
import VehicleControl from './pages/VehicleControl';

import DataPlans from './pages/DataPlans';
import OverspeedAlerts from './pages/OverspeedAlerts';
import VideoTutorials from './pages/VideoTutorials';
import PromoVideos from './pages/PromoVideos';
import Statistics from './pages/Statistics';
import Support from './pages/Support';
import Settings from './pages/Settings';
import ApiDocs from './pages/ApiDocs';
import Documents from './pages/Documents';
import Warranties from './pages/Warranties';

import { BASE_URL } from './utils/network';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true' && !!localStorage.getItem('user');
  });
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [activeView, setActiveView] = useState(() => {
    return localStorage.getItem('activeView') || 'dashboard';
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');

  // Fetch brand logo dynamically from API on mount
  useEffect(() => {
    fetch(`${BASE_URL}/api/logoUrl`)
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : (data?.result || data?.data || []);
        if (list.length > 0 && list[0].path) {
          setLogoUrl(list[0].path);
        }
      })
      .catch((err) => console.error('Error fetching logo in App.jsx:', err));
  }, []);

  // Synchronize latest user profile and role details on mount/refresh
  const userId = localStorage.getItem('userId') || user?.id || user?._id;
  useEffect(() => {
    if (!userId) return;
    fetch(`${BASE_URL}/user/userList/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.data?.length > 0) {
          const fetchedUser = data.data[0];
          setUser(fetchedUser);
          localStorage.setItem('user', JSON.stringify(fetchedUser));
        }
      })
      .catch((err) => console.error('Error syncing user profile in App.jsx:', err));
  }, [userId]);

  // Enforce page authorization controls: Redirect Customer to Live Tracking if on Admin-only page
  useEffect(() => {
    if (user) {
      const role = (user.role || '').toLowerCase();
      const adminOnlyViews = ['dashboard', 'api-docs', 'video-tutorials', 'promo-videos', 'dispatch'];
      
      if (role !== 'admin' && (adminOnlyViews.includes(activeView) || activeView === 'dashboard')) {
        setActiveView('live-tracking');
        localStorage.setItem('activeView', 'live-tracking');
      }
    }
  }, [user, activeView]);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('user', JSON.stringify(userData));
    if (userData.id) {
      localStorage.setItem('userId', userData.id);
    }
    
    // Default initial page view according to user role
    const role = (userData.role || '').toLowerCase();
    if (role === 'admin') {
      setActiveView('dashboard');
      localStorage.setItem('activeView', 'dashboard');
    } else {
      setActiveView('live-tracking');
      localStorage.setItem('activeView', 'live-tracking');
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
      case 'trips':
        return <TripHistory user={user} />;
      case 'fleet':
        return <Vehicles user={user} />;
      case 'vehicle-control':
        return <VehicleControl user={user} />;
      case 'data-plans':
        return <DataPlans user={user} />;
      case 'overspeed':
        return <OverspeedAlerts user={user} />;
      case 'video-tutorials':
        return <VideoTutorials />;
      case 'promo-videos':
        return <PromoVideos />;
      case 'statistics':
        return <Statistics user={user} />;
      case 'support':
        return <Support user={user} />;
      case 'settings':
        return <Settings />;
      case 'api-docs':
        return <ApiDocs />;
      case 'documents':
        return <Documents user={user} />;
      case 'warranties':
        return <Warranties user={user} />;


      case 'drivers':
        return <Drivers user={user} />;
      case 'dispatch':
        return <Dispatch user={user} />;
      case 'reports':
        return <Reports user={user} />;
      default:
        return <Dashboard user={user} />;
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} logoUrl={logoUrl} />;
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
        user={user}
        logoUrl={logoUrl}
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
      {/* <button className="fab">
        <span className="material-icons" style={{ fontSize: 32 }}>add</span>
      </button> */}
    </div>
  );
}

export default App;
