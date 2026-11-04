import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { CampusEvent, EventCategory } from '../types';
import { EventCard } from './EventCard';
import { Search, Filter, Calendar, Sparkles, X } from 'lucide-react';

const CATEGORIES: ('All' | EventCategory)[] = [
  'All',
  'Technical Events',
  'Workshops',
  'Hackathons',
  'Cultural Events',
  'Sports Events',
  'Seminars',
  'Competitions',
  'Other Events',
];

interface ExploreEventsViewProps {
  onViewDetails: (event: CampusEvent) => void;
  onRegister: (event: CampusEvent) => void;
  onViewTicket: (registrationId: string) => void;
  initialCategory?: string;
  initialSearch?: string;
}

export const ExploreEventsView: React.FC<ExploreEventsViewProps> = ({
  onViewDetails,
  onRegister,
  onViewTicket,
  initialCategory = 'All',
  initialSearch = '',
}) => {
  const { events } = useApp();

  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [feeFilter, setFeeFilter] = useState<'all' | 'free' | 'paid'>('all');

  // Only display approved events publicly
  const approvedEvents = useMemo(() => {
    return events.filter(e => e.status === 'approved');
  }, [events]);

  const filteredEvents = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const weekFromNow = new Date();
    weekFromNow.setDate(today.getDate() + 7);
    const weekStr = weekFromNow.toISOString().split('T')[0];

    const monthFromNow = new Date();
    monthFromNow.setDate(today.getDate() + 30);
    const monthStr = monthFromNow.toISOString().split('T')[0];

    return approvedEvents.filter(ev => {
      // Category match
      if (selectedCategory !== 'All' && ev.category !== selectedCategory) {
        return false;
      }

      // Search match
      if (search.trim()) {
        const q = search.toLowerCase();
        const matches = 
          ev.title.toLowerCase().includes(q) ||
          ev.description.toLowerCase().includes(q) ||
          ev.venue.toLowerCase().includes(q) ||
          ev.organizerClub.toLowerCase().includes(q) ||
          ev.organizerName.toLowerCase().includes(q) ||
          ev.category.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Date match
      if (dateFilter === 'today' && ev.date !== todayStr) return false;
      if (dateFilter === 'week' && (ev.date < todayStr || ev.date > weekStr)) return false;
      if (dateFilter === 'month' && (ev.date < todayStr || ev.date > monthStr)) return false;

      // Fee match
      if (feeFilter === 'free' && ev.fee > 0) return false;
      if (feeFilter === 'paid' && ev.fee === 0) return false;

      return true;
    });
  }, [approvedEvents, selectedCategory, search, dateFilter, feeFilter]);

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setDateFilter('all');
    setFeeFilter('all');
  };

  const hasActiveFilters = search || selectedCategory !== 'All' || dateFilter !== 'all' || feeFilter !== 'all';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* View Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded border border-indigo-100 mb-2">
          Discover Campus Activities
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
          Explore Upcoming Events
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Browse academic workshops, technical hackathons, cultural festivals, and sports tournaments across college campus.
        </p>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by event title, category, venue, or host club..."
              className="w-full pl-10 pr-4 py-2.5 text-xs md:text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-50/50"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Date Filter Dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="px-3 py-2.5 text-xs font-medium border border-slate-200 rounded-xl bg-slate-50/50 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All Dates</option>
              <option value="today">Today's Events</option>
              <option value="week">Next 7 Days</option>
              <option value="month">This Month</option>
            </select>

            {/* Fee Filter */}
            <select
              value={feeFilter}
              onChange={(e) => setFeeFilter(e.target.value as any)}
              className="px-3 py-2.5 text-xs font-medium border border-slate-200 rounded-xl bg-slate-50/50 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All Pricing</option>
              <option value="free">Free Only</option>
              <option value="paid">Paid Workshops</option>
            </select>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-3 py-2.5 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors whitespace-nowrap"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Buttons (Interactive Filter Controls as permitted by Frontend Design §1.A) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Count & Endpoint Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 px-1">
        <span>
          Showing <strong className="text-slate-900 font-semibold">{filteredEvents.length}</strong> events
          {selectedCategory !== 'All' && ` in ${selectedCategory}`}
        </span>
        <div className="inline-flex items-center gap-2 text-[11px] font-mono bg-indigo-50/70 border border-indigo-100 px-2.5 py-1 rounded-md text-indigo-900">
          <span className="font-bold text-indigo-700">GET</span>
          <span className="text-slate-600">/api/events</span>
          <span className="text-emerald-700 bg-emerald-100/60 px-1.5 py-0.2 rounded font-semibold">200 OK · Browse events</span>
        </div>
      </div>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No events matched your criteria</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search terms or clearing your category and date filters to see more upcoming activities.
          </p>
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold rounded-lg transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((ev) => (
            <EventCard
              key={ev.id}
              event={ev}
              onViewDetails={onViewDetails}
              onRegister={onRegister}
              onViewTicket={onViewTicket}
            />
          ))}
        </div>
      )}
    </div>
  );
};
