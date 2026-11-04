import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CampusEvent, User } from '../types';
import { 
  ShieldCheck, 
  Check, 
  X, 
  Trash2, 
  AlertCircle, 
  Users, 
  Calendar, 
  Layers, 
  Search, 
  CheckCircle2, 
  XCircle,
  ExternalLink,
  RotateCcw
} from 'lucide-react';

interface AdminDashboardProps {
  onViewEvent: (event: CampusEvent) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onViewEvent }) => {
  const { 
    currentUser, 
    events, 
    users, 
    registrations, 
    approveEvent, 
    rejectEvent, 
    deleteEvent, 
    deleteUser, 
    resetToSampleData 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'pending' | 'all-events' | 'students' | 'organizers' | 'registrations'>('pending');
  const [rejectModalEventId, setRejectModalEventId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // KPIs
  const pendingEvents = events.filter(e => e.status === 'pending');
  const approvedEvents = events.filter(e => e.status === 'approved');
  const studentUsers = users.filter(u => u.role === 'student');
  const organizerUsers = users.filter(u => u.role === 'organizer');
  const totalRegistrations = registrations.filter(r => r.status === 'confirmed').length;

  const handleApprove = (eventId: string) => {
    approveEvent(eventId);
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModalEventId) return;
    rejectEvent(rejectModalEventId, rejectionReason.trim() || 'Event does not meet campus activity guidelines or lacks adequate security info.');
    setRejectModalEventId(null);
    setRejectionReason('');
  };

  const filteredEvents = events.filter(e =>
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.organizerClub.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredStudents = studentUsers.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.usn && u.usn.toLowerCase().includes(searchQuery.toLowerCase())) ||
    u.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredOrganizers = organizerUsers.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.organization && u.organization.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-100 mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            Admin Directorate Console
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Campus Administration & Event Moderation
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Signed in as: <strong className="text-slate-800">{currentUser?.name || 'Administrator'}</strong> (Campus Activities Directorate)
          </p>
        </div>

        <button
          onClick={() => {
            if (confirm('Reset system data to sample events and users?')) {
              resetToSampleData();
            }
          }}
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          title="Restore original demo seed data"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Demo Data
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => setActiveTab('pending')}
          className={`bg-white p-5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
            pendingEvents.length > 0
              ? 'border-amber-300 ring-2 ring-amber-400/20 bg-amber-50/20'
              : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider">
            <span>Pending Approvals</span>
            <AlertCircle className={`w-4 h-4 ${pendingEvents.length > 0 ? 'text-amber-500' : 'text-slate-400'}`} />
          </div>
          <p className="text-2xl font-mono font-bold text-amber-600 mt-2 tabular-nums">
            {pendingEvents.length}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {pendingEvents.length > 0 ? 'Requires administrative review' : 'All clear'}
          </span>
        </div>

        <div 
          onClick={() => setActiveTab('all-events')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs cursor-pointer hover:border-slate-300"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider">
            <span>Total Campus Events</span>
            <Calendar className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-mono font-bold text-slate-900 mt-2 tabular-nums">
            {events.length}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {approvedEvents.length} Live on campus
          </span>
        </div>

        <div 
          onClick={() => setActiveTab('registrations')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs cursor-pointer hover:border-slate-300"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider">
            <span>Total Registrations</span>
            <Layers className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-mono font-bold text-emerald-600 mt-2 tabular-nums">
            {totalRegistrations}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Verified participant passes
          </span>
        </div>

        <div 
          onClick={() => setActiveTab('students')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs cursor-pointer hover:border-slate-300"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider">
            <span>Registered Members</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-mono font-bold text-slate-900 mt-2 tabular-nums">
            {users.length}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {studentUsers.length} Students · {organizerUsers.length} Organizers
          </span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-3 relative whitespace-nowrap transition-colors ${
            activeTab === 'pending'
              ? 'text-amber-600 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Event Approvals Queue ({pendingEvents.length})
          {activeTab === 'pending' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('all-events')}
          className={`pb-3 relative whitespace-nowrap transition-colors ${
            activeTab === 'all-events'
              ? 'text-indigo-600 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          All Events Catalog ({events.length})
          {activeTab === 'all-events' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`pb-3 relative whitespace-nowrap transition-colors ${
            activeTab === 'students'
              ? 'text-blue-600 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Students & Members ({studentUsers.length})
          {activeTab === 'students' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('organizers')}
          className={`pb-3 relative whitespace-nowrap transition-colors ${
            activeTab === 'organizers'
              ? 'text-purple-600 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Organizers & Clubs ({organizerUsers.length})
          {activeTab === 'organizers' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('registrations')}
          className={`pb-3 relative whitespace-nowrap transition-colors ${
            activeTab === 'registrations'
              ? 'text-emerald-600 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Registration Monitor ({registrations.length})
          {activeTab === 'registrations' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />
          )}
        </button>
      </div>

      {/* Tab 1: Pending Approvals */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {pendingEvents.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">All submissions are reviewed!</h3>
              <p className="text-xs text-slate-500">
                There are no pending events waiting for admin clearance at this time.
              </p>
            </div>
          ) : (
            pendingEvents.map((ev) => (
              <div
                key={ev.id}
                className="bg-white rounded-2xl border border-amber-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                      Pending Approval
                    </span>
                    <span className="text-xs text-slate-500">
                      Submitted {new Date(ev.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{ev.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {ev.description}
                  </p>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
                    <span>Host: <strong className="text-slate-800">{ev.organizerName}</strong> ({ev.organizerClub})</span>
                    <span>·</span>
                    <span>Date: <strong className="text-slate-800">{ev.date}</strong> ({ev.startTime})</span>
                    <span>·</span>
                    <span>Venue: <strong className="text-slate-800">{ev.venue}</strong></span>
                    <span>·</span>
                    <span>Capacity: <strong className="text-slate-800 font-mono">{ev.maxParticipants}</strong> seats</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    onClick={() => onViewEvent(ev)}
                    className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                  >
                    Preview
                  </button>
                  <button
                    onClick={() => setRejectModalEventId(ev.id)}
                    className="px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <X className="w-3.5 h-3.5" />
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprove(ev.id)}
                    className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Approve & Publish
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: All Events Catalog */}
      {activeTab === 'all-events' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search events by title or category..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>
            <span className="text-xs text-slate-500 font-mono">
              {filteredEvents.length} of {events.length} events
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-3 py-2.5">Status</th>
                  <th className="px-3 py-2.5">Event Title</th>
                  <th className="px-3 py-2.5">Category</th>
                  <th className="px-3 py-2.5">Date & Venue</th>
                  <th className="px-3 py-2.5">Registrations</th>
                  <th className="px-3 py-2.5">Organizer</th>
                  <th className="px-3 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredEvents.map((ev) => (
                  <tr key={ev.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-3 py-2.5">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                        ev.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        ev.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {ev.status}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 font-bold text-slate-900 max-w-[200px] truncate">
                      {ev.title}
                    </td>
                    <td className="px-3 py-2.5 text-indigo-600 font-medium">
                      {ev.category}
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="block text-slate-800">{ev.date}</span>
                      <span className="text-[11px] text-slate-500 truncate block max-w-[130px]">{ev.venue}</span>
                    </td>
                    <td className="px-3 py-2.5 font-mono">
                      {ev.registeredCount} / {ev.maxParticipants}
                    </td>
                    <td className="px-3 py-2.5 truncate max-w-[130px]">
                      {ev.organizerClub || ev.organizerName}
                    </td>
                    <td className="px-3 py-2.5 text-right space-x-1">
                      <button
                        onClick={() => onViewEvent(ev)}
                        className="px-2 py-1 text-slate-600 hover:text-indigo-600 text-[11px] font-semibold"
                      >
                        View
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Remove event "${ev.title}"?`)) {
                            deleteEvent(ev.id);
                          }
                        }}
                        className="px-2 py-1 text-rose-600 hover:bg-rose-50 rounded text-[11px] font-semibold"
                        title="Remove fake or inappropriate event"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Students & Members */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search students by name, USN, email..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>
            <span className="text-xs text-slate-500 font-mono">
              {filteredStudents.length} registered students
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-3 py-2.5">Name</th>
                  <th className="px-3 py-2.5">USN / ID</th>
                  <th className="px-3 py-2.5">College & Department</th>
                  <th className="px-3 py-2.5">Contact</th>
                  <th className="px-3 py-2.5">Joined</th>
                  <th className="px-3 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredStudents.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-3 py-2.5 font-bold text-slate-900">
                      {st.name}
                      <span className="text-[11px] text-slate-500 block font-normal">{st.email}</span>
                    </td>
                    <td className="px-3 py-2.5 font-mono text-indigo-700 font-medium">
                      {st.usn || 'Guest Member'}
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="block text-slate-800">{st.department}</span>
                      <span className="text-[11px] text-slate-500 truncate block max-w-[150px]">{st.collegeName}</span>
                    </td>
                    <td className="px-3 py-2.5 font-mono">
                      {st.phone}
                    </td>
                    <td className="px-3 py-2.5 text-slate-500">
                      {new Date(st.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <button
                        onClick={() => {
                          if (confirm(`Remove member "${st.name}"?`)) {
                            deleteUser(st.id);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded"
                        title="Delete user"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Organizers Directory */}
      {activeTab === 'organizers' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search organizers by name or club..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>
            <span className="text-xs text-slate-500 font-mono">
              {filteredOrganizers.length} authorized hosts
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-3 py-2.5">Organizer Name</th>
                  <th className="px-3 py-2.5">Club / Organization</th>
                  <th className="px-3 py-2.5">Email</th>
                  <th className="px-3 py-2.5">Contact</th>
                  <th className="px-3 py-2.5">Events Hosted</th>
                  <th className="px-3 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredOrganizers.map((org) => {
                  const hostedCount = events.filter(e => e.organizerId === org.id).length;
                  return (
                    <tr key={org.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-3 py-2.5 font-bold text-slate-900">
                        {org.name}
                      </td>
                      <td className="px-3 py-2.5 text-purple-700 font-medium">
                        {org.organization || 'Campus Club'}
                      </td>
                      <td className="px-3 py-2.5">
                        {org.email}
                      </td>
                      <td className="px-3 py-2.5 font-mono">
                        {org.phone}
                      </td>
                      <td className="px-3 py-2.5 font-mono font-bold text-slate-800">
                        {hostedCount}
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <button
                          onClick={() => {
                            if (confirm(`Remove organizer profile "${org.name}"?`)) {
                              deleteUser(org.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                          title="Revoke access"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Registrations Monitor */}
      {activeTab === 'registrations' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Live Campus Registrations Feed
            </h2>
            <span className="text-xs text-slate-500 font-mono">
              {registrations.length} registrations total
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-3 py-2.5">Pass ID</th>
                  <th className="px-3 py-2.5">Event Name</th>
                  <th className="px-3 py-2.5">Student</th>
                  <th className="px-3 py-2.5">USN</th>
                  <th className="px-3 py-2.5">Department</th>
                  <th className="px-3 py-2.5">Date</th>
                  <th className="px-3 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {registrations.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-3 py-2.5 font-mono text-indigo-700 font-bold">
                      {r.id}
                    </td>
                    <td className="px-3 py-2.5 font-semibold text-slate-900 max-w-[200px] truncate">
                      {r.eventTitle}
                    </td>
                    <td className="px-3 py-2.5">
                      {r.userName}
                    </td>
                    <td className="px-3 py-2.5 font-mono">
                      {r.userUsn || '—'}
                    </td>
                    <td className="px-3 py-2.5 truncate max-w-[120px]">
                      {r.userDept}
                    </td>
                    <td className="px-3 py-2.5 text-slate-500 font-mono">
                      {new Date(r.registeredAt).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 uppercase">
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Rejection Reason Modal */}
      {rejectModalEventId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-600" />
                Reject Event Proposal
              </h3>
              <button
                onClick={() => setRejectModalEventId(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRejectSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason for Rejection (communicated to organizer)
                </label>
                <textarea
                  required
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Venue scheduling conflict with university exams, or missing required faculty advisor signature..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectModalEventId(null)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-xs"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
