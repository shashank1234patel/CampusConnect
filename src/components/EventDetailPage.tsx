import React, { useState } from 'react';
import { CampusEvent } from '../types';
import { EventPoster } from './EventPoster';
import { useApp } from '../context/AppContext';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Mail, 
  Phone, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  ArrowLeft,
  Share2,
  Bookmark,
  Building,
  Award,
  Bell,
  Coffee,
  Check,
  ExternalLink,
  Download
} from 'lucide-react';

interface EventDetailPageProps {
  event: CampusEvent;
  onBack: () => void;
  onRegister: (event: CampusEvent) => void;
  onViewTicket: (registrationId: string) => void;
}

export const EventDetailPage: React.FC<EventDetailPageProps> = ({
  event,
  onBack,
  onRegister,
  onViewTicket,
}) => {
  const { currentUser, registrations, announcements } = useApp();
  const [copiedLink, setCopiedLink] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Check if current user is registered
  const userRegistration = registrations.find(
    r => r.eventId === event.id && r.userEmail.toLowerCase() === currentUser?.email.toLowerCase() && r.status === 'confirmed'
  );

  const isFull = event.registeredCount >= event.maxParticipants || event.isRegistrationClosed;
  const seatsLeft = Math.max(0, event.maxParticipants - event.registeredCount);
  const percentFilled = Math.min(100, Math.round((event.registeredCount / event.maxParticipants) * 100));

  // Announcements for this specific event
  const eventAnnouncements = announcements.filter(a => a.eventId === event.id);

  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const formattedDeadline = new Date(event.registrationDeadline).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDownloadEventDetails = () => {
    const content = `=====================================================
CAMPUSCONNECT - EVENT DETAILS
=====================================================
EVENT TITLE: ${event.title}
CATEGORY: ${event.category}
STATUS: ${event.status.toUpperCase()}
DATE: ${formattedDate} (${event.date})
SCHEDULE: ${event.startTime} - ${event.endTime}
VENUE: ${event.venue}
ENTRY FEE: ${event.fee === 0 ? 'Free Entry' : '₹' + event.fee}
SEAT CAPACITY: ${event.maxParticipants} (Available: ${seatsLeft} seats)
REGISTRATION DEADLINE: ${formattedDeadline}
CANCELLATION POLICY: ${event.allowCancellation ? 'Free cancellation permitted' : 'Non-cancellable'}

-----------------------------------------------------
ABOUT THE EVENT
-----------------------------------------------------
${event.description}

-----------------------------------------------------
PARTICIPANT INSTRUCTIONS & GUIDELINES
-----------------------------------------------------
${event.instructions || 'Bring valid college ID card.'}

-----------------------------------------------------
HOST & ORGANIZER DETAILS
-----------------------------------------------------
ORGANIZER: ${event.organizerName}
CLUB: ${event.organizerClub}
EMAIL: ${event.organizerEmail || 'N/A'}
PHONE: ${event.organizerPhone || 'N/A'}

=====================================================
Generated from CampusConnect on ${new Date().toLocaleString()}
=====================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event.title.replace(/[^a-zA-Z0-9]/g, '_')}_Details.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 font-semibold text-slate-700 hover:text-indigo-600 transition-colors py-1 px-2.5 rounded-lg hover:bg-white border border-transparent hover:border-slate-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Events</span>
          </button>

          <div className="hidden sm:flex items-center gap-2">
            <span>Home</span>
            <span>/</span>
            <span>Events</span>
            <span>/</span>
            <span className="text-indigo-600 font-medium">{event.category}</span>
            <span>/</span>
            <span className="text-slate-800 font-semibold truncate max-w-[200px]">{event.title}</span>
          </div>
        </div>

        {/* Hero Banner Header */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="relative">
            <EventPoster
              title={event.title}
              category={event.category}
              posterTheme={event.posterTheme}
              posterUrl={event.posterUrl}
              size="banner"
            />
            {event.featured && (
              <div className="absolute top-4 left-4 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-md shadow-xs uppercase tracking-wider">
                Featured Campus Event
              </div>
            )}
          </div>

          <div className="p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 mb-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-indigo-600 uppercase tracking-wide">{event.category}</span>
                <span>·</span>
                <span>Hosted by <strong className="text-slate-800 font-semibold">{event.organizerClub || event.organizerName}</strong></span>
                <span>·</span>
                <span>Deadline: {formattedDeadline}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-mono bg-indigo-50/70 border border-indigo-100 px-2.5 py-0.5 rounded text-indigo-900">
                <span className="font-bold text-indigo-700">GET</span>
                <span className="text-slate-600">/api/events/{event.id}</span>
                <span className="text-emerald-700 bg-emerald-100/60 px-1 py-0.2 rounded font-semibold text-[10px]">200 OK · Event details</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {event.title}
            </h1>

            {/* Quick Metrics Bar */}
            <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Date</span>
                <span className="text-slate-900 font-bold text-sm block mt-0.5">{formattedDate}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Schedule</span>
                <span className="text-slate-900 font-bold text-sm block mt-0.5">{event.startTime} - {event.endTime}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Venue</span>
                <span className="text-slate-900 font-bold text-sm block mt-0.5 truncate">{event.venue}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Registration Fee</span>
                <span className="text-indigo-600 font-extrabold text-sm block mt-0.5">
                  {event.fee === 0 ? 'Free Entry' : `₹${event.fee}`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Content Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Left Details (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Event Description Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-4">
              <h2 className="text-lg font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                About This Event
              </h2>
              <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-line space-y-3">
                <p>{event.description}</p>
              </div>

              {/* What You Will Experience */}
              <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
                <h3 className="text-sm font-bold text-slate-900">Perks & Event Highlights:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Official Verified Participation Certificate</span>
                  </div>
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <Award className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Mentorship & Industry Expert Interaction</span>
                  </div>
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <Coffee className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Complimentary Refreshments & High Tea</span>
                  </div>
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Hands-On Project / Competition Kit Access</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Event Timeline / Flow */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-5">
              <h2 className="text-lg font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                Schedule & Program Flow
              </h2>
              <div className="space-y-4 text-xs">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                    <span className="w-0.5 h-full bg-slate-200" />
                  </div>
                  <div className="pb-4">
                    <span className="font-mono text-indigo-600 font-semibold">{event.startTime} - 30 mins</span>
                    <h4 className="text-sm font-bold text-slate-900 mt-0.5">Attendee Check-in & Pass Verification</h4>
                    <p className="text-slate-600 mt-0.5">Present your CampusConnect QR pass and college ID card at the entrance desk.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                    <span className="w-0.5 h-full bg-slate-200" />
                  </div>
                  <div className="pb-4">
                    <span className="font-mono text-indigo-600 font-semibold">Session 1</span>
                    <h4 className="text-sm font-bold text-slate-900 mt-0.5">Keynote Address & Technical Briefing</h4>
                    <p className="text-slate-600 mt-0.5">Welcome remarks by faculty advisors, keynote speaker introduction, and track overview.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                    <span className="w-0.5 h-full bg-slate-200" />
                  </div>
                  <div className="pb-4">
                    <span className="font-mono text-indigo-600 font-semibold">Core Event</span>
                    <h4 className="text-sm font-bold text-slate-900 mt-0.5">Main Hands-on Activities & Challenges</h4>
                    <p className="text-slate-600 mt-0.5">Interactive rounds, project coding, performances, or sports fixtures.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                  </div>
                  <div>
                    <span className="font-mono text-indigo-600 font-semibold">{event.endTime}</span>
                    <h4 className="text-sm font-bold text-slate-900 mt-0.5">Award Ceremony, Certificate Distribution & High Tea</h4>
                    <p className="text-slate-600 mt-0.5">Declaration of winners, distribution of cash prizes, and closing remarks.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Special Instructions & What to Bring */}
            {event.instructions && (
              <div className="bg-indigo-50/60 rounded-2xl border border-indigo-100 p-6 md:p-8 space-y-3">
                <h2 className="text-base font-bold text-indigo-950 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  Important Guidelines for Registered Students
                </h2>
                <div className="text-xs text-indigo-950 leading-relaxed whitespace-pre-line bg-white/70 p-4 rounded-xl border border-indigo-200/60">
                  {event.instructions}
                </div>
              </div>
            )}

            {/* Event Announcements (Broadcast by Organizer) */}
            {eventAnnouncements.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-4">
                <h2 className="text-lg font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-purple-600" />
                  Organizer Announcements ({eventAnnouncements.length})
                </h2>
                <div className="space-y-3">
                  {eventAnnouncements.map((ann) => (
                    <div key={ann.id} className="p-4 rounded-xl bg-purple-50/50 border border-purple-100 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-purple-900">{ann.title}</span>
                        <span className="text-purple-600 font-mono text-[11px]">
                          {new Date(ann.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                        {ann.message}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Host Club & Organizer Profile Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs">
              <h2 className="text-lg font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2 mb-4">
                <Building className="w-5 h-5 text-indigo-600" />
                Hosted by {event.organizerClub || event.organizerName}
              </h2>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{event.organizerName}</h3>
                  <p className="text-xs text-slate-500">{event.organizerClub}</p>
                  <p className="text-xs text-slate-600 mt-2">
                    Official Student Organization recognized under Campus Activities Directorate.
                  </p>
                </div>

                <div className="space-y-2 text-xs">
                  {event.organizerEmail && (
                    <a
                      href={`mailto:${event.organizerEmail}`}
                      className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-medium transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{event.organizerEmail}</span>
                    </a>
                  )}
                  {event.organizerPhone && (
                    <a
                      href={`tel:${event.organizerPhone}`}
                      className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-medium transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{event.organizerPhone}</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Sticky Column (4 cols) */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            {/* Primary Registration Action Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-md space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 font-medium block">Entry Fee</span>
                  <span className="text-2xl font-extrabold text-slate-900">
                    {event.fee === 0 ? 'Free' : `₹${event.fee}`}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 font-medium block">Available Capacity</span>
                  <span className="text-base font-mono font-bold text-indigo-600 tabular-nums">
                    {seatsLeft} / {event.maxParticipants} seats
                  </span>
                </div>
              </div>

              {/* Capacity Progress Bar */}
              <div className="space-y-1.5">
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      percentFilled >= 90 ? 'bg-rose-500' : percentFilled >= 70 ? 'bg-amber-500' : 'bg-indigo-600'
                    }`}
                    style={{ width: `${percentFilled}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>{percentFilled}% filled</span>
                  <span>Closes on {formattedDeadline}</span>
                </div>
              </div>

              {/* Main Action Button */}
              <div>
                {userRegistration ? (
                  <button
                    onClick={() => onViewTicket(userRegistration.id)}
                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Registered · View Ticket Pass
                  </button>
                ) : isFull ? (
                  <button
                    disabled
                    className="w-full py-3 px-4 bg-slate-100 text-slate-400 font-bold text-xs uppercase tracking-wider rounded-xl cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4" />
                    Seats Full / Closed
                  </button>
                ) : (
                  <button
                    onClick={() => onRegister(event)}
                    className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    Register Now
                  </button>
                )}
              </div>

              {/* Policy Notes */}
              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Instant digital pass confirmation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>
                    {event.allowCancellation ? 'Free cancellation permitted anytime' : 'Non-cancellable registration'}
                  </span>
                </div>
              </div>
            </div>

            {/* Event Quick Specs Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs">
              <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                Event Logistics
              </h3>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-900 block">{formattedDate}</span>
                    <span className="text-slate-500">Add to college calendar</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-900 block">{event.startTime} - {event.endTime}</span>
                    <span className="text-slate-500">Please report 15 mins early</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-900 block">{event.venue}</span>
                    <span className="text-slate-500">Central University Campus</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Share & Save to Desktop Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 text-xs block">Save & Share</span>
                  <span className="text-[11px] text-slate-500">Save details or share with peers</span>
                </div>
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>

              <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                <button
                  onClick={handleDownloadEventDetails}
                  className="w-full py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg border border-indigo-200 transition-colors flex items-center justify-center gap-2 shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-600" />
                  {downloadSuccess ? 'Downloaded to Desktop!' : 'Save Event Details to Desktop (.txt)'}
                </button>

                <a
                  href="/CampusConnect_Project.zip"
                  download="CampusConnect_Project.zip"
                  className="w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors flex items-center justify-center gap-2 text-center"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  Save Full Project (.zip) to Desktop
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
