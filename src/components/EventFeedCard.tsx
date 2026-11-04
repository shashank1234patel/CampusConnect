import React from 'react';
import { CampusEvent } from '../types';
import { EventPoster } from './EventPoster';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Ticket, 
  ArrowRight, 
  ExternalLink,
  ShieldCheck,
  Share2,
  Star
} from 'lucide-react';

interface EventFeedCardProps {
  event: CampusEvent;
  onViewDetails: (event: CampusEvent) => void;
  onRegister: (event: CampusEvent) => void;
}

export const EventFeedCard: React.FC<EventFeedCardProps> = ({
  event,
  onViewDetails,
  onRegister,
}) => {
  const isFull = event.registeredCount >= event.maxParticipants || event.isRegistrationClosed;
  const seatsLeft = Math.max(0, event.maxParticipants - event.registeredCount);

  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const [isFav, setIsFav] = React.useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('campusconnect_fav_events');
      if (saved) {
        const arr = JSON.parse(saved);
        return Array.isArray(arr) && arr.includes(event.id);
      }
      return false;
    } catch {
      return false;
    }
  });

  const handleToggleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const saved = localStorage.getItem('campusconnect_fav_events');
      const arr: string[] = saved ? JSON.parse(saved) : [];
      let updated: string[];
      if (arr.includes(event.id)) {
        updated = arr.filter(id => id !== event.id);
        setIsFav(false);
      } else {
        updated = [...arr, event.id];
        setIsFav(true);
      }
      localStorage.setItem('campusconnect_fav_events', JSON.stringify(updated));
      window.dispatchEvent(new Event('campus_fav_updated'));
    } catch (err) {
      console.warn(err);
    }
  };

  return (
    <article className="bg-white rounded-lg border border-slate-200/90 shadow-2xs overflow-hidden transition-all hover:shadow-xs">
      {/* Event Header with Event Name as Heading */}
      <div className="p-4 pb-3 border-b border-slate-100">
        <div className="flex items-center justify-between gap-2 text-xs text-slate-500 mb-1.5">
          <span className="font-bold text-[#0a66c2] uppercase tracking-wider text-[11px]">
            {event.category}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[11px]">
              Organized by <strong className="text-slate-800">{event.organizerClub || event.organizerName}</strong>
            </span>
            <button
              onClick={handleToggleFav}
              className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-amber-500 transition-colors"
              title={isFav ? 'Remove from favorites' : 'Star / Add to favorite events'}
            >
              <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400 text-amber-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Event Name is the main heading */}
        <h2 
          onClick={() => onViewDetails(event)}
          className="text-lg sm:text-xl font-bold text-slate-950 leading-snug hover:text-[#0a66c2] cursor-pointer transition-colors"
        >
          {event.title}
        </h2>
      </div>

      {/* Event Visual Poster */}
      <div 
        onClick={() => onViewDetails(event)}
        className="cursor-pointer group relative overflow-hidden"
      >
        <EventPoster
          title={event.title}
          category={event.category}
          posterTheme={event.posterTheme}
          posterUrl={event.posterUrl}
          size="md"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
      </div>

      {/* Event Information & Details */}
      <div className="p-4 space-y-3">
        {/* Short Summary Description */}
        <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
          {event.description}
        </p>

        {/* Structured Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 py-2.5 px-3 bg-[#f8fafc] rounded-lg border border-slate-100 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-medium">Date</span>
            <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span className="truncate">{formattedDate}</span>
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-medium">Time</span>
            <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
              <Clock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span className="truncate">{event.startTime}</span>
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-medium">Venue</span>
            <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span className="truncate">{event.venue}</span>
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-medium">Fee &amp; Seats</span>
            <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
              <span className="text-emerald-600 font-bold">
                {event.fee === 0 ? 'Free' : `₹${event.fee}`}
              </span>
              <span className="text-slate-400">·</span>
              <span className={seatsLeft <= 10 ? 'text-rose-600 font-bold' : 'text-slate-600'}>
                {seatsLeft} left
              </span>
            </span>
          </div>
        </div>

        {/* Action Buttons: "See More Details (New Page)" and "Register for Pass" */}
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {/* Option to see more details in new page */}
          <button
            onClick={() => onViewDetails(event)}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#0a66c2] hover:text-[#004182] hover:bg-blue-50/70 border border-[#0a66c2]/30 rounded-lg transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>See More Details (New Page)</span>
          </button>

          {/* Option to get entry pass */}
          <button
            onClick={() => onRegister(event)}
            disabled={isFull}
            className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg shadow-2xs transition-colors ${
              isFull
                ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                : 'bg-[#0a66c2] hover:bg-[#004182] text-white'
            }`}
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>{isFull ? 'Registration Full' : 'Get Entry Pass'}</span>
          </button>
        </div>
      </div>
    </article>
  );
};
