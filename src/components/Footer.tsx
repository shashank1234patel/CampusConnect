import React from 'react';
import { GraduationCap } from 'lucide-react';

interface FooterProps {
  setActiveTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab }) => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-sm">CampusConnect</span>
              <p className="text-xs text-slate-500">Discover Events. Connect. Participate.</p>
            </div>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-600 font-medium">
            <button onClick={() => setActiveTab('home')} className="hover:text-indigo-600 transition-colors">
              Home
            </button>
            <button onClick={() => setActiveTab('explore')} className="hover:text-indigo-600 transition-colors">
              Explore Events
            </button>
            <button onClick={() => setActiveTab('host')} className="hover:text-indigo-600 transition-colors">
              Host an Event
            </button>
            <button onClick={() => setActiveTab('registrations')} className="hover:text-indigo-600 transition-colors">
              My Registrations
            </button>
            <a
              href="/CampusConnect_Project.zip"
              download="CampusConnect_Project.zip"
              className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
            >
              Save Project to Desktop (.zip)
            </a>
          </nav>

          <p className="text-xs text-slate-400">
            &copy; {new Date().getFullYear()} CampusConnect. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
