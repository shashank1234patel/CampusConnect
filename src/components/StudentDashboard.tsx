import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { EventRegistration, CampusEvent } from '../types';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Download, 
  Bell, 
  User as UserIcon, 
  Edit3, 
  CheckCircle2, 
  AlertTriangle,
  QrCode,
  Tag,
  ArrowRight
} from 'lucide-react';

interface StudentDashboardProps {
  onViewTicket: (registrationId: string) => void;
  onExploreEvents: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  onViewTicket,
  onExploreEvents,
}) => {
  const { currentUser, registrations, events, announcements, cancelRegistration, updateProfile } = useApp();

  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'announcements' | 'profile'>('upcoming');

  // Profile edit states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [name, setName] = useState(currentUser?.name || '');
  const [usn, setUsn] = useState(currentUser?.usn || '');
  const [collegeName, setCollegeName] = useState(currentUser?.collegeName || '');
  const [department, setDepartment] = useState(currentUser?.department || '');
  const [yearSemester, setYearSemester] = useState(currentUser?.yearSemester || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Filter registrations for current student
  const myRegistrations = registrations.filter(
    r => r.userEmail.toLowerCase() === (currentUser?.email || '').toLowerCase() && r.status === 'confirmed'
  );

  const todayStr = new Date().toISOString().split('T')[0];

  const upcomingRegistrations = myRegistrations.filter(r => r.eventDate >= todayStr);
  const pastRegistrations = myRegistrations.filter(r => r.eventDate < todayStr);

  // Filter announcements for events the user is registered for
  const registeredEventIds = myRegistrations.map(r => r.eventId);
  const myAnnouncements = announcements.filter(a => registeredEventIds.includes(a.eventId));

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: name.trim(),
      usn: usn.trim() ? usn.trim().toUpperCase() : undefined,
      collegeName: collegeName.trim(),
      department: department.trim(),
      yearSemester: yearSemester.trim(),
      phone: phone.trim(),
    });
    setProfileSuccess(true);
    setIsEditingProfile(false);
    setTimeout(() => setProfileSuccess(false), 2000);
  };

  const handleCancelPass = (regId: string) => {
    if (confirm('Cancel your registration for this event? Your pass will be revoked and seat freed.')) {
      cancelRegistration(regId);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Student Welcome & Profile Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-xs">
            {currentUser?.name.charAt(0) || 'S'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-extrabold text-slate-900">
                {currentUser?.name || 'Student Portal'}
              </h1>
              <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                {currentUser?.role === 'student' ? 'Student Member' : currentUser?.role}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
              {currentUser?.usn && (
                <>
                  <span className="font-mono text-slate-700 font-medium">USN: {currentUser.usn}</span>
                  <span>·</span>
                </>
              )}
              <span>{currentUser?.department || 'Computer Science'}</span>
              <span>·</span>
              <span className="text-slate-600">{currentUser?.collegeName}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('profile')}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Edit3 className="w-3.5 h-3.5 text-slate-400" />
            Edit Profile
          </button>
          <button
            onClick={onExploreEvents}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
          >
            Explore More Events
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {profileSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Profile changes saved successfully!</span>
        </div>
      )}

      {/* API Endpoint Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono bg-indigo-50/70 border border-indigo-100 px-3 py-2 rounded-xl text-indigo-900">
        <div className="flex items-center gap-2">
          <span className="font-bold text-indigo-700">GET</span>
          <span className="text-slate-700">/api/me/registrations</span>
          <span className="text-slate-400">·</span>
          <span className="text-slate-600 font-sans text-xs">Current user's registrations ({myRegistrations.length} confirmed)</span>
        </div>
        <span className="text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded text-[11px] font-semibold self-start sm:self-auto">
          200 OK · User: {currentUser?.email}
        </span>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`pb-3 relative transition-colors ${
            activeTab === 'upcoming'
              ? 'text-indigo-600 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Upcoming Events ({upcomingRegistrations.length})
          {activeTab === 'upcoming' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('past')}
          className={`pb-3 relative transition-colors ${
            activeTab === 'past'
              ? 'text-indigo-600 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Past Events ({pastRegistrations.length})
          {activeTab === 'past' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('announcements')}
          className={`pb-3 relative transition-colors ${
            activeTab === 'announcements'
              ? 'text-indigo-600 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Event Announcements ({myAnnouncements.length})
          {activeTab === 'announcements' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 relative transition-colors ${
            activeTab === 'profile'
              ? 'text-indigo-600 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Student Profile Details
          {activeTab === 'profile' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
          )}
        </button>
      </div>

      {/* Tab 1: Upcoming Registered Events */}
      {activeTab === 'upcoming' && (
        <div className="space-y-4">
          {upcomingRegistrations.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">No upcoming events registered</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Explore hackathons, workshops, cultural nights, and competitions happening on campus!
              </p>
              <button
                onClick={onExploreEvents}
                className="mt-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                Browse Upcoming Events
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingRegistrations.map((reg) => {
                const ev = events.find(e => e.id === reg.eventId);
                const canCancel = ev ? ev.allowCancellation : true;

                return (
                  <div
                    key={reg.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-sm transition-shadow flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wide">
                          {reg.eventCategory}
                        </span>
                        <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                          {reg.id}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 mt-2 leading-snug">
                        {reg.eventTitle}
                      </h3>

                      <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-medium text-slate-900">{reg.eventDate}</span>
                          <span className="text-slate-400">·</span>
                          <span>{reg.eventTime}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span className="truncate">{reg.eventVenue}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      {canCancel ? (
                        <button
                          onClick={() => handleCancelPass(reg.id)}
                          className="text-[11px] font-medium text-rose-600 hover:text-rose-700 hover:underline"
                        >
                          Cancel Pass
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400">Non-cancellable</span>
                      )}

                      <button
                        onClick={() => onViewTicket(reg.id)}
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        View Ticket & Pass
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Past Events */}
      {activeTab === 'past' && (
        <div className="space-y-4">
          {pastRegistrations.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500">
              No completed past events recorded yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pastRegistrations.map((reg) => (
                <div key={reg.id} className="bg-white rounded-2xl border border-slate-200 p-5 opacity-80">
                  <span className="text-[11px] text-slate-400 font-mono">{reg.id}</span>
                  <h3 className="text-sm font-bold text-slate-900 mt-1">{reg.eventTitle}</h3>
                  <p className="text-xs text-slate-500 mt-1">Attended on {reg.eventDate}</p>
                  <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                    <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                      Completed
                    </span>
                    <button
                      onClick={() => onViewTicket(reg.id)}
                      className="text-indigo-600 font-medium hover:underline"
                    >
                      View Certificate / Pass
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Event Announcements */}
      {activeTab === 'announcements' && (
        <div className="space-y-3">
          {myAnnouncements.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500">
              No recent announcements for your registered events.
            </div>
          ) : (
            myAnnouncements.map((ann) => (
              <div key={ann.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                    {ann.eventTitle}
                  </span>
                  <span className="text-slate-400 text-[11px] font-mono">
                    {new Date(ann.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">{ann.title}</h3>
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {ann.message}
                </p>
                <p className="text-[11px] text-slate-400">
                  Sent by organizer: {ann.organizerName}
                </p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 4: Student Profile Details */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs max-w-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Your Student Information</h2>
              <p className="text-xs text-slate-500">Auto-filled whenever you register for new events</p>
            </div>
            {!isEditingProfile && (
              <button
                onClick={() => {
                  setName(currentUser?.name || '');
                  setUsn(currentUser?.usn || '');
                  setCollegeName(currentUser?.collegeName || '');
                  setDepartment(currentUser?.department || '');
                  setYearSemester(currentUser?.yearSemester || '');
                  setPhone(currentUser?.phone || '');
                  setIsEditingProfile(true);
                }}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit Info
              </button>
            )}
          </div>

          {isEditingProfile ? (
            <form onSubmit={handleSaveProfile} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    USN / Student ID
                  </label>
                  <input
                    type="text"
                    value={usn}
                    onChange={(e) => setUsn(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    College Name
                  </label>
                  <input
                    type="text"
                    required
                    value={collegeName}
                    onChange={(e) => setCollegeName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    required
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Year / Semester
                </label>
                <input
                  type="text"
                  value={yearSemester}
                  onChange={(e) => setYearSemester(e.target.value)}
                  placeholder="e.g. 3rd Year / 6th Semester"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs"
                >
                  Save Profile
                </button>
              </div>
            </form>
          ) : (
            <div className="mt-4 divide-y divide-slate-100 text-xs">
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Name</span>
                <span className="font-semibold text-slate-900">{currentUser?.name}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Email Address</span>
                <span className="text-slate-800">{currentUser?.email}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">USN / Student ID</span>
                <span className="font-mono font-medium text-slate-900">{currentUser?.usn || 'Not Provided'}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">College</span>
                <span className="text-slate-800">{currentUser?.collegeName}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Department</span>
                <span className="text-slate-800">{currentUser?.department}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Year / Semester</span>
                <span className="text-slate-800">{currentUser?.yearSemester || '—'}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Contact Number</span>
                <span className="text-slate-800">{currentUser?.phone}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
