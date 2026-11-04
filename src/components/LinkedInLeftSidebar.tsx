import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Bookmark, 
  Users, 
  Calendar, 
  MapPin, 
  GraduationCap,
  ShieldCheck,
  Ticket
} from 'lucide-react';

interface LinkedInLeftSidebarProps {
  setActiveTab: (tab: string) => void;
  onOpenProfile?: () => void;
}

export const LinkedInLeftSidebar: React.FC<LinkedInLeftSidebarProps> = ({ 
  setActiveTab 
}) => {
  const { currentUser, registrations, events } = useApp();

  const userRegistrations = registrations.filter(r => r.userId === currentUser?.id);

  return (
    <aside className="w-full space-y-3">
      {/* Profile Card — Clean, minimal without unnecessary clutter */}
      <div className="bg-white rounded-lg border border-slate-200/90 shadow-2xs overflow-hidden">
        {/* Simple Clean Banner */}
        <div className="h-16 bg-gradient-to-r from-slate-800 via-indigo-900 to-[#0a66c2] relative" />

        {/* Profile Info */}
        <div className="px-4 pb-4 pt-0 text-center">
          {/* Avatar */}
          <div className="-mt-9 mb-2 flex justify-center">
            <div className="w-16 h-16 rounded-full border-2 border-white shadow-md bg-slate-800 flex items-center justify-center text-white font-bold text-lg">
              {currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).join('') : 'SP'}
            </div>
          </div>

          {/* Name & Headline */}
          <h3 className="font-bold text-slate-900 text-base leading-snug flex items-center justify-center gap-1">
            <span>{currentUser?.name || 'Shashank Patel'}</span>
            <ShieldCheck className="w-4 h-4 text-[#0a66c2] shrink-0" />
          </h3>

          <p className="text-xs text-slate-600 mt-0.5 font-medium">
            {currentUser?.department || 'B.Tech CSE (AI & ML) Student'}
          </p>

          <p className="text-xs text-slate-500 mt-0.5">
            {currentUser?.collegeName || 'Intellipaat School of Technology'}
          </p>

          <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 mt-1">
            <MapPin className="w-3 h-3 text-slate-400" />
            <span>{currentUser?.location || 'Balianta, Odisha'}</span>
          </div>
        </div>

        {/* Quick Numbers */}
        <div className="py-2 border-t border-slate-100 text-xs divide-y divide-slate-100">
          <div 
            onClick={() => setActiveTab('registrations')}
            className="px-4 py-2 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors"
          >
            <span className="text-slate-500">Connections</span>
            <span className="font-bold text-[#0a66c2]">
              {currentUser?.connectionsCount || 16}
            </span>
          </div>

          <div 
            onClick={() => setActiveTab('registrations')}
            className="px-4 py-2 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors"
          >
            <span className="text-slate-500">My Event Passes</span>
            <span className="font-bold text-indigo-600">
              {userRegistrations.length}
            </span>
          </div>
        </div>

        {/* Navigation Quick Links */}
        <div className="p-2 border-t border-slate-100 bg-slate-50/50 space-y-1 text-xs">
          <button 
            onClick={() => setActiveTab('registrations')}
            className="w-full flex items-center gap-2 px-3 py-1.5 rounded hover:bg-white text-slate-700 font-semibold transition-colors text-left"
          >
            <Ticket className="w-3.5 h-3.5 text-indigo-600" />
            <span>View My Tickets</span>
          </button>
          <button 
            onClick={() => setActiveTab('explore')}
            className="w-full flex items-center gap-2 px-3 py-1.5 rounded hover:bg-white text-slate-700 font-semibold transition-colors text-left"
          >
            <Calendar className="w-3.5 h-3.5 text-[#0a66c2]" />
            <span>Browse All Events</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
