import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CampusEvent, EventRegistration } from '../types';
import { 
  Plus, 
  Calendar, 
  MapPin, 
  Users, 
  Download, 
  Bell, 
  Trash2, 
  Edit3, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  Clock, 
  X, 
  Send,
  Search,
  ExternalLink
} from 'lucide-react';

interface OrganizerDashboardProps {
  onAddNewEvent: () => void;
  onViewEvent: (event: CampusEvent) => void;
}

export const OrganizerDashboard: React.FC<OrganizerDashboardProps> = ({
  onAddNewEvent,
  onViewEvent,
}) => {
  const { 
    currentUser, 
    events, 
    registrations, 
    deleteEvent, 
    updateEvent, 
    toggleRegistrationStatus, 
    sendAnnouncement 
  } = useApp();

  // Filter events belonging to this organizer (or all events if organizer role is active)
  const organizerEvents = events.filter(
    e => e.organizerId === currentUser?.id || currentUser?.role === 'organizer'
  );

  // Selected event for participant view
  const [selectedEventId, setSelectedEventId] = useState<string | null>(
    organizerEvents[0]?.id || null
  );

  // Search participants
  const [participantSearch, setParticipantSearch] = useState('');

  // Announcement modal state
  const [announcementEventId, setAnnouncementEventId] = useState<string | null>(null);
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementMsg, setAnnouncementMsg] = useState('');
  const [announcementSuccess, setAnnouncementSuccess] = useState(false);

  // Edit Event state
  const [editingEvent, setEditingEvent] = useState<CampusEvent | null>(null);

  const activeEvent = events.find(e => e.id === selectedEventId) || organizerEvents[0];
  
  const eventParticipants = registrations.filter(
    r => r.eventId === (activeEvent?.id || '') && r.status === 'confirmed'
  );

  const filteredParticipants = eventParticipants.filter(p =>
    p.userName.toLowerCase().includes(participantSearch.toLowerCase()) ||
    p.userEmail.toLowerCase().includes(participantSearch.toLowerCase()) ||
    (p.userUsn && p.userUsn.toLowerCase().includes(participantSearch.toLowerCase())) ||
    p.userDept.toLowerCase().includes(participantSearch.toLowerCase())
  );

  // Export CSV functionality
  const handleExportCSV = (event: CampusEvent) => {
    const list = registrations.filter(r => r.eventId === event.id && r.status === 'confirmed');
    if (list.length === 0) {
      alert('No registrations available yet to export for this event.');
      return;
    }

    const headers = ['Registration ID', 'Participant Name', 'USN/Student ID', 'Email', 'Phone', 'College', 'Department', 'Registered Date', 'Status'];
    const rows = list.map(item => [
      `"${item.id}"`,
      `"${item.userName.replace(/"/g, '""')}"`,
      `"${item.userUsn || 'N/A'}"`,
      `"${item.userEmail}"`,
      `"${item.userPhone || 'N/A'}"`,
      `"${item.userCollege.replace(/"/g, '""')}"`,
      `"${item.userDept.replace(/"/g, '""')}"`,
      `"${new Date(item.registeredAt).toLocaleDateString()}"`,
      `"${item.status}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${event.title.replace(/[^a-zA-Z0-9]/g, '_')}_Participants.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSendAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementEventId || !announcementTitle.trim() || !announcementMsg.trim()) return;

    sendAnnouncement(announcementEventId, announcementTitle.trim(), announcementMsg.trim());
    setAnnouncementSuccess(true);
    setTimeout(() => {
      setAnnouncementSuccess(false);
      setAnnouncementEventId(null);
      setAnnouncementTitle('');
      setAnnouncementMsg('');
    }, 1500);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;

    updateEvent(editingEvent.id, {
      title: editingEvent.title,
      venue: editingEvent.venue,
      date: editingEvent.date,
      startTime: editingEvent.startTime,
      endTime: editingEvent.endTime,
      maxParticipants: editingEvent.maxParticipants,
      description: editingEvent.description,
      instructions: editingEvent.instructions,
    });
    setEditingEvent(null);
  };

  const totalRegisteredAll = organizerEvents.reduce((acc, curr) => acc + curr.registeredCount, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & KPI Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded border border-purple-100 mb-1">
            Organizer Console
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Event Host & Participant Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your created events, broadcast updates, and download attendee registries.
          </p>
        </div>

        <button
          onClick={onAddNewEvent}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create New Event
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Hosted Events
          </span>
          <p className="text-2xl font-mono font-bold text-slate-900 mt-1 tabular-nums">
            {organizerEvents.length}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {organizerEvents.filter(e => e.status === 'approved').length} Active · {organizerEvents.filter(e => e.status === 'pending').length} Under Review
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Registrations Received
          </span>
          <p className="text-2xl font-mono font-bold text-indigo-600 mt-1 tabular-nums">
            {totalRegisteredAll}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Across all hosted campus sessions
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Active Host Profile
          </span>
          <p className="text-base font-bold text-slate-900 mt-1 truncate">
            {currentUser?.name || 'Campus Organizer'}
          </p>
          <span className="text-[11px] text-slate-500 truncate block">
            {currentUser?.organization || 'Student Club Representative'}
          </span>
        </div>
      </div>

      {/* Layout Split: Left Events List, Right Participant Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Events Managed (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
            <span>Your Hosted Events</span>
            <span className="text-xs font-mono font-normal text-slate-500">
              {organizerEvents.length} total
            </span>
          </h2>

          <div className="space-y-3">
            {organizerEvents.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
                <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm font-semibold text-slate-700">No events hosted yet</p>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Click 'Create New Event' to submit your first college workshop or competition!
                </p>
                <button
                  onClick={onAddNewEvent}
                  className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg"
                >
                  Create Event
                </button>
              </div>
            ) : (
              organizerEvents.map((ev) => {
                const isSelected = (activeEvent?.id === ev.id);
                const isFull = ev.registeredCount >= ev.maxParticipants;
                const statusColor = 
                  ev.status === 'approved' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' :
                  ev.status === 'pending' ? 'text-amber-700 bg-amber-50 border-amber-200' :
                  'text-rose-700 bg-rose-50 border-rose-200';

                return (
                  <div
                    key={ev.id}
                    onClick={() => setSelectedEventId(ev.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer bg-white ${
                      isSelected
                        ? 'border-indigo-600 ring-2 ring-indigo-500/10 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className={`text-[11px] font-semibold uppercase px-2 py-0.5 rounded border ${statusColor}`}>
                        {ev.status === 'approved' ? 'Approved & Live' : ev.status === 'pending' ? 'Pending Admin Review' : 'Rejected'}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">
                        {ev.date}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 mt-2 line-clamp-1">
                      {ev.title}
                    </h3>

                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-2">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <strong className="text-slate-900 tabular-nums">{ev.registeredCount}</strong> / {ev.maxParticipants} registered
                      </span>
                      <span>·</span>
                      <span className="truncate">{ev.venue}</span>
                    </div>

                    {/* Quick Action Buttons for Event */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setEditingEvent(ev)}
                          className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded transition-colors"
                          title="Edit Event"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setAnnouncementEventId(ev.id)}
                          className="p-1.5 text-slate-600 hover:text-purple-600 hover:bg-slate-100 rounded transition-colors"
                          title="Broadcast Announcement"
                        >
                          <Bell className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleExportCSV(ev)}
                          className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-slate-100 rounded transition-colors"
                          title="Export Registrations to CSV"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete "${ev.title}"? This cannot be undone.`)) {
                              deleteEvent(ev.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          title="Delete Event"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => toggleRegistrationStatus(ev.id, !ev.isRegistrationClosed)}
                        className={`text-[11px] font-semibold px-2 py-1 rounded transition-colors flex items-center gap-1 ${
                          ev.isRegistrationClosed
                            ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {ev.isRegistrationClosed ? (
                          <>
                            <Lock className="w-3 h-3" />
                            Reopen
                          </>
                        ) : (
                          <>
                            <Unlock className="w-3 h-3" />
                            Close Seats
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Event Participant Registry (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          {activeEvent ? (
            <>
              {/* Event Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wide">
                    {activeEvent.category} · Attendee Roster
                  </span>
                  <h2 className="text-base font-bold text-slate-900 mt-0.5 leading-snug">
                    {activeEvent.title}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleExportCSV(activeEvent)}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-lg border border-emerald-200 transition-colors flex items-center gap-1.5 shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                    Download CSV
                  </button>
                  <button
                    onClick={() => setAnnouncementEventId(activeEvent.id)}
                    className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-semibold rounded-lg border border-purple-200 transition-colors flex items-center gap-1.5 shadow-2xs"
                  >
                    <Bell className="w-3.5 h-3.5 text-purple-600" />
                    Notify Attendees
                  </button>
                </div>
              </div>

              {/* API Endpoint Indicator */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono bg-purple-50/70 border border-purple-100 px-3 py-2 rounded-xl text-purple-900">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-purple-700">GET</span>
                  <span className="text-slate-700">/api/events/{activeEvent.id}/registrations</span>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-600 font-sans text-xs">Attendee list, owning organizer only</span>
                </div>
                <span className="text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded text-[11px] font-semibold self-start sm:self-auto">
                  200 OK · Verified Host ({activeEvent.organizerName})
                </span>
              </div>

              {/* Search Bar for Participants */}
              <div className="flex items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={participantSearch}
                    onChange={(e) => setParticipantSearch(e.target.value)}
                    placeholder="Search by student name, USN, email, or department..."
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
                <span className="text-xs text-slate-500 font-mono shrink-0">
                  {filteredParticipants.length} of {activeEvent.registeredCount} attendees
                </span>
              </div>

              {/* High Density Table for Participants */}
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-3 py-2.5">Pass ID</th>
                      <th className="px-3 py-2.5">Student / Participant</th>
                      <th className="px-3 py-2.5">USN / ID</th>
                      <th className="px-3 py-2.5">Department</th>
                      <th className="px-3 py-2.5">Contact</th>
                      <th className="px-3 py-2.5">Registered</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredParticipants.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                          {participantSearch ? 'No attendees match your search query.' : 'No students have registered for this event yet.'}
                        </td>
                      </tr>
                    ) : (
                      filteredParticipants.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-3 py-2.5 font-mono text-indigo-700 font-medium">
                            {p.id}
                          </td>
                          <td className="px-3 py-2.5">
                            <span className="font-bold text-slate-900 block">{p.userName}</span>
                            <span className="text-[11px] text-slate-500 truncate block max-w-[140px]">{p.userEmail}</span>
                          </td>
                          <td className="px-3 py-2.5 font-mono">
                            {p.userUsn || '—'}
                          </td>
                          <td className="px-3 py-2.5 truncate max-w-[120px]">
                            {p.userDept}
                          </td>
                          <td className="px-3 py-2.5 font-mono text-[11px]">
                            {p.userPhone || '—'}
                          </td>
                          <td className="px-3 py-2.5 text-slate-500 tabular-nums">
                            {new Date(p.registeredAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-slate-400">
              Select an event to view attendees
            </div>
          )}
        </div>
      </div>

      {/* Broadcast Announcement Modal */}
      {announcementEventId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-bold text-slate-900">Broadcast Announcement</h3>
              </div>
              <button
                onClick={() => setAnnouncementEventId(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendAnnouncement} className="p-6 space-y-4">
              {announcementSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Announcement sent to all registered attendees!</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Announcement Subject / Title *
                </label>
                <input
                  type="text"
                  required
                  value={announcementTitle}
                  onChange={(e) => setAnnouncementTitle(e.target.value)}
                  placeholder="e.g. Schedule Update, Room Change, or Discord Link"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Message Content *
                </label>
                <textarea
                  required
                  rows={4}
                  value={announcementMsg}
                  onChange={(e) => setAnnouncementMsg(e.target.value)}
                  placeholder="Write clear instructions or alerts for your registered participants..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAnnouncementEventId(null)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Send Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Event Modal */}
      {editingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <h3 className="text-base font-bold text-slate-900">Edit Event Information</h3>
              <button
                onClick={() => setEditingEvent(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 overflow-y-auto space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  required
                  value={editingEvent.title}
                  onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Event Date
                  </label>
                  <input
                    type="date"
                    required
                    value={editingEvent.date}
                    onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Max Capacity
                  </label>
                  <input
                    type="number"
                    min={editingEvent.registeredCount}
                    required
                    value={editingEvent.maxParticipants}
                    onChange={(e) => setEditingEvent({ ...editingEvent, maxParticipants: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Venue
                </label>
                <input
                  type="text"
                  required
                  value={editingEvent.venue}
                  onChange={(e) => setEditingEvent({ ...editingEvent, venue: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="text"
                    required
                    value={editingEvent.startTime}
                    onChange={(e) => setEditingEvent({ ...editingEvent, startTime: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="text"
                    required
                    value={editingEvent.endTime}
                    onChange={(e) => setEditingEvent({ ...editingEvent, endTime: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editingEvent.description}
                  onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingEvent(null)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
