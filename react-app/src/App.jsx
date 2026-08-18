import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import PlayBack from './pages/PlayBack';
import MapPage from './pages/MapPage';
import LiveTracking from './pages/LiveTracking';
import Vehicles from './pages/Vehicles';
import Drivers from './pages/Drivers';
import Dispatch from './pages/Dispatch';
import Reports from './pages/Reports';
import Login from './pages/Login';
import TripHistory from './pages/TripHistory';
import VehicleControl from './pages/VehicleControl';
import BrandList from './pages/BrandList';
import ModelList from './pages/ModelList';
import VehicleTypesList from './pages/VehicleTypesList';
import ExpiredVehicles from './pages/ExpiredVehicles';
import InactiveDevices from './pages/InactiveDevices';

import DataPlans from './pages/DataPlans';
import OverspeedAlerts from './pages/OverspeedAlerts';
import VideoTutorials from './pages/VideoTutorials';
import PromoVideos from './pages/PromoVideos';
import Statistics from './pages/Statistics';
import Support from './pages/Support';
import Faq from './pages/Faq';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Settings from './pages/Settings';
import ApiDocs from './pages/ApiDocs';
import Documents from './pages/Documents';
import Warranties from './pages/Warranties';
import AssignToAdmin from './pages/AssignToAdmin';
import Inventory from './pages/Inventory';
import AdminDevices from './pages/AdminDevices';
import User from './pages/User';
import CreateVendor from './pages/CreateVendor';
import Notifications from './pages/Notifications';
import GlobalVideos from './pages/GlobalVideos';
import LocalVideos from './pages/LocalVideos';
import Banners from './pages/Banners';
import VideoTutorialCategories from './pages/VideoTutorialCategories';
import ThemeSettings from './pages/ThemeSettings';
import CommandCenter from './pages/CommandCenter';
import GeneralSettings from './pages/GeneralSettings';
import DummyDataDownload from './pages/DummyDataDownload';

