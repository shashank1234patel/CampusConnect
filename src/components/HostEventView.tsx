import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { EventCategory } from '../types';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Image as ImageIcon, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Upload,
  Info
} from 'lucide-react';

const CATEGORIES: EventCategory[] = [
  'Technical Events',
  'Workshops',
  'Hackathons',
  'Cultural Events',
  'Sports Events',
  'Seminars',
  'Competitions',
  'Other Events',
];

interface HostEventViewProps {
  onSuccess: (eventId: string) => void;
  setActiveTab: (tab: string) => void;
}

export const HostEventView: React.FC<HostEventViewProps> = ({ onSuccess, setActiveTab }) => {
  const { currentUser, createEvent } = useApp();

  // Form states
  const [organizerName, setOrganizerName] = useState(currentUser?.name || '');
  const [organizerClub, setOrganizerClub] = useState(currentUser?.organization || 'ACM Student Chapter & GDG');
  const [organizerPhone, setOrganizerPhone] = useState(currentUser?.phone || '+91 98765 43210');
  const [organizerEmail, setOrganizerEmail] = useState(currentUser?.email || '');

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<EventCategory>('Technical Events');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('2026-11-26');
  const [startTime, setStartTime] = useState('10:00 AM');
  const [endTime, setEndTime] = useState('04:00 PM');
  const [venue, setVenue] = useState('Tech Block Auditorium 1, Campus');
  const [maxParticipants, setMaxParticipants] = useState<number>(100);
  const [registrationDeadline, setRegistrationDeadline] = useState('2026-11-24');
  
  // Poster selection
  const [posterTheme, setPosterTheme] = useState<'indigo' | 'purple' | 'blue' | 'emerald' | 'amber' | 'rose'>('indigo');
  const [posterUrl, setPosterUrl] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const [fee, setFee] = useState<number>(0);
  const [instructions, setInstructions] = useState('');
  const [allowCancellation, setAllowCancellation] = useState<boolean>(true);

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync organizer details when currentUser updates
  React.useEffect(() => {
    if (currentUser) {
      if (!organizerName) setOrganizerName(currentUser.name);
      if (!organizerEmail) setOrganizerEmail(currentUser.email);
      if (!organizerPhone) setOrganizerPhone(currentUser.phone);
      if (currentUser.organization && !organizerClub) setOrganizerClub(currentUser.organization);
    }
  }, [currentUser]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        setPosterUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Event Title is required.');
      return;
    }

    if (!description.trim() || description.length < 20) {
      setError('Please provide a descriptive event overview (at least 20 characters).');
      return;
    }

    if (!organizerName.trim() || !organizerEmail.trim() || !organizerPhone.trim()) {
      setError('Host contact name, email, and mobile number are mandatory.');
      return;
    }

    if (!venue.trim()) {
      setError('Event Venue is required.');
      return;
    }

    if (maxParticipants <= 0) {
      setError('Maximum number of participants must be greater than zero.');
      return;
    }

    setIsSubmitting(true);

    const result = createEvent({
      title: title.trim(),
      category,
      description: description.trim(),
      organizerName: organizerName.trim(),
      organizerClub: organizerClub.trim() || 'Campus Event Committee',
      organizerEmail: organizerEmail.trim(),
      organizerPhone: organizerPhone.trim(),
      organizerId: currentUser?.id || 'host-user',
      date,
      startTime,
      endTime,
      venue: venue.trim(),
      maxParticipants,
      registrationDeadline,
      posterUrl: posterUrl.trim() || undefined,
      posterTheme,
      fee: Number(fee) || 0,
      instructions: instructions.trim(),
      allowCancellation,
      isRegistrationClosed: false,
    });

    setIsSubmitting(false);

    if (result.success) {
      setSuccessMsg(result.message);
      setTimeout(() => {
        if (currentUser?.role === 'organizer') {
          setActiveTab('organizer-dashboard');
        } else if (currentUser?.role === 'admin') {
          setActiveTab('admin-dashboard');
        } else {
          setActiveTab('explore');
        }
      }, 1400);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Page Title & Intro */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded text-xs font-semibold text-indigo-700 mb-2">
          Host an Event
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
          Submit an Event for Campus
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Whether you are hosting a hackathon, cultural show, workshop, or athletic competition, reach all students across departments.
        </p>
      </div>

      {/* Admin Notice */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3 text-xs text-blue-900">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Administrative Approval Process: </span>
          New event proposals are routed to the Campus Activities Admin Directorate for review and verification before becoming publicly visible in the events catalog.
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 text-xs text-emerald-800">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">{successMsg}</p>
            <p className="text-emerald-700 mt-0.5">Redirecting to your dashboard...</p>
          </div>
        </div>
      )}

      {/* Main Submission Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-8">
        {/* Section 1: Organizer Details */}
        <div>
          <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
            1. Host & Organizer Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Organizer / Host Name *
              </label>
              <input
                type="text"
                required
                value={organizerName}
                onChange={(e) => setOrganizerName(e.target.value)}
                placeholder="e.g. Sarah Jenkins"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Organization / Student Club Name *
              </label>
              <input
                type="text"
                required
                value={organizerClub}
                onChange={(e) => setOrganizerClub(e.target.value)}
                placeholder="e.g. IEEE Student Branch / Robotics Club"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contact Mobile Number *
              </label>
              <input
                type="tel"
                required
                value={organizerPhone}
                onChange={(e) => setOrganizerPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Official Host Email *
              </label>
              <input
                type="email"
                required
                value={organizerEmail}
                onChange={(e) => setOrganizerEmail(e.target.value)}
                placeholder="organizer@campusconnect.edu"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Event Information */}
        <div>
          <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
            2. Event Information & Category
          </h2>

          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Event Name / Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. DevHacks 2026: Inter-College App Sprint"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Event Category *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`py-2 px-3 text-xs font-medium rounded-lg border text-center transition-colors ${
                      category === cat
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Event Description *
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide a comprehensive description of what attendees will experience, prerequisites, guest speakers, cash prizes, and perks..."
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Schedule, Venue & Capacity */}
        <div>
          <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
            3. Schedule, Venue & Seat Capacity
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Event Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Starting Time *
              </label>
              <input
                type="text"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                placeholder="09:30 AM"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ending Time *
              </label>
              <input
                type="text"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                placeholder="05:00 PM"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Event Venue *
              </label>
              <input
                type="text"
                required
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="e.g. Main Auditorium / CSE Seminar Hall 3 / Sports Complex"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Max Capacity (Seats) *
              </label>
              <input
                type="number"
                min={1}
                required
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Registration Deadline *
              </label>
              <input
                type="date"
                required
                value={registrationDeadline}
                onChange={(e) => setRegistrationDeadline(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Registration Fee (₹)
              </label>
              <input
                type="number"
                min={0}
                value={fee}
                onChange={(e) => setFee(parseInt(e.target.value) || 0)}
                placeholder="0 for Free"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-mono"
              />
              <span className="text-[11px] text-slate-400">Enter 0 for free events</span>
            </div>
          </div>
        </div>

        {/* Section 4: Event Poster & Theme */}
        <div>
          <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
            4. Event Poster & Visual Theme
          </h2>

          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Choose Visual Palette:
              </label>
              <div className="flex flex-wrap gap-3">
                {(['indigo', 'purple', 'blue', 'emerald', 'amber', 'rose'] as const).map((theme) => (
                  <button
                    key={theme}
                    type="button"
                    onClick={() => setPosterTheme(theme)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize border transition-all ${
                      posterTheme === theme
                        ? 'border-indigo-600 ring-2 ring-indigo-500/30 text-indigo-900 bg-indigo-50 font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {theme}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Upload Poster Image (Optional)
              </label>
              <div className="flex items-center gap-3">
                <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors">
                  <Upload className="w-4 h-4 text-slate-500" />
                  <span>Choose Image File...</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                {uploadedFileName && (
                  <span className="text-xs text-emerald-700 font-medium">
                    ✓ {uploadedFileName}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                If no custom image is uploaded, CampusConnect automatically generates an event poster based on your chosen theme and category.
              </p>
            </div>
          </div>
        </div>

        {/* Section 5: Additional Instructions & Cancellation Policy */}
        <div>
          <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
            5. Participant Instructions & Policy
          </h2>

          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Special Instructions for Attendees
              </label>
              <textarea
                rows={3}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="e.g. Bring valid college ID, laptop with charger, arrive 20 minutes prior to session..."
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="cancellationToggle"
                checked={allowCancellation}
                onChange={(e) => setAllowCancellation(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
              <label htmlFor="cancellationToggle" className="text-xs text-slate-700 font-medium cursor-pointer">
                Allow registered students to cancel registration if they cannot attend (seat is automatically re-opened)
              </label>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setActiveTab('explore')}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            Submit Event for Admin Review
          </button>
        </div>
      </form>
    </div>
  );
};
