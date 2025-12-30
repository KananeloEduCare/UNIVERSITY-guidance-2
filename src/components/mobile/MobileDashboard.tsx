import React, { useState } from 'react';
import { Menu, X, Bell, Search, User, GraduationCap, Award, FileText, BookOpen, MessageCircle } from 'lucide-react';
import { User as UserType } from '../../services/authService';
import MobileProfile from './MobileProfile';
import MobileAdmitProfiles from './MobileAdmitProfiles';
import MobileAdmitProfileDetailsPage from './MobileAdmitProfileDetailsPage';
import MobileScholarships from './MobileScholarships';
import MobileApplications from './MobileApplications';
import MobileResources from './MobileResources';
import MobileCounselors from './MobileCounselors';

export type MobilePage = 'profile' | 'admit-profiles' | 'scholarships' | 'applications' | 'resources' | 'counselors' | 'profile-details';

interface MobileDashboardProps {
  onLogout: () => void;
  user?: UserType | null;
}

const MobileDashboard: React.FC<MobileDashboardProps> = ({ onLogout, user }) => {
  const [currentPage, setCurrentPage] = useState<MobilePage>('profile');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);

  const menuItems = [
    { id: 'profile' as MobilePage, label: 'My Profile', icon: User, color: 'bg-blue-500' },
    { id: 'admit-profiles' as MobilePage, label: 'Admission Stories', icon: GraduationCap, color: 'bg-purple-500' },
    { id: 'scholarships' as MobilePage, label: 'Scholarships', icon: Award, color: 'bg-green-500' },
    { id: 'applications' as MobilePage, label: 'Applications', icon: FileText, color: 'bg-orange-500' },
    { id: 'resources' as MobilePage, label: 'Resources', icon: BookOpen, color: 'bg-red-500' },
    { id: 'counselors' as MobilePage, label: 'Counselors', icon: MessageCircle, color: 'bg-indigo-500' },
  ];

  const getCurrentPageTitle = () => {
    const page = menuItems.find(item => item.id === currentPage);
    return page?.label || 'EduCare';
  };

  const handleMenuClick = (page: MobilePage) => {
    setCurrentPage(page);
    setSidebarOpen(false);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'profile':
        return <MobileProfile user={user} />;
      case 'admit-profiles':
        return <MobileAdmitProfiles onViewProfile={(profileId: string) => {
          setSelectedProfileId(profileId);
          setCurrentPage('profile-details');
        }} />;
      case 'scholarships':
        return <MobileScholarships />;
      case 'applications':
        return <MobileApplications />;
      case 'resources':
        return <MobileResources />;
      case 'counselors':
        return <MobileCounselors />;
      case 'profile-details':
        return selectedProfileId ? (
          <MobileAdmitProfileDetailsPage
            profileId={selectedProfileId}
            onBack={() => setCurrentPage('admit-profiles')}
          />
        ) : null;
      default:
        return <MobileProfile user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3 safe-area-top">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-3 rounded-full bg-gray-100 active:bg-gray-200 transition-colors"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
          
          <div className="flex-1 text-center">
            <h1 className="text-lg font-bold text-gray-900">{getCurrentPageTitle()}</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="p-3 rounded-full bg-gray-100 active:bg-gray-200 transition-colors">
              <Search className="w-5 h-5 text-gray-700" />
            </button>
            <button className="p-3 rounded-full bg-gray-100 active:bg-gray-200 transition-colors relative">
              <Bell className="w-5 h-5 text-gray-700" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-bold">3</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="bg-gradient-to-r from-[#04adee] to-blue-600 px-6 py-8 safe-area-top">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <img 
                  src="/blue logo.png" 
                  alt="EduCare Logo" 
                  className="w-10 h-10 object-contain"
                />
                <div className="ml-3">
                  <h2 className="text-xl font-bold text-white">EduCare</h2>
                  <p className="text-blue-100 text-sm">University Guidance</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-full bg-white bg-opacity-20 active:bg-opacity-30 transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
            
            {/* User Info */}
            <div className="flex items-center">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {user?.name?.charAt(0) || 'S'}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-white font-semibold">{user?.name || 'Student'}</p>
                <p className="text-blue-100 text-sm">{user?.grade || 'Grade 12'}</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="flex-1 py-4">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className={`w-full flex items-center px-6 py-4 text-left transition-all duration-200 ${
                  currentPage === item.id
                    ? 'bg-blue-50 border-r-4 border-[#04adee]'
                    : 'hover:bg-gray-50 active:bg-gray-100'
                }`}
              >
                <div className={`w-10 h-10 ${item.color} rounded-full flex items-center justify-center mr-4`}>
                  <item.icon className="w-5 h-5 text-white" />
                </div>
                <span className={`font-medium text-lg ${
                  currentPage === item.id ? 'text-[#04adee]' : 'text-gray-700'
                }`}>
                  {item.label}
                </span>
              </button>
            ))}
          </div>

          {/* Logout Button */}
          <div className="p-4 border-t border-gray-200 safe-area-bottom">
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center px-6 py-4 bg-red-50 text-red-600 rounded-2xl font-semibold text-lg active:bg-red-100 transition-colors"
            >
              <X className="w-5 h-5 mr-3" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="min-h-screen">
        {renderPage()}
      </main>
    </div>
  );
};

export default MobileDashboard;