import { BASE_URL } from './utils/network';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true' && !!localStorage.getItem('user');
  });
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [urlImei, setUrlImei] = useState(() => {
    const match = window.location.pathname.match(/^\/?(\d{10,20})\/?$/);
    return match ? match[1] : null;
  });

  const [activeView, setActiveView] = useState(() => {
    const match = window.location.pathname.match(/^\/?(\d{10,20})\/?$/);
    if (match) return 'command-center';
    return localStorage.getItem('activeView') || 'dashboard';
  });

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

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
      const adminOnlyViews = ['dashboard', 'api-docs', 'promo-videos', 'dispatch', 'video-tutorials', 'video-tutorial-categories'];
      const superadminOnlyViews = ['assign-to-admin', 'inventory', 'user', 'local-videos', 'banners', 'command-center', 'general-settings'];
      const strictAdminOnlyViews = ['admin-devices', 'global-videos'];

      if (!['admin', 'superadmin'].includes(role) && (adminOnlyViews.includes(activeView) || activeView === 'dashboard')) {
        setActiveView('play-back');
        localStorage.setItem('activeView', 'play-back');
      } else if (role !== 'superadmin' && superadminOnlyViews.includes(activeView)) {
        setActiveView('dashboard');
        localStorage.setItem('activeView', 'dashboard');
      } else if (role !== 'admin' && strictAdminOnlyViews.includes(activeView)) {
        setActiveView('dashboard');
        localStorage.setItem('activeView', 'dashboard');
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
    if (['admin', 'superadmin'].includes(role)) {
      setActiveView('dashboard');
      localStorage.setItem('activeView', 'dashboard');
    } else {
      setActiveView('play-back');
      localStorage.setItem('activeView', 'play-back');
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
    if (view !== 'command-center') {
      localStorage.setItem('activeView', view);
    }
    // Clean up the URL if we navigate away from command center
    if (window.location.pathname !== '/' && view !== 'command-center') {
      window.history.pushState({}, '', '/');
      setUrlImei(null);
    }
    setIsSidebarOpen(false); // Close sidebar on mobile after navigation
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard user={user} onNavigate={handleNavigate} />;
      case 'play-back':
        return <PlayBack user={user} />;
      case 'live-tracking':
        return <LiveTracking user={user} />;
      case 'map':
        return <MapPage user={user} />;
      case 'trips':
        return <TripHistory user={user} />;
      case 'fleet':
        return <Vehicles user={user} />;
      case 'brand-list':
        return <BrandList />;
      case 'model-list':
        return <ModelList />;
      case 'vehicle-Type':
        return <VehicleTypesList />;
      case 'expired-vehicle':
        return <ExpiredVehicles />;
      case 'inactive-devices':
        return <InactiveDevices />;
      case 'vehicle-control':
        return <VehicleControl user={user} />;
      case 'data-plans':
        return <DataPlans user={user} />;
      case 'overspeed':
        return <OverspeedAlerts user={user} />;
      case 'video-tutorials':
        return <VideoTutorials />;
      case 'video-tutorial-categories':
        return <VideoTutorialCategories />;
      case 'promo-videos':
        return <PromoVideos />;
      case 'statistics':
        return <Statistics user={user} />;
      case 'support':
        return <Support user={user} />;
      case 'faq':
        return <Faq />;
      case 'privacy':
        return <PrivacyPolicy />;
      case 'settings':
        return <Settings />;
      case 'api-docs':
        return <ApiDocs />;
      case 'documents':
        return <Documents user={user} />;
      case 'warranties':
        return <Warranties user={user} />;
      case 'admin-devices':
        return <AdminDevices user={user} />;


      case 'drivers':
        return <Drivers user={user} />;
      case 'dispatch':
        return <Dispatch user={user} />;
      case 'assign-to-admin':
        return <AssignToAdmin user={user} />;
      case 'inventory':
        return <Inventory user={user} />;
      case 'reports':
        return <Reports user={user} />;
      case 'user':
        return <User user={user} />;
      case 'create-vendor':
        return <CreateVendor user={user} />;
      case 'notifications':
        return <Notifications onNavigate={handleNavigate} />;
      case 'global-videos':
        return <GlobalVideos user={user} />;
      case 'local-videos':
        return <LocalVideos user={user} />;
      case 'banners':
        return <Banners user={user} />;
      case 'theme-settings':
        return <ThemeSettings user={user} />;
      case 'command-center':
        return <CommandCenter user={user} initialImei={urlImei} />;
      case 'general-settings':
        return <GeneralSettings />;
      case 'dummy-data':
        return <DummyDataDownload />;
      default:
        return <Dashboard user={user} onNavigate={handleNavigate} />;
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} logoUrl={logoUrl} />;
  }

  const isEdgeToEdge = activeView === 'play-back' || activeView === 'live-tracking';

  const getPageInfo = (view) => {
    const info = {
      'dashboard': { title: 'Dashboard', subtitle: 'Real-time performance metrics and operational capacity.' },
      'live-tracking': { title: 'Live Tracking', subtitle: 'Real-time asset tracking and tail generation.' },
      'play-back': { title: 'Play Back', subtitle: 'Historical route and asset tracking.' },
      'map': { title: 'Devices Map', subtitle: 'Global view of all connected fleet devices.' },
      'fleet': { title: 'Vehicle Management', subtitle: 'Manage fleet assets, vehicles and details.' },
      'brand-list': { title: 'Brand List', subtitle: 'View all registered vehicle brands and makers.' },
      'model-list': { title: 'Model List', subtitle: 'View all registered vehicle models and specs.' },
      'vehicle-Type': { title: 'Vehicle Types', subtitle: 'View supported vehicle types and fuel configurations.' },
      'expired-vehicle': { title: 'Expired Vehicles', subtitle: 'View vehicles with expired warranties.' },
      'inactive-devices': { title: 'Inactive Devices', subtitle: 'View devices without data for 5+ days.' },
      'inventory': { title: 'Inventory', subtitle: 'Manage stock and available devices.' },
      'assign-to-admin': { title: 'Admin Management', subtitle: 'Allocate inventory to administrative users.' },
      'vehicle-control': { title: 'Vehicle Control', subtitle: 'Remote management and engine controls.' },
      'data-plans': { title: 'Data Plans', subtitle: 'Manage SIM connectivity and data subscriptions.' },
      'overspeed': { title: 'Speed Limit Alerts', subtitle: 'Configure and monitor speeding thresholds.' },
      'statistics': { title: 'Statistics', subtitle: 'Historical performance and analytics.' },
      'trips': { title: 'Trips', subtitle: 'View detailed trip logs and playbacks.' },
      'documents': { title: 'Documents', subtitle: 'Centralized document storage for the fleet.' },
      'warranties': { title: 'Warranties', subtitle: 'Track hardware warranty periods and statuses.' },
      'admin-devices': { title: 'My Devices', subtitle: 'View and manage devices assigned to you.' },
      'user': { title: 'User', subtitle: 'Create and manage system user accounts.' },
      'create-vendor': { title: 'Vendor Management', subtitle: 'Create and manage vendor accounts.' },
      'api-docs': { title: 'API Docs', subtitle: 'System integration and developer documentation.' },
      'video-tutorials': { title: 'Video Tutorials', subtitle: 'Learn how to use the platform effectively.' },
      'promo-videos': { title: 'Promo Videos', subtitle: 'Promotional materials and marketing videos.' },
      'settings': { title: 'Settings', subtitle: 'System configuration and preferences.' },
      'support': { title: 'Support', subtitle: 'Get help and contact the support team.' },
      'faq': { title: 'FAQ', subtitle: 'Frequently Asked Questions.' },
      'privacy': { title: 'Privacy Policy', subtitle: 'Data handling and consent.' },
      'notifications': { title: 'Notifications', subtitle: 'All system alerts and activity events.' },
      'global-videos': { title: 'Global Videos', subtitle: 'Assign specific videos directly to vehicle IMEIs.' },
      'local-videos': { title: 'Local Videos', subtitle: 'Manage local video content for the platform.' },
      'banners': { title: 'Banners', subtitle: 'Manage promotional banners and images.' },
      'theme-settings': { title: 'Theme Config', subtitle: 'Update UI themes and colors.' },
      'video-tutorial-categories': { title: 'Video Tutorial Categories', subtitle: 'Manage your categories for video tutorials.' },
      'command-center': { title: 'Master Command Center', subtitle: 'L57 Protocol GPS Live Console' },
      'general-settings': { title: 'General Settings', subtitle: 'Manage core business details.' },
      'dummy-data': { title: 'Download Dummy Data', subtitle: 'Download dummy logs as text file.' }
    };
    return info[view] || { title: 'Dashboard', subtitle: 'Overview' };
  }

  const currentInfo = getPageInfo(activeView);

  return (
    <div className="app-container">
      {!urlImei && (
        <>
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
        </>
      )}

      <main id="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', minWidth: 0 }}>
        {!urlImei && (
          <Header onLogout={handleLogout} onMenuClick={toggleSidebar} title={currentInfo.title} subtitle={currentInfo.subtitle} theme={theme} toggleTheme={toggleTheme} />
        )}

        <div
          id="viewport"
          className={`view-container ${isEdgeToEdge || urlImei ? 'edge-to-edge' : ''}`}
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
