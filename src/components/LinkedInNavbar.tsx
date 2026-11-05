import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  GraduationCap, 
  User as UserIcon, 
  LogOut, 
  ShieldCheck, 
  Layers, 
  ChevronDown,
  Menu,
  X,
  Database,
  GitBranch,
  Calendar,
  Compass,
  PlusCircle,
  Ticket
} from 'lucide-react';
import { UserRole } from '../types';

interface LinkedInNavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openAuthModal: (mode?: 'login' | 'signup', role?: UserRole) => void;
  onOpenDownloadModal?: () => void;
  onOpenApiInspector?: () => void;
  onOpenGitHubDeploy?: () => void;
  onSearch?: (query: string) => void;
}

export const LinkedInNavbar: React.FC<LinkedInNavbarProps> = ({ 
  activeTab, 
  setActiveTab, 
  openAuthModal, 
  onOpenDownloadModal,
  onOpenApiInspector,
  onOpenGitHubDeploy,
  onSearch
}) => {
  const { currentUser, logout, switchDemoRole } = useApp();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Only the host (organizer / admin) can access developer infrastructure tools
  const isHost = currentUser?.role === 'organizer' || currentUser?.role === 'admin';

  const handleNav = (tab: string) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  // Exactly the previous options
  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'explore', label: 'Explore Events' },
    { id: 'host', label: 'Host an Event' },
    { id: 'registrations', label: 'My Registrations' },
  ];

  if (currentUser?.role === 'organizer') {
    navLinks.push({ id: 'organizer-dashboard', label: 'Organizer Hub' });
  } else if (currentUser?.role === 'admin') {
    navLinks.push({ id: 'admin-dashboard', label: 'Admin Panel' });
  }

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#e8e8e8] shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 sm:gap-8 h-15">
          {/* Brand Wordmark with LinkedIn-styled Blue Accent */}
          <button
            onClick={() => handleNav('home')}
            className="flex items-center gap-2.5 text-left whitespace-nowrap shrink-0 group focus:outline-none"
          >
            <div className="w-8.5 h-8.5 rounded bg-[#0a66c2] group-hover:bg-[#004182] flex items-center justify-center text-white shadow-2xs transition-colors">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 group-hover:text-[#0a66c2] transition-colors">
                CampusConnect
              </span>
            </div>
          </button>

          {/* Navigation Links — Exactly previous options with LinkedIn Theme */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-7 text-sm font-medium text-slate-600">
            {navLinks.map((link) => {
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNav(link.id)}
                  className={`relative py-3.5 whitespace-nowrap shrink-0 text-xs sm:text-sm transition-colors hover:text-slate-900 focus:outline-none ${
                    isActive ? 'text-[#0a66c2] font-bold' : 'text-slate-600'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0a66c2] rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Controls — Exact previous options with LinkedIn Theme */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Quick Role Switcher (LinkedIn light grey theme) */}
            <div className="hidden lg:flex items-center bg-[#f4f2ee] p-0.5 rounded-lg border border-[#e0dfdc] text-xs">
              <span className="px-2 py-1 text-slate-500 font-medium">Role:</span>
              <button
                onClick={() => switchDemoRole('student')}
                className={`px-2 py-1 rounded-md font-medium transition-colors ${
                  currentUser?.role === 'student'
                    ? 'bg-white text-[#0a66c2] shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Switch to Student view"
              >
                Student
              </button>
              <button
                onClick={() => switchDemoRole('organizer')}
                className={`px-2 py-1 rounded-md font-medium transition-colors ${
                  currentUser?.role === 'organizer'
                    ? 'bg-white text-purple-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Switch to Host / Organizer view"
              >
                Host (Organizer)
              </button>
              <button
                onClick={() => switchDemoRole('admin')}
                className={`px-2 py-1 rounded-md font-medium transition-colors ${
                  currentUser?.role === 'admin'
                    ? 'bg-white text-blue-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Switch to Admin view"
              >
                Admin
              </button>
            </div>

            {/* Show Supabase & APIs and Deploy CI/CD ONLY to the host / organizer / admin of the website */}
            {isHost && (
              <>
                {/* Supabase & APIs button */}
                <button
                  onClick={onOpenApiInspector}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors shadow-2xs whitespace-nowrap shrink-0"
                  title="Inspect REST API endpoints & Supabase database integration (Host Only)"
                >
                  <Database className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden sm:inline">Supabase &amp; APIs</span>
                  <span className="sm:hidden">API</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </button>

                {/* GitHub Actions Deploy modal button */}
                <button
                  onClick={onOpenGitHubDeploy}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors shadow-2xs whitespace-nowrap shrink-0"
                  title="View GitHub Actions CI/CD deployment guide and configuration (Host Only)"
                >
                  <GitBranch className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="hidden sm:inline">Deploy CI/CD</span>
                  <span className="sm:hidden">Deploy</span>
                </button>
              </>
            )}

            {/* User Profile or Login/Signup */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-1.5 sm:gap-2 pl-1.5 pr-2 sm:pr-3 py-1.5 rounded-lg border border-[#e0dfdc] bg-white hover:bg-[#f4f2ee] text-slate-700 text-xs font-medium transition-colors focus:outline-none"
                >
                  <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs text-white font-bold shadow-2xs">
                    {currentUser.name.charAt(0)}
                  </div>
                  <span className="max-w-[85px] sm:max-w-[110px] truncate text-slate-800 text-xs font-semibold">
                    {currentUser.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {profileDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95"
                    onMouseLeave={() => setProfileDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs text-slate-500 font-medium">Signed in as</p>
                      <p className="text-sm font-bold text-slate-900 truncate">{currentUser.name}</p>
                      <p className="text-xs text-[#0a66c2] font-medium capitalize mt-0.5">
                        {currentUser.role} {currentUser.usn ? `(${currentUser.usn})` : ''}
                      </p>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          handleNav('profile');
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                      >
                        <UserIcon className="w-4 h-4 text-slate-400" />
                        My Profile
                      </button>

                      <button
                        onClick={() => {
                          handleNav('registrations');
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                      >
                        <Layers className="w-4 h-4 text-slate-400" />
                        My Registrations
                      </button>

                      {currentUser.role === 'organizer' && (
                        <button
                          onClick={() => {
                            handleNav('organizer-dashboard');
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-purple-700 hover:bg-purple-50 font-medium flex items-center gap-2.5"
                        >
                          <Layers className="w-4 h-4 text-purple-500" />
                          Organizer Dashboard
                        </button>
                      )}

                      {currentUser.role === 'admin' && (
                        <button
                          onClick={() => {
                            handleNav('admin-dashboard');
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-blue-700 hover:bg-blue-50 font-medium flex items-center gap-2.5"
                        >
                          <ShieldCheck className="w-4 h-4 text-blue-500" />
                          Admin Console
                        </button>
                      )}
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          openAuthModal('login');
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-[#0a66c2] hover:bg-blue-50 font-semibold flex items-center gap-2.5"
                      >
                        <UserIcon className="w-4 h-4 text-[#0a66c2]" />
                        Switch Account / Login Options
                      </button>
                      <button
                        onClick={() => {
                          logout();
                          setProfileDropdownOpen(false);
                          openAuthModal('login');
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2.5"
                      >
                        <LogOut className="w-4 h-4 text-rose-400" />
                        Log out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAuthModal('login')}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
                >
                  Log in
                </button>
                <button
                  onClick={() => openAuthModal('signup')}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-[#0a66c2] hover:bg-[#004182] rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0"
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-[#f4f2ee]"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#e8e8e8] bg-white px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNav(link.id)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                activeTab === link.id
                  ? 'bg-blue-50 text-[#0a66c2] font-bold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {link.label}
            </button>
          ))}
          <div className="pt-2 border-t border-slate-100 flex gap-2">
            <button
              onClick={() => switchDemoRole('student')}
              className={`flex-1 py-1.5 text-xs font-medium rounded ${
                currentUser?.role === 'student' ? 'bg-[#0a66c2] text-white font-bold' : 'bg-[#f4f2ee] text-slate-700'
              }`}
            >
              Student
            </button>
            <button
              onClick={() => switchDemoRole('organizer')}
              className={`flex-1 py-1.5 text-xs font-medium rounded ${
                currentUser?.role === 'organizer' ? 'bg-purple-600 text-white font-bold' : 'bg-[#f4f2ee] text-slate-700'
              }`}
            >
              Organizer
            </button>
            <button
              onClick={() => switchDemoRole('admin')}
              className={`flex-1 py-1.5 text-xs font-medium rounded ${
                currentUser?.role === 'admin' ? 'bg-blue-600 text-white font-bold' : 'bg-[#f4f2ee] text-slate-700'
              }`}
            >
              Admin
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
