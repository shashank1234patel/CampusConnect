import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { CampusEvent } from '../types';
import { 
  Flame, 
  Bookmark, 
  Heart, 
  Calendar, 
  MapPin, 
  Clock, 
  Ticket, 
  ArrowRight, 
  ExternalLink, 
  Star, 
  TrendingUp,
  Sparkles,
  Check
} from 'lucide-react';

interface LinkedInRightSidebarProps {
  setActiveTab: (tab: string) => void;
  onRegisterEvent?: (event: CampusEvent) => void;
  onViewEventDetails?: (event: CampusEvent) => void;
}

export const LinkedInRightSidebar: React.FC<LinkedInRightSidebarProps> = ({
  setActiveTab,
  onRegisterEvent,
  onViewEventDetails
}) => {
  const { events } = useApp();

  // Favorites state persisted in localStorage
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('campusconnect_fav_events');
      if (saved) return JSON.parse(saved);
      // Default to featuring first 2 events if not set
      return events.slice(0, 2).map(e => e.id);
    } catch {
      return events.slice(0, 2).map(e => e.id);
    }
  });

  const [activeTabMode, setActiveTabMode] = useState<'trending' | 'favorites'>('trending');

  useEffect(() => {
    try {
      localStorage.setItem('campusconnect_fav_events', JSON.stringify(favoriteIds));
    } catch (e) {
      console.warn('Failed to save favorites', e);
    }
  }, [favoriteIds]);

  useEffect(() => {
    const handleSync = () => {
      try {
        const saved = localStorage.getItem('campusconnect_fav_events');
        if (saved) setFavoriteIds(JSON.parse(saved));
      } catch (e) {
        console.warn(e);
      }
    };
    window.addEventListener('campus_fav_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('campus_fav_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const toggleFavorite = (eventId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavoriteIds(prev => 
      prev.includes(eventId) ? prev.filter(id => id !== eventId) : [...prev, eventId]
    );
  };

  const approvedEvents = events.filter(e => e.status === 'approved');

  // Trending Events (Sorted by popularity / registered count and featured)
  const trendingEvents = [...approvedEvents]
    .sort((a, b) => b.registeredCount - a.registeredCount)
    .slice(0, 4);

  // Favorite Events
  const favoriteEvents = approvedEvents.filter(e => favoriteIds.includes(e.id));

  return (
    <aside className="w-full space-y-3.5">
      {/* 1. Trending Events Card */}
      <div className="bg-white rounded-lg border border-slate-200/90 shadow-2xs overflow-hidden">
        {/* Header */}
        <div className="p-3.5 pb-2.5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-orange-100 text-orange-600 flex items-center justify-center">
              <Flame className="w-4 h-4 fill-orange-500" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Trending Events</h3>
              <p className="text-[10px] text-slate-400">Most popular on campus</p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200/60 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Live
          </span>
        </div>

        {/* Trending Events List */}
        <div className="divide-y divide-slate-100">
          {trendingEvents.map((evt, index) => {
            const seatsLeft = Math.max(0, evt.maxParticipants - evt.registeredCount);
            const isFav = favoriteIds.includes(evt.id);

            return (
              <div 
                key={evt.id}
                onClick={() => onViewEventDetails && onViewEventDetails(evt)}
                className="p-3 hover:bg-slate-50 cursor-pointer transition-colors group relative"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[10px] font-bold text-slate-400">#{index + 1}</span>
                      <span className="text-[10px] font-semibold text-indigo-700 uppercase tracking-wider">
                        {evt.category}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#0a66c2] transition-colors line-clamp-1">
                      {evt.title}
                    </h4>

                    <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1">
                      <span>{evt.date}</span>
                      <span>·</span>
                      <span className="text-orange-600 font-semibold flex items-center gap-0.5">
                        <Flame className="w-3 h-3 fill-orange-500" />
                        {evt.registeredCount} Registered
                      </span>
                    </div>
                  </div>

                  {/* Bookmark / Star Favorite Toggle */}
                  <button
                    onClick={(e) => toggleFavorite(evt.id, e)}
                    className="p-1 rounded text-slate-400 hover:text-amber-500 transition-colors"
                    title={isFav ? 'Remove from favorites' : 'Add to favorite events'}
                  >
                    <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-400 text-amber-500' : ''}`} />
                  </button>
                </div>

                {/* Quick Action Footer */}
                <div className="mt-2 pt-1.5 border-t border-slate-100/60 flex items-center justify-between text-[11px]">
                  <span className="font-bold text-emerald-600 text-[10px]">
                    {evt.fee === 0 ? 'Free Entry' : `₹${evt.fee}`}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onViewEventDetails) onViewEventDetails(evt);
                      }}
                      className="text-[10px] font-semibold text-slate-600 hover:text-[#0a66c2] flex items-center gap-0.5"
                    >
                      Details &rarr;
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onRegisterEvent) onRegisterEvent(evt);
                      }}
                      className="px-2 py-0.5 bg-[#0a66c2] hover:bg-[#004182] text-white rounded text-[10px] font-bold transition-colors shadow-2xs"
                    >
                      RSVP
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* View All Trending */}
        <div className="p-2.5 bg-slate-50 text-center border-t border-slate-100">
          <button
            onClick={() => setActiveTab('explore')}
            className="text-xs font-bold text-[#0a66c2] hover:underline inline-flex items-center gap-1"
          >
            <span>Explore All Trending Events</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* 2. Favorite / Saved Events Card (Fav. Events) */}
      <div className="bg-white rounded-lg border border-slate-200/90 shadow-2xs overflow-hidden">
        {/* Header */}
        <div className="p-3.5 pb-2.5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-rose-100 text-rose-600 flex items-center justify-center">
              <Heart className="w-4 h-4 fill-rose-500" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Fav. Events</h3>
              <p className="text-[10px] text-slate-400">Your bookmarked shortlist</p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200/60">
            {favoriteEvents.length} Saved
          </span>
        </div>

        {/* Favorite Events List */}
        <div className="divide-y divide-slate-100">
          {favoriteEvents.length === 0 ? (
            <div className="p-4 text-center space-y-1.5">
              <Bookmark className="w-6 h-6 text-slate-300 mx-auto" />
              <p className="text-xs font-semibold text-slate-700">No favorite events saved yet</p>
              <p className="text-[11px] text-slate-400">
                Click the star (⭐) on any event card to save it here for quick access!
              </p>
            </div>
          ) : (
            favoriteEvents.map((evt) => (
              <div
                key={evt.id}
                onClick={() => onViewEventDetails && onViewEventDetails(evt)}
                className="p-3 hover:bg-slate-50 cursor-pointer transition-colors group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-semibold text-rose-600 block mb-0.5">
                      {evt.category}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#0a66c2] transition-colors line-clamp-1">
                      {evt.title}
                    </h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {evt.date} · {evt.venue}
                    </p>
                  </div>

                  <button
                    onClick={(e) => toggleFavorite(evt.id, e)}
                    className="p-1 rounded text-amber-500 hover:text-slate-400 transition-colors"
                    title="Remove from favorites"
                  >
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                  </button>
                </div>

                <div className="mt-2 pt-1.5 border-t border-slate-100/60 flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-700 text-[10px]">
                    {evt.fee === 0 ? 'Free Entry' : `₹${evt.fee}`}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onRegisterEvent) onRegisterEvent(evt);
                    }}
                    className="px-2.5 py-0.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[10px] font-bold transition-colors shadow-2xs"
                  >
                    Get Pass
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Clean Footer Links */}
      <div className="px-2 text-[11px] text-slate-400 space-y-1.5 text-center">
        <div className="flex flex-wrap justify-center gap-x-2 gap-y-0.5 text-[10px]">
          <a href="#" className="hover:text-slate-600 hover:underline">About</a>
          <a href="#" className="hover:text-slate-600 hover:underline">Help Center</a>
          <a href="#" className="hover:text-slate-600 hover:underline">Privacy &amp; Terms</a>
          <a href="#" className="hover:text-slate-600 hover:underline">CampusConnect &copy; 2026</a>
        </div>
      </div>
    </aside>
  );
};
