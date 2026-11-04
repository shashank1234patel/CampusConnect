import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LinkedInNavbar } from './components/LinkedInNavbar';
import { FloatingMessaging } from './components/FloatingMessaging';
import { Footer } from './components/Footer';
import { HomeView } from './components/HomeView';
import { ExploreEventsView } from './components/ExploreEventsView';
import { HostEventView } from './components/HostEventView';
import { StudentDashboard } from './components/StudentDashboard';
import { OrganizerDashboard } from './components/OrganizerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { EventDetailPage } from './components/EventDetailPage';
import { RegistrationModal } from './components/RegistrationModal';
import { TicketPassModal } from './components/TicketPassModal';
import { AuthModal } from './components/AuthModal';
import { ApiInspectorModal } from './components/ApiInspectorModal';
import { GitHubDeployModal } from './components/GitHubDeployModal';
import { CampusEvent, UserRole } from './types';

function MainApp() {
  const { currentUser } = useApp();

  const isHost = currentUser?.role === 'organizer' || currentUser?.role === 'admin';

  const [activeTab, setActiveTab] = useState<string>('home');
  const [previousTab, setPreviousTab] = useState<string>('explore');
  const [selectedEventForDetail, setSelectedEventForDetail] = useState<CampusEvent | null>(null);
  const [eventToRegister, setEventToRegister] = useState<CampusEvent | null>(null);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [isApiInspectorOpen, setIsApiInspectorOpen] = useState<boolean>(false);
  const [isGitHubDeployOpen, setIsGitHubDeployOpen] = useState<boolean>(false);

  // Filter pass-through states
  const [initialCategory, setInitialCategory] = useState<string>('All');
  const [initialSearch, setInitialSearch] = useState<string>('');

  // Auth modal states
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authRole, setAuthRole] = useState<UserRole>('student');

  const openAuthModal = (mode: 'login' | 'signup' = 'login', role: UserRole = 'student') => {
    setAuthMode(mode);
    setAuthRole(role);
    setIsAuthOpen(true);
  };

  const handleRegisterClick = (event: CampusEvent) => {
    setEventToRegister(event);
  };

  const handleRegistrationSuccess = (regId: string) => {
    setEventToRegister(null);
    setActiveTicketId(regId);
  };

  const handleQuickCategorySelect = (category: string) => {
    setInitialCategory(category);
    setInitialSearch('');
  };

  const handleQuickSearch = (query: string) => {
    setInitialSearch(query);
    setInitialCategory('All');
  };

  const handleViewDetails = (event: CampusEvent) => {
    setPreviousTab(activeTab === 'event-detail' ? 'explore' : activeTab);
    setSelectedEventForDetail(event);
    setActiveTab('event-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f2ee] text-slate-900 font-sans">
      {/* LinkedIn Navigation Bar */}
      <LinkedInNavbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openAuthModal={openAuthModal}
        onOpenApiInspector={() => setIsApiInspectorOpen(true)}
        onOpenGitHubDeploy={() => setIsGitHubDeployOpen(true)}
        onSearch={handleQuickSearch}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <HomeView
            setActiveTab={setActiveTab}
            onViewDetails={handleViewDetails}
            onRegister={handleRegisterClick}
            onViewTicket={(regId) => setActiveTicketId(regId)}
            onQuickCategorySelect={handleQuickCategorySelect}
            onQuickSearch={handleQuickSearch}
          />
        )}

        {activeTab === 'explore' && (
          <ExploreEventsView
            onViewDetails={handleViewDetails}
            onRegister={handleRegisterClick}
            onViewTicket={(regId) => setActiveTicketId(regId)}
            initialCategory={initialCategory}
            initialSearch={initialSearch}
          />
        )}

        {activeTab === 'event-detail' && selectedEventForDetail && (
          <EventDetailPage
            event={selectedEventForDetail}
            onBack={() => {
              setActiveTab(previousTab || 'explore');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onRegister={handleRegisterClick}
            onViewTicket={(regId) => setActiveTicketId(regId)}
          />
        )}

        {activeTab === 'host' && (
          <HostEventView
            onSuccess={() => {}}
            setActiveTab={setActiveTab}
          />
        )}

        {(activeTab === 'registrations' || activeTab === 'profile') && (
          <StudentDashboard
            onViewTicket={(regId) => setActiveTicketId(regId)}
            onExploreEvents={() => setActiveTab('explore')}
          />
        )}

        {activeTab === 'organizer-dashboard' && (
          <OrganizerDashboard
            onAddNewEvent={() => setActiveTab('host')}
            onViewEvent={handleViewDetails}
          />
        )}

        {activeTab === 'admin-dashboard' && (
          <AdminDashboard
            onViewEvent={handleViewDetails}
          />
        )}
      </main>

      {/* Footer (on inner tabs) */}
      {activeTab !== 'home' && <Footer setActiveTab={setActiveTab} />}

      {/* Registration Form Modal */}
      <RegistrationModal
        event={eventToRegister}
        isOpen={!!eventToRegister}
        onClose={() => setEventToRegister(null)}
        onSuccess={handleRegistrationSuccess}
      />

      {/* Ticket Pass Confirmation Modal */}
      <TicketPassModal
        registrationId={activeTicketId}
        isOpen={!!activeTicketId}
        onClose={() => setActiveTicketId(null)}
        onCancelRegistration={() => setActiveTicketId(null)}
      />

      {/* Auth Modal (Login & Signup) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authMode}
        initialRole={authRole}
      />

      {/* API Endpoints Live Inspector Modal */}
      <ApiInspectorModal
        isOpen={isApiInspectorOpen}
        onClose={() => setIsApiInspectorOpen(false)}
      />

      {/* GitHub Actions CI/CD Deployment Modal */}
      <GitHubDeployModal
        isOpen={isGitHubDeployOpen}
        onClose={() => setIsGitHubDeployOpen(false)}
      />

      {/* Floating LinkedIn Messaging Drawer */}
      <FloatingMessaging />

      {/* Floating API Endpoints Live Button (bottom left) - visible ONLY to the host */}
      {isHost && (
        <button
          onClick={() => setIsApiInspectorOpen(true)}
          className="fixed bottom-4 left-4 z-40 bg-slate-900/90 hover:bg-slate-900 text-white text-xs font-mono font-medium px-3 py-1.5 rounded-full shadow-lg border border-slate-700/80 backdrop-blur-md flex items-center gap-1.5 transition-all hover:scale-105"
          title="Inspect and test live REST API endpoints (Host Only)"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-[11px]">Supabase REST API (5)</span>
        </button>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
