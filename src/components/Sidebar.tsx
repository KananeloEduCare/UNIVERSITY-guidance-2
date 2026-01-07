import React from 'react';
import {
  User,
  GraduationCap,
  Award,
  FileText,
  BookOpen,
  MessageCircle,
  MessageSquare,
  LogOut,
  Home,
  ChevronLeft,
  ChevronRight,
  PenTool
} from 'lucide-react';
import type { Page } from './Dashboard';

interface SidebarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage, onLogout, isOpen, onClose, isCollapsed = false, onToggleCollapse }) => {
  const menuItems = [
    { id: 'profile' as Page, label: 'My Profile', icon: User },
    { id: 'admit-profiles' as Page, label: 'Admission Stories', icon: GraduationCap },
    { id: 'scholarships' as Page, label: 'Scholarships', icon: Award },
    { id: 'applications' as Page, label: 'Applications', icon: FileText },
    { id: 'essay-editor' as Page, label: 'Essay Editor', icon: PenTool },
    { id: 'essay-feedback' as Page, label: 'Essay Feedback', icon: FileText },
    { id: 'resources' as Page, label: 'Resources', icon: BookOpen },
    { id: 'counselors' as Page, label: 'Counselors', icon: MessageCircle },
    { id: 'chat' as Page, label: 'Inbox', icon: MessageSquare },
  ];

  const handleMenuClick = (page: Page) => {
    setCurrentPage(page);
    onClose(); // Close sidebar on mobile after selection
  };

  return (
    <div className={`
      fixed lg:static inset-y-0 left-0 z-40 bg-white shadow-lg border-r border-gray-200 flex flex-col
      transform transition-all duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      ${isCollapsed ? 'w-20' : 'w-64'}
    `}>
      {/* Logo Header */}
      <div className="p-4 lg:p-6 border-b border-gray-200 mt-16 lg:mt-0 flex-shrink-0">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : ''}`}>
          <img
            src="/white_logo.png"
            alt="EduCare Logo"
            className="w-8 h-8 lg:w-10 lg:h-10 object-contain"
          />
          {!isCollapsed && (
            <div className="ml-3">
              <h2 className="text-lg lg:text-xl font-bold text-gray-900">EduCare</h2>
              <p className="text-xs lg:text-sm text-[#04adee]">University Guidance</p>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Collapse Toggle */}
      {onToggleCollapse && (
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex absolute -right-3 top-24 bg-white border border-gray-200 rounded-full p-1.5 shadow-md hover:bg-gray-50 transition-colors z-50"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-600" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          )}
        </button>
      )}

      {/* Navigation Menu */}
      <nav className="flex-1 py-4 lg:py-6 overflow-y-auto">
        <ul className={`space-y-2 ${isCollapsed ? 'px-2' : 'px-3 lg:px-4'}`}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <li key={item.id}>
                <button
                  onClick={() => handleMenuClick(item.id)}
                  className={`w-full flex items-center rounded-lg transition-all duration-200 ${
                    isCollapsed ? 'justify-center p-3' : 'px-4 py-3'
                  } ${
                    isActive
                      ? 'bg-[#04adee] bg-opacity-10 text-[#04adee] border border-[#04adee] border-opacity-20 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className={`w-4 h-4 lg:w-5 lg:h-5 ${isCollapsed ? '' : 'mr-3'} ${isActive ? 'text-[#04adee]' : 'text-gray-500'}`} />
                  {!isCollapsed && (
                    <span className="font-medium text-sm lg:text-base">{item.label}</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className={`border-t border-gray-200 flex-shrink-0 ${isCollapsed ? 'p-2' : 'p-3 lg:p-4'}`}>
        <button
          onClick={onLogout}
          className={`w-full flex items-center text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-200 touch-manipulation ${
            isCollapsed ? 'justify-center p-3' : 'px-4 py-3'
          }`}
          title={isCollapsed ? 'Logout' : undefined}
        >
          <LogOut className={`w-4 h-4 lg:w-5 lg:h-5 ${isCollapsed ? '' : 'mr-3'}`} />
          {!isCollapsed && (
            <span className="font-medium text-sm lg:text-base">Logout</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;