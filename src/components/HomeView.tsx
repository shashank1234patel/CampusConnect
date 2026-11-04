import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CampusEvent, EventCategory } from '../types';
import { LinkedInLeftSidebar } from './LinkedInLeftSidebar';
import { EventFeedCard } from './EventFeedCard';
import { LinkedInRightSidebar } from './LinkedInRightSidebar';
import { 
  Calendar, 
  PlusCircle, 
  Sparkles, 
  ArrowRight,
  Filter
} from 'lucide-react';

interface HomeViewProps {
  setActiveTab: (tab: string) => void;
  onViewDetails: (event: CampusEvent) => void;
  onRegister: (event: CampusEvent) => void;
  onViewTicket: (registrationId: string) => void;
  onQuickCategorySelect: (cat: string) => void;
  onQuickSearch: (query: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  setActiveTab,
  onViewDetails,
  onRegister,
  onViewTicket,
  onQuickCategorySelect,
  onQuickSearch,
}) => {
  const { events } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const approvedEvents = events.filter(e => e.status === 'approved');

  const filteredEvents = selectedCategory === 'All'
    ? approvedEvents
    : approvedEvents.filter(e => e.category === selectedCategory);

  const categories: (EventCategory | 'All')[] = [
    'All',
    'Hackathons',
    'Technical Events',
    'Workshops',
    'Cultural Events',
    'Sports Events',
    'Competitions'
  ];

  return (
    <div className="bg-[#f4f2ee] min-h-[calc(100vh-56px)] py-4 sm:py-6">
      <div className="max-w-6xl mx-auto px-3 sm:px-4">
        {/* 3-Column Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
          {/* Left Column: Clean Profile Card (Span 3) */}
          <div className="md:col-span-4 lg:col-span-3">
            <LinkedInLeftSidebar 
              setActiveTab={setActiveTab} 
            />
          </div>

          {/* Middle Column: Event Feed with Event Name as Heading (Span 6) */}
          <div className="md:col-span-8 lg:col-span-6 space-y-3.5">
            {/* Quick Host / Announce Action Bar */}
            <div className="bg-white rounded-lg border border-slate-200/90 shadow-2xs p-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Calendar className="w-4 h-4 text-[#0a66c2]" />
                <span className="font-semibold text-slate-800">Campus Events &amp; Passes</span>
                <span className="text-slate-400">·</span>
                <span className="text-[11px] text-slate-500">{approvedEvents.length} Active Events</span>
              </div>

              <button
                onClick={() => setActiveTab('host')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0a66c2] hover:bg-[#004182] text-white rounded-md text-xs font-bold transition-colors shadow-2xs"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Host an Event</span>
              </button>
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border ${
                    selectedCategory === cat
                      ? 'bg-[#0a66c2] text-white border-[#0a66c2] shadow-2xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {cat === 'All' ? 'All Events' : cat}
                </button>
              ))}
            </div>

            {/* List of Event Feed Cards — Heading is Event Name, with poster, details, and See More Details button */}
            <div className="space-y-4">
              {filteredEvents.length === 0 ? (
                <div className="p-8 bg-white rounded-lg border border-slate-200 text-center space-y-2">
                  <p className="text-sm font-semibold text-slate-700">No events found in this category</p>
                  <button
                    onClick={() => setSelectedCategory('All')}
                    className="text-xs font-bold text-[#0a66c2] hover:underline"
                  >
                    View All Events
                  </button>
                </div>
              ) : (
                filteredEvents.map((event) => (
                  <EventFeedCard
                    key={event.id}
                    event={event}
                    onViewDetails={onViewDetails}
                    onRegister={onRegister}
                  />
                ))
              )}
            </div>
          </div>

          {/* Right Column: LinkedIn News & Puzzles (Span 3) */}
          <div className="hidden lg:block lg:col-span-3">
            <LinkedInRightSidebar
              setActiveTab={setActiveTab}
              onRegisterEvent={onRegister}
              onViewEventDetails={onViewDetails}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
