import React from 'react';
import { CampusEvent } from '../types';
import { EventPoster } from './EventPoster';
import { useApp } from '../context/AppContext';
import { Calendar, MapPin, Users, CheckCircle2, AlertCircle } from 'lucide-react';

interface EventCardProps {
  event: CampusEvent;
  onViewDetails: (event: CampusEvent) => void;
  onRegister: (event: CampusEvent) => void;
  onViewTicket?: (registrationId: string) => void;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onViewDetails,
  onRegister,
  onViewTicket,
}) => {
  const { currentUser, registrations } = useApp();

  const userRegistration = registrations.find(
    r => r.eventId === event.id && r.userEmail.toLowerCase() === currentUser?.email.toLowerCase() && r.status === 'confirmed'
  );

  const isFull = event.registeredCount >= event.maxParticipants || event.isRegistrationClosed;
  const seatsLeft = Math.max(0, event.maxParticipants - event.registeredCount);
  const percentFilled = Math.min(100, Math.round((event.registeredCount / event.maxParticipants) * 100));

  // Format date readable
  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col">
      {/* Event Poster / Visual Header */}
      <div 
        className="cursor-pointer relative overflow-hidden"
        onClick={() => onViewDetails(event)}
      >
        <EventPoster
          title={event.title}
          category={event.category}
          posterTheme={event.posterTheme}
          posterUrl={event.posterUrl}
          size="md"
        />
        {event.featured && (
          <div className="absolute top-3 right-3 bg-amber-500/95 backdrop-blur-xs text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-xs uppercase tracking-wide">
            Featured
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Unboxed Metadata Line with typographic separator (frontend-design §1.A) */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
            <span className="font-semibold text-indigo-600">{event.category}</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="truncate">{event.organizerClub || event.organizerName}</span>
          </div>

          {/* Event Title */}
          <h3 
            onClick={() => onViewDetails(event)}
            className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 cursor-pointer leading-snug"
          >
            {event.title}
          </h3>

          {/* Short Description */}
          <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {event.description}
          </p>

          {/* Key Event Specs */}
          <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate font-medium text-slate-800">{formattedDate}</span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-500">{event.startTime}</span>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate text-slate-700">{event.venue}</span>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <div className="flex items-center gap-1.5 text-slate-600">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span className="tabular-nums font-semibold text-slate-800">
                  {seatsLeft}
                </span>
                <span className="text-slate-400 text-[11px]">
                  of {event.maxParticipants} seats left
                </span>
              </div>
              <span className="font-bold text-xs text-slate-900">
                {event.fee === 0 ? 'Free' : `₹${event.fee}`}
              </span>
            </div>

            {/* Capacity Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mt-1.5">
              <div
                className={`h-full rounded-full transition-all ${
                  percentFilled >= 90 ? 'bg-rose-500' : percentFilled >= 70 ? 'bg-amber-500' : 'bg-indigo-600'
                }`}
                style={{ width: `${percentFilled}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card Action Button */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2">
          {userRegistration ? (
            <button
              onClick={() => onViewTicket?.(userRegistration.id)}
              className="w-full py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg border border-emerald-200 transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Registered · View Pass
            </button>
          ) : isFull ? (
            <button
              disabled
              className="w-full py-2 px-3 bg-slate-100 text-slate-400 text-xs font-semibold rounded-lg cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
              Seats Full / Closed
            </button>
          ) : (
            <div className="w-full flex items-center gap-2">
              <button
                onClick={() => onViewDetails(event)}
                className="flex-1 py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors text-center"
              >
                Details
              </button>
              <button
                onClick={() => onRegister(event)}
                className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors text-center"
              >
                Register Now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
