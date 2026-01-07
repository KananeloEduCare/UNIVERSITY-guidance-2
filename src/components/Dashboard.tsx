import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { User } from '../services/authService';
import Sidebar from './Sidebar';
import Profile from './Profile';
import AdmitProfiles from './AdmitProfiles';
import AdmitProfileDetailsPage from './AdmitProfileDetailsPage';
import Scholarships from './Scholarships';
import Applications from './Applications';
import Resources from './Resources';
import Counselors from './Counselors';
import Chat from './Chat';
import EssayEditor from './EssayEditor';
import MeetingBookingPage from './MeetingBookingPage';

export type Page = 'profile' | 'admit-profiles' | 'scholarships' | 'applications' | 'resources' | 'counselors' | 'chat' | 'profile-details' | 'essay-editor' | 'meeting-booking';

interface DashboardProps {
  onLogout: () => void;
  user?: User | null;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout, user }) => {
  const [currentPage, setCurrentPage] = useState<Page>('profile');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [selectedCounselorEmail, setSelectedCounselorEmail] = useState<string>('');
  const [selectedCounselorName, setSelectedCounselorName] = useState<string>('');

  const renderPage = () => {
    switch (currentPage) {
      case 'profile':
        return <Profile user={user} />;
      case 'admit-profiles':
        return <AdmitProfiles onViewProfile={(profileId: string) => {
          setSelectedProfileId(profileId);
          setCurrentPage('profile-details');
        }} />;
      case 'scholarships':
        return <Scholarships />;
      case 'applications':
        return <Applications />;
      case 'resources':
        return <Resources />;
      case 'counselors':
        return <Counselors onBookMeeting={(email: string, name: string) => {
          setSelectedCounselorEmail(email);
          setSelectedCounselorName(name);
          setCurrentPage('meeting-booking');
        }} />;
      case 'chat':
        return <Chat userRole="student" />;
      case 'essay-editor':
        return <EssayEditor />;
      case 'profile-details':
        return selectedProfileId ? (
          <AdmitProfileDetailsPage
            profileId={selectedProfileId}
            onBack={() => setCurrentPage('admit-profiles')}
          />
        ) : null;
      case 'meeting-booking':
        return (
          <MeetingBookingPage
            counselorEmail={selectedCounselorEmail}
            counselorName={selectedCounselorName}
            onBack={() => setCurrentPage('counselors')}
          />
        );
      default:
        return <Profile user={user} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 relative overflow-hidden">
      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded-lg shadow-lg border border-gray-200 touch-manipulation"
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30 touch-manipulation"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        onLogout={onLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <main className="flex-1 overflow-y-auto lg:ml-0 w-full min-w-0">
        {renderPage()}
      </main>
    </div>
  );
};

export default Dashboard;