import React from 'react';
import { CampusEvent } from '../types';
import { EventPoster } from './EventPoster';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Mail, 
  Phone, 
  FileText, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

interface EventDetailModalProps {
  event: CampusEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onRegister: (event: CampusEvent) => void;
  onViewTicket: (registrationId: string) => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  isOpen,
  onClose,
  onRegister,
  onViewTicket,
}) => {
  const { currentUser, registrations } = useApp();

  if (!isOpen || !event) return null;

  const userRegistration = registrations.find(
    r => r.eventId === event.id && r.userEmail.toLowerCase() === currentUser?.email.toLowerCase() && r.status === 'confirmed'
  );

  const isFull = event.registeredCount >= event.maxParticipants || event.isRegistrationClosed;
  const seatsLeft = Math.max(0, event.maxParticipants - event.registeredCount);

  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Poster */}
        <div className="relative">
          <EventPoster
            title={event.title}
            category={event.category}
            posterTheme={event.posterTheme}
            posterUrl={event.posterUrl}
            size="banner"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-slate-950/50 hover:bg-slate-950/70 text-white rounded-full backdrop-blur-xs transition-colors z-20"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scroll Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Title & Metadata */}
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
              <span className="font-semibold text-indigo-600">{event.category}</span>
              <span>·</span>
              <span>Deadline: {new Date(event.registrationDeadline).toLocaleDateString()}</span>
              <span>·</span>
              <span className="font-bold text-slate-900">{event.fee === 0 ? 'Free Entry' : `₹${event.fee}`}</span>
            </div>

            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 leading-tight">
              {event.title}
            </h1>
          </div>

          {/* Quick Schedule & Location Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div className="flex items-start gap-2.5">
              <Calendar className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-800">Date</p>
                <p className="text-slate-600 mt-0.5">{formattedDate}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-800">Schedule</p>
                <p className="text-slate-600 mt-0.5">{event.startTime} - {event.endTime}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Users className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-800">Capacity</p>
                <p className="text-slate-600 mt-0.5 tabular-nums">
                  {seatsLeft} seats left of {event.maxParticipants}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 col-span-1 sm:col-span-3 pt-2 border-t border-slate-200/60">
              <MapPin className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-800">Venue</p>
                <p className="text-slate-600 mt-0.5">{event.venue}</p>
              </div>
            </div>
          </div>

          {/* About Event */}
          <div className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              About This Event
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {event.description}
            </p>
          </div>

          {/* Instructions for Attendees */}
          {event.instructions && (
            <div className="space-y-2 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
              <h2 className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                Special Instructions for Participants
              </h2>
              <p className="text-xs text-indigo-950 leading-relaxed whitespace-pre-line">
                {event.instructions}
              </p>
            </div>
          )}

          {/* Host & Organizer Info */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Hosted By
            </h2>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <p className="font-bold text-slate-900 text-sm">{event.organizerName}</p>
                <p className="text-slate-600">{event.organizerClub}</p>
              </div>
              <div className="space-y-1 text-slate-600">
                {event.organizerEmail && (
                  <p className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{event.organizerEmail}</span>
                  </p>
                )}
                {event.organizerPhone && (
                  <p className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{event.organizerPhone}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 block">Registration Fee</span>
            <span className="text-base font-extrabold text-slate-900">
              {event.fee === 0 ? 'Free Registration' : `₹${event.fee}`}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Close
            </button>

            {userRegistration ? (
              <button
                onClick={() => {
                  onClose();
                  onViewTicket(userRegistration.id);
                }}
                className="px-5 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                View My Pass
              </button>
            ) : isFull ? (
              <button
                disabled
                className="px-5 py-2.5 text-xs font-semibold text-slate-400 bg-slate-100 rounded-lg cursor-not-allowed flex items-center gap-1.5"
              >
                <AlertCircle className="w-4 h-4" />
                Seats Full
              </button>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  onRegister(event);
                }}
                className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
              >
                Register Now
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
