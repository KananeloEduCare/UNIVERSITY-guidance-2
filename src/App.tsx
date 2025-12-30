import React, { useState } from 'react';
import { useEffect } from 'react';
import { useDeviceType } from './hooks/useDeviceType';
import { User, logout } from './services/authService';
import { userStorage } from './services/userStorage';
import { counselorAuthService, Counselor } from './services/counselorAuthService';

// Desktop Components
import DesktopLogin from './components/Login';
import DesktopDashboard from './components/Dashboard';

// Mobile Components
import MobileLogin from './components/mobile/MobileLogin';
import MobileDashboard from './components/mobile/MobileDashboard';

// Counselor Components
import CounselorDashboard from './components/CounselorDashboard';

type UserMode = 'student' | 'counselor';

function App() {
  const [mode, setMode] = useState<UserMode | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentCounselor, setCurrentCounselor] = useState<Counselor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const deviceType = useDeviceType();

  useEffect(() => {
    const checkStoredUser = async () => {
      userStorage.clearUser();
      counselorAuthService.logout();

      setIsAuthenticated(false);
      setCurrentUser(null);
      setMode(null);
      setIsLoading(false);
    };

    checkStoredUser();
  }, []);

  const handleLogin = (user: User) => {
    console.log('User logged in:', user);
    setCurrentUser(user);
    setMode('student');
    setIsAuthenticated(true);
  };

  const handleCounselorLogin = (counselor: Counselor) => {
    setCurrentCounselor(counselor);
    setMode('counselor');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    if (mode === 'counselor') {
      counselorAuthService.logout();
    } else {
      logout();
    }
    setCurrentUser(null);
    setIsAuthenticated(false);
    setMode(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#04adee] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (mode === 'counselor' && isAuthenticated && currentCounselor) {
    return (
      <div className="App">
        <CounselorDashboard counselor={currentCounselor} onLogout={handleLogout} />
      </div>
    );
  }

  if (mode === 'student' && isAuthenticated) {
    if (deviceType === 'mobile') {
      return (
        <div className="App">
          <MobileDashboard onLogout={handleLogout} user={currentUser} />
        </div>
      );
    }
    return (
      <div className="App">
        <DesktopDashboard onLogout={handleLogout} />
      </div>
    );
  }

  if (deviceType === 'mobile') {
    return (
      <div className="App">
        <MobileLogin onLogin={handleLogin} onCounselorLogin={handleCounselorLogin} />
      </div>
    );
  }

  return (
    <div className="App">
      <DesktopLogin onLogin={handleLogin} onCounselorLogin={handleCounselorLogin} />
    </div>
  );
}

export default App;