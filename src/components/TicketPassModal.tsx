import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  CheckCircle2, 
  Printer, 
  Calendar, 
  MapPin, 
  Clock, 
  User as UserIcon, 
  AlertTriangle,
  QrCode
} from 'lucide-react';

interface TicketPassModalProps {
  registrationId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onCancelRegistration?: () => void;
}

export const TicketPassModal: React.FC<TicketPassModalProps> = ({
  registrationId,
  isOpen,
  onClose,
  onCancelRegistration,
}) => {
  const { registrations, events, cancelRegistration } = useApp();

  if (!isOpen || !registrationId) return null;

  const registration = registrations.find(r => r.id === registrationId);
  if (!registration) return null;

  const event = events.find(e => e.id === registration.eventId);
  const allowCancellation = event ? event.allowCancellation : true;

  const handlePrint = () => {
    window.print();
  };

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel your registration for this event? Your seat will be released.')) {
      cancelRegistration(registration.id);
      onCancelRegistration?.();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Pass Top Banner */}
        <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-300" />
            <div>
              <p className="text-xs uppercase tracking-wider text-indigo-200 font-bold">Confirmed Registration</p>
              <h2 className="text-base font-bold text-white">Campus Entry Pass</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pass Body (Printable area) */}
        <div id="printable-ticket" className="p-6 space-y-5 bg-white">
          {/* Unique Registration Code */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center flex flex-col items-center justify-center">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Registration Pass ID
            </span>
            <span className="text-xl font-mono font-extrabold text-indigo-700 tracking-wider my-0.5">
              {registration.id}
            </span>
            <span className="text-[11px] text-slate-400">
              Registered on {new Date(registration.registeredAt).toLocaleDateString()}
            </span>
          </div>

          {/* Event Details */}
          <div>
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">
              {registration.eventCategory}
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-0.5 leading-snug">
              {registration.eventTitle}
            </h3>

            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-700 bg-slate-50/70 p-3 rounded-lg border border-slate-100">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                <span className="font-medium">{registration.eventDate}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                <span className="truncate">{registration.eventTime}</span>
              </div>
              <div className="flex items-center gap-1.5 col-span-2">
                <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span className="truncate">{registration.eventVenue}</span>
              </div>
            </div>
          </div>

          {/* Participant Details */}
          <div className="border-t border-dashed border-slate-200 pt-4 text-xs space-y-1.5">
            <div className="flex justify-between py-0.5">
              <span className="text-slate-500">Participant:</span>
              <span className="font-semibold text-slate-900">{registration.userName}</span>
            </div>
            {registration.userUsn && (
              <div className="flex justify-between py-0.5">
                <span className="text-slate-500">Student ID / USN:</span>
                <span className="font-mono font-medium text-slate-900">{registration.userUsn}</span>
              </div>
            )}
            <div className="flex justify-between py-0.5">
              <span className="text-slate-500">Department:</span>
              <span className="text-slate-700">{registration.userDept}</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-slate-500">College:</span>
              <span className="text-slate-700 truncate max-w-[200px]">{registration.userCollege}</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-slate-500">Status:</span>
              <span className="text-emerald-700 font-semibold uppercase text-[11px] bg-emerald-50 px-2 py-0.5 rounded">
                Confirmed Entry
              </span>
            </div>
          </div>

          {/* Simulated QR Code / Barcode Scanner */}
          <div className="border-t border-dashed border-slate-200 pt-4 flex items-center justify-between bg-slate-50 p-3 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white border border-slate-300 rounded p-1 flex items-center justify-center">
                <QrCode className="w-10 h-10 text-slate-800" />
              </div>
              <div className="text-[11px]">
                <p className="font-semibold text-slate-800">Scan at Entry Desk</p>
                <p className="text-slate-500">Keep college ID card ready</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono text-slate-400 block">SECURE HASH</span>
              <span className="text-[11px] font-mono text-indigo-600 font-bold">
                {registration.id.slice(-5)}·BIT
              </span>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          {allowCancellation ? (
            <button
              onClick={handleCancel}
              className="text-xs text-rose-600 hover:text-rose-700 hover:underline font-medium flex items-center gap-1"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Cancel Registration
            </button>
          ) : (
            <span className="text-[11px] text-slate-400">Non-cancellable event</span>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg flex items-center gap-1.5 shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
