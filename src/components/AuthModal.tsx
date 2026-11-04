import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { X, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
  initialRole?: UserRole;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  initialRole = 'student',
}) => {
  const { login, signup, switchDemoRole } = useApp();

  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [role, setRole] = useState<UserRole>(initialRole);
  const [isStudent, setIsStudent] = useState<boolean>(true);

  // Form Fields
  const [name, setName] = useState('');
  const [usn, setUsn] = useState('');
  const [collegeName, setCollegeName] = useState('Bangalore Institute of Technology');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [yearSemester, setYearSemester] = useState('3rd Year / 5th Semester');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [organization, setOrganization] = useState('');

  // Status & Error
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleQuickDemo = (demoRole: UserRole) => {
    switchDemoRole(demoRole);
    setSuccessMsg(`Switched to ${demoRole} demo account`);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Please provide your registered email and password.');
      return;
    }

    const res = login(email, role);
    if (res.success) {
      setSuccessMsg(res.message);
      setTimeout(() => {
        onClose();
      }, 700);
    } else {
      setError(res.message);
    }
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!name.trim()) {
      setError('Full Name is required.');
      return;
    }

    if (isStudent && !usn.trim()) {
      setError('USN / Student ID is required for student registration.');
      return;
    }

    if (!collegeName.trim()) {
      setError('College Name is required.');
      return;
    }

    if (!department.trim()) {
      setError('Department is required.');
      return;
    }

    if (!phone.trim() || phone.trim().length < 8) {
      setError('Please provide a valid Mobile Number (at least 8 digits).');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify both password entries.');
      return;
    }

    const res = signup({
      name: name.trim(),
      email: email.trim(),
      role: role,
      isStudent: isStudent,
      usn: isStudent ? usn.trim().toUpperCase() : undefined,
      collegeName: collegeName.trim(),
      department: department.trim(),
      yearSemester: isStudent ? yearSemester : undefined,
      phone: phone.trim(),
      organization: organization.trim() || undefined,
    });

    if (res.success) {
      setSuccessMsg(res.message);
      setTimeout(() => {
        onClose();
      }, 900);
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {mode === 'login' ? 'Sign in to CampusConnect' : 'Create an Account'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {mode === 'login'
                ? 'Access registrations, tickets, or manage campus events.'
                : 'Join your campus event network as a student, member, or host.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Demo Switcher Bar */}
        <div className="px-6 py-2.5 bg-indigo-50/60 border-b border-indigo-100 flex items-center justify-between text-xs">
          <span className="text-indigo-900 font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            Quick 1-Click Demo Login:
          </span>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickDemo('student')}
              className="px-2.5 py-1 bg-white hover:bg-indigo-600 hover:text-white text-indigo-700 font-medium rounded border border-indigo-200 transition-colors shadow-2xs"
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('organizer')}
              className="px-2.5 py-1 bg-white hover:bg-purple-600 hover:text-white text-purple-700 font-medium rounded border border-purple-200 transition-colors shadow-2xs"
            >
              Organizer
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              className="px-2.5 py-1 bg-white hover:bg-blue-600 hover:text-white text-blue-700 font-medium rounded border border-blue-200 transition-colors shadow-2xs"
            >
              Admin
            </button>
          </div>
        </div>

        {/* Tab Toggle: Login vs Sign Up */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`flex-1 py-3 text-center transition-colors border-b-2 ${
              mode === 'login'
                ? 'border-indigo-600 text-indigo-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError(null);
            }}
            className={`flex-1 py-3 text-center transition-colors border-b-2 ${
              mode === 'signup'
                ? 'border-indigo-600 text-indigo-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Create New Account
          </button>
        </div>

        {/* Form Body with scroll */}
        <div className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-start gap-2">
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {mode === 'login' ? (
            /* Login Form */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. shashank1234patel@gmail.com"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span>Demo Student: shashank1234patel@gmail.com</span>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('shashank1234patel@gmail.com');
                    setPassword('password123');
                  }}
                  className="text-indigo-600 hover:underline font-medium"
                >
                  Fill Sample
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg shadow-xs transition-colors"
              >
                Sign In
              </button>
            </form>
          ) : (
            /* Full Student & Member Sign Up Form */
            <form onSubmit={handleSignupSubmit} className="space-y-3.5">
              {/* Account Type Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  I am registering as:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setRole('student');
                      setIsStudent(true);
                    }}
                    className={`py-2 px-3 text-xs font-medium rounded-lg border text-center transition-colors ${
                      role === 'student' && isStudent
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-semibold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    College Student
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRole('student');
                      setIsStudent(false);
                    }}
                    className={`py-2 px-3 text-xs font-medium rounded-lg border text-center transition-colors ${
                      role === 'student' && !isStudent
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-semibold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Faculty / Member
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRole('organizer');
                    }}
                    className={`py-2 px-3 text-xs font-medium rounded-lg border text-center transition-colors ${
                      role === 'organizer'
                        ? 'border-purple-600 bg-purple-50 text-purple-700 font-semibold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Event Organizer
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              {/* USN / Student ID */}
              {isStudent && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    USN / Student ID *
                  </label>
                  <input
                    type="text"
                    required={isStudent}
                    value={usn}
                    onChange={(e) => setUsn(e.target.value)}
                    placeholder="e.g. 1MS23CS045"
                    className="w-full px-3 py-2 text-sm uppercase font-mono border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Required for student ticket verification at event entrance.
                  </p>
                </div>
              )}

              {/* College & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    College Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={collegeName}
                    onChange={(e) => setCollegeName(e.target.value)}
                    placeholder="e.g. Bangalore Institute of Technology"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Department *
                  </label>
                  <input
                    type="text"
                    required
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Computer Science"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
              </div>

              {/* Year / Semester & Mobile Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {isStudent ? (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Year / Semester *
                    </label>
                    <select
                      value={yearSemester}
                      onChange={(e) => setYearSemester(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
                    >
                      <option value="1st Year / 1st Sem">1st Year / 1st Sem</option>
                      <option value="1st Year / 2nd Sem">1st Year / 2nd Sem</option>
                      <option value="2nd Year / 3rd Sem">2nd Year / 3rd Sem</option>
                      <option value="2nd Year / 4th Sem">2nd Year / 4th Sem</option>
                      <option value="3rd Year / 5th Sem">3rd Year / 5th Sem</option>
                      <option value="3rd Year / 6th Sem">3rd Year / 6th Sem</option>
                      <option value="4th Year / 7th Sem">4th Year / 7th Sem</option>
                      <option value="4th Year / 8th Sem">4th Year / 8th Sem</option>
                      <option value="Postgraduate / PhD">Postgraduate / PhD</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Role / Designation
                    </label>
                    <input
                      type="text"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      placeholder="e.g. Assistant Professor / Club Lead"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@college.edu or name@gmail.com"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg shadow-xs transition-colors"
              >
                Create Account & Join
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
