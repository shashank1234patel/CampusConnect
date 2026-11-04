import React, { useState } from 'react';
import { CampusEvent, User } from '../types';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Calendar, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  UserCheck 
} from 'lucide-react';

interface RegistrationModalProps {
  event: CampusEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (registrationId: string) => void;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  event,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { currentUser, registerForEvent } = useApp();

  // Pre-fill profile info if available
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [usn, setUsn] = useState(currentUser?.usn || '');
  const [collegeName, setCollegeName] = useState(currentUser?.collegeName || 'Bangalore Institute of Technology');
  const [department, setDepartment] = useState(currentUser?.department || 'Computer Science & Engineering');

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync when currentUser changes
  React.useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setEmail(currentUser.email);
      setPhone(currentUser.phone);
      setUsn(currentUser.usn || '');
      setCollegeName(currentUser.collegeName || 'Bangalore Institute of Technology');
      setDepartment(currentUser.department || 'Computer Science & Engineering');
    }
  }, [currentUser]);

  if (!isOpen || !event) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please provide your full name.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setError('A valid email address is required for sending ticket confirmations.');
      return;
    }

    if (!phone.trim()) {
      setError('Contact phone number is required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await registerForEvent(event.id, {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        usn: usn.trim() ? usn.trim().toUpperCase() : undefined,
        collegeName: collegeName.trim(),
        department: department.trim(),
      });

      setIsSubmitting(false);

      if (result.success && result.registrationId) {
        onSuccess(result.registrationId);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setIsSubmitting(false);
      setError(String(err));
    }
  };

  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <h2 className="text-base font-bold text-slate-900">Event Registration</h2>
            <p className="text-xs text-slate-500">Confirm your seat and generate your student pass</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* API Endpoint Indicator */}
          <div className="flex items-center justify-between text-[11px] font-mono bg-purple-50/70 border border-purple-100 px-3 py-1.5 rounded-lg text-purple-900">
            <span className="flex items-center gap-1.5">
              <span className="font-bold text-purple-700">POST</span>
              <span className="text-slate-600">/api/registrations</span>
            </span>
            <span className="text-purple-700 font-semibold text-[10px] bg-purple-100/60 px-1.5 py-0.2 rounded">
              201 Created · 409 Conflict duplicate guard
            </span>
          </div>

          {/* Event Brief Card */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">
                {event.category}
              </span>
              <span className="text-xs font-bold text-slate-900">
                {event.fee === 0 ? 'Free Entry' : `Fee: ₹${event.fee}`}
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 leading-snug">{event.title}</h3>
            <div className="pt-2 border-t border-slate-200/60 grid grid-cols-2 gap-2 text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-medium text-slate-800">{formattedDate}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{event.startTime}</span>
              </div>
              <div className="flex items-center gap-1.5 col-span-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{event.venue}</span>
              </div>
            </div>
          </div>

          {currentUser && (
            <div className="p-2.5 bg-indigo-50/70 border border-indigo-100 rounded-lg flex items-center gap-2 text-xs text-indigo-800">
              <UserCheck className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>
                Retrieved profile details for <strong className="font-semibold">{currentUser.name}</strong>.
              </span>
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Participant Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  USN / Student ID (Optional for guests)
                </label>
                <input
                  type="text"
                  value={usn}
                  onChange={(e) => setUsn(e.target.value)}
                  placeholder="e.g. 1MS23CS108"
                  className="w-full px-3 py-2 text-sm uppercase font-mono border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                College / Institution Name
              </label>
              <input
                type="text"
                value={collegeName}
                onChange={(e) => setCollegeName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Verified Campus Entry
              </span>
              <span>
                {event.allowCancellation ? 'Free cancellation allowed' : 'No cancellation allowed'}
              </span>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                Confirm Registration
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
