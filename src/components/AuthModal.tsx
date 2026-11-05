import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import {
  X,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Smartphone,
  Mail,
  IdCard,
  ShieldCheck,
  ArrowRight,
  KeyRound,
  RefreshCw,
} from 'lucide-react';

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
  const { login, loginWithMobile, socialLogin, signup, switchDemoRole } = useApp();

  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [loginMethod, setLoginMethod] = useState<'email' | 'mobile' | 'usn'>('email');
  const [role, setRole] = useState<UserRole>(initialRole);
  const [isStudent, setIsStudent] = useState<boolean>(true);

  // Google Account Picker sub-state
  const [showGooglePicker, setShowGooglePicker] = useState<boolean>(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState<string>('');
  const [customGoogleName, setCustomGoogleName] = useState<string>('');
  const [showCustomGoogleForm, setShowCustomGoogleForm] = useState<boolean>(false);

  // Mobile OTP Login states
  const [countryCode, setCountryCode] = useState<string>('+91');
  const [mobileLoginNumber, setMobileLoginNumber] = useState<string>('9845012345');
  const [mobileUserName, setMobileUserName] = useState<string>('');
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [generatedOtp, setGeneratedOtp] = useState<string>('482910');
  const [enteredOtp, setEnteredOtp] = useState<string>('');

  // USN Login states
  const [loginUsn, setLoginUsn] = useState<string>('1MS23CS108');
  const [usnPassword, setUsnPassword] = useState<string>('');

  // Standard Form Fields
  const [name, setName] = useState('');
  const [usn, setUsn] = useState('');
  const [collegeName, setCollegeName] = useState('Intellipaat School of Technology');
  const [department, setDepartment] = useState('Computer Science & Engineering (AI & ML)');
  const [yearSemester, setYearSemester] = useState('3rd Year / 6th Semester');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [organization, setOrganization] = useState('');

  // Status & Error
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const finishWithSuccess = (message: string) => {
    setError(null);
    setSuccessMsg(message);
    setTimeout(() => {
      setSuccessMsg(null);
      setShowGooglePicker(false);
      onClose();
    }, 750);
  };

  const handleQuickDemo = (demoRole: UserRole) => {
    switchDemoRole(demoRole);
    finishWithSuccess(`Switched to ${demoRole} account`);
  };

  const handleGoogleAccountSelect = (account: { name: string; email: string; role?: UserRole }) => {
    const res = socialLogin('google', account);
    if (res.success) {
      finishWithSuccess(res.message);
    } else {
      setError(res.message);
    }
  };

  const handleCustomGoogleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customGoogleEmail.trim() || !customGoogleEmail.includes('@')) {
      setError('Please enter a valid Google / Gmail address.');
      return;
    }
    const derivedName =
      customGoogleName.trim() ||
      customGoogleEmail
        .split('@')[0]
        .replace(/[._0-9]+/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase())
        .trim() ||
      'Google User';
    handleGoogleAccountSelect({
      name: derivedName,
      email: customGoogleEmail.trim(),
      role,
    });
  };

  const handleSocialSSO = (provider: 'microsoft' | 'github') => {
    const profile =
      provider === 'microsoft'
        ? {
            name: 'Shashank Patel (Campus SSO)',
            email: 'shashank1234patel@gmail.com',
            role: 'student' as UserRole,
          }
        : {
            name: 'Shashank Patel (GitHub)',
            email: 'shashank1234patel@gmail.com',
            role: 'organizer' as UserRole,
          };
    const res = socialLogin(provider, profile);
    if (res.success) {
      finishWithSuccess(res.message);
    }
  };

  const handleSendOtp = () => {
    setError(null);
    const digits = mobileLoginNumber.replace(/\D/g, '');
    if (digits.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    const newCode = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedOtp(newCode);
    setEnteredOtp(newCode);
    setOtpSent(true);
  };

  const handleVerifyMobileOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!otpSent) {
      handleSendOtp();
      return;
    }
    if (enteredOtp.trim().length < 4) {
      setError('Please enter the 6-digit OTP sent to your mobile number.');
      return;
    }
    const fullPhone = `${countryCode} ${mobileLoginNumber.trim()}`;
    const res = loginWithMobile(fullPhone, mobileUserName, role);
    if (res.success) {
      finishWithSuccess(res.message);
    } else {
      setError(res.message);
    }
  };

  const handleUsnLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!loginUsn.trim() || !usnPassword.trim()) {
      setError('Please enter your Student USN / Roll ID and password.');
      return;
    }
    const res = login(loginUsn.trim(), 'student');
    if (res.success) {
      finishWithSuccess(res.message);
    } else {
      setError(res.message);
    }
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
      finishWithSuccess(res.message);
    } else {
      setError(res.message);
    }
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

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
      finishWithSuccess(res.message);
    } else {
      setError(res.message);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {mode === 'login' ? 'Sign in to CampusConnect' : 'Create an Account'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {mode === 'login'
                ? 'Sign in with Google, Mobile No. (OTP), Student USN, or Email.'
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
        <div className="px-6 py-2 bg-[#eef3f8] border-b border-slate-200 flex items-center justify-between text-xs">
          <span className="text-[#0a66c2] font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#0a66c2]" />
            Instant Role Switch:
          </span>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickDemo('student')}
              className="px-2.5 py-1 bg-white hover:bg-[#0a66c2] hover:text-white text-[#0a66c2] font-semibold rounded-md border border-[#0a66c2]/30 transition-colors"
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('organizer')}
              className="px-2.5 py-1 bg-white hover:bg-purple-600 hover:text-white text-purple-700 font-semibold rounded-md border border-purple-200 transition-colors"
            >
              Host (Organizer)
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              className="px-2.5 py-1 bg-white hover:bg-slate-800 hover:text-white text-slate-700 font-semibold rounded-md border border-slate-300 transition-colors"
            >
              Admin
            </button>
          </div>
        </div>

        {/* Tab Toggle: Sign In vs Create New Account */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`flex-1 py-3 text-center transition-colors border-b-2 ${
              mode === 'login'
                ? 'border-[#0a66c2] text-[#0a66c2] bg-white font-bold'
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
                ? 'border-[#0a66c2] text-[#0a66c2] bg-white font-bold'
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

          {/* Social Login Options (Google, Microsoft SSO, GitHub) */}
          <div className="space-y-2.5">
            <button
              type="button"
              onClick={() => {
                setShowGooglePicker(prev => !prev);
                setError(null);
              }}
              className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs sm:text-sm rounded-full border border-slate-300 shadow-2xs flex items-center justify-center gap-2.5 transition-all cursor-pointer"
            >
              {/* Official Google Multicolor SVG */}
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Interactive Google Account Picker Drawer */}
            {showGooglePicker && (
              <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/50 space-y-2.5 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    Choose a Google Account to Continue
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowGooglePicker(false)}
                    className="text-[11px] text-slate-400 hover:text-slate-600"
                  >
                    Close
                  </button>
                </div>

                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      handleGoogleAccountSelect({
                        name: 'Shashank Patel',
                        email: 'shashank1234patel@gmail.com',
                        role: 'organizer',
                      })
                    }
                    className="w-full p-2.5 rounded-lg bg-white hover:bg-blue-50 border border-slate-200 flex items-center justify-between text-left transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-[#0a66c2] text-white font-bold text-xs flex items-center justify-center shrink-0">
                        SP
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">Shashank Patel</p>
                        <p className="text-[11px] text-slate-500 truncate">shashank1234patel@gmail.com</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 shrink-0">
                      Host / Student
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleGoogleAccountSelect({
                        name: 'Sarah Jenkins',
                        email: 'sarah.jenkins@campusconnect.edu',
                        role: 'organizer',
                      })
                    }
                    className="w-full p-2.5 rounded-lg bg-white hover:bg-blue-50 border border-slate-200 flex items-center justify-between text-left transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        SJ
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">Sarah Jenkins</p>
                        <p className="text-[11px] text-slate-500 truncate">sarah.jenkins@campusconnect.edu</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 shrink-0">
                      Organizer
                    </span>
                  </button>
                </div>

                {!showCustomGoogleForm ? (
                  <button
                    type="button"
                    onClick={() => setShowCustomGoogleForm(true)}
                    className="w-full py-1.5 text-xs font-semibold text-[#0a66c2] hover:underline text-center"
                  >
                    + Use another Google / Gmail account
                  </button>
                ) : (
                  <form onSubmit={handleCustomGoogleSubmit} className="pt-2 border-t border-blue-200 space-y-2">
                    <input
                      type="text"
                      value={customGoogleName}
                      onChange={e => setCustomGoogleName(e.target.value)}
                      placeholder="Your Name (e.g. Aarav Kumar)"
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                    />
                    <div className="flex gap-2">
                      <input
                        type="email"
                        required
                        value={customGoogleEmail}
                        onChange={e => setCustomGoogleEmail(e.target.value)}
                        placeholder="yourname@gmail.com"
                        className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                      />
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-[#0a66c2] hover:bg-[#004182] text-white text-xs font-semibold rounded-lg shrink-0"
                      >
                        Continue
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Secondary SSO Options: Microsoft College SSO & GitHub */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleSocialSSO('microsoft')}
                className="py-2 px-3 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-full border border-slate-300 flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 23 23">
                  <path fill="#f35325" d="M1 1h10v10H1z" />
                  <path fill="#81bc06" d="M12 1h10v10H12z" />
                  <path fill="#05a6f0" d="M1 12h10v10H1z" />
                  <path fill="#ffba08" d="M12 12h10v10H12z" />
                </svg>
                <span>College / Microsoft</span>
              </button>

              <button
                type="button"
                onClick={() => handleSocialSSO('github')}
                className="py-2 px-3 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-full border border-slate-300 flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 shrink-0 fill-slate-800" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                <span>GitHub Account</span>
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200" />
            <span className="shrink mx-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              or {mode === 'login' ? 'sign in with' : 'register with details'}
            </span>
            <div className="flex-grow border-t border-slate-200" />
          </div>

          {mode === 'login' ? (
            <div className="space-y-4">
              {/* Sign-In Method Selector Pills: Email | Mobile No. (OTP) | Student USN */}
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod('email');
                    setError(null);
                  }}
                  className={`py-2 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    loginMethod === 'email'
                      ? 'bg-white text-[#0a66c2] shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email ID</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod('mobile');
                    setError(null);
                  }}
                  className={`py-2 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    loginMethod === 'mobile'
                      ? 'bg-white text-[#0a66c2] shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Mobile No.</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod('usn');
                    setError(null);
                  }}
                  className={`py-2 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    loginMethod === 'usn'
                      ? 'bg-white text-[#0a66c2] shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <IdCard className="w-3.5 h-3.5" />
                  <span>Student USN</span>
                </button>
              </div>

              {/* METHOD 1: EMAIL & PASSWORD */}
              {loginMethod === 'email' && (
                <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="e.g. shashank1234patel@gmail.com"
                      className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#0a66c2]/20 focus:border-[#0a66c2]"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-700">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setEmail('shashank1234patel@gmail.com');
                          setPassword('password123');
                        }}
                        className="text-[11px] text-[#0a66c2] hover:underline font-semibold"
                      >
                        Auto-fill Demo Credentials
                      </button>
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#0a66c2]/20 focus:border-[#0a66c2]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 bg-[#0a66c2] hover:bg-[#004182] text-white font-bold text-sm rounded-full shadow-xs transition-colors cursor-pointer"
                  >
                    Sign In with Email
                  </button>
                </form>
              )}

              {/* METHOD 2: MOBILE NUMBER + OTP */}
              {loginMethod === 'mobile' && (
                <form onSubmit={handleVerifyMobileOtp} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Mobile Number (WhatsApp / SMS OTP)
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={countryCode}
                        onChange={e => setCountryCode(e.target.value)}
                        className="px-2.5 py-2 text-xs font-semibold border border-slate-300 rounded-lg bg-slate-50 text-slate-800 focus:outline-hidden focus:border-[#0a66c2]"
                      >
                        <option value="+91">🇮🇳 +91 (IN)</option>
                        <option value="+1">🇺🇸 +1 (US)</option>
                        <option value="+44">🇬🇧 +44 (UK)</option>
                        <option value="+65">🇸🇬 +65 (SG)</option>
                      </select>
                      <input
                        type="tel"
                        required
                        value={mobileLoginNumber}
                        onChange={e => {
                          setMobileLoginNumber(e.target.value);
                          setOtpSent(false);
                        }}
                        placeholder="98450 12345"
                        className="flex-1 px-3.5 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#0a66c2]/20 focus:border-[#0a66c2]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Your Name (Optional for new mobile numbers)
                    </label>
                    <input
                      type="text"
                      value={mobileUserName}
                      onChange={e => setMobileUserName(e.target.value)}
                      placeholder="e.g. Shashank Patel"
                      className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#0a66c2]/20 focus:border-[#0a66c2]"
                    />
                  </div>

                  {!otpSent ? (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="w-full py-2.5 px-4 bg-[#0a66c2] hover:bg-[#004182] text-white font-bold text-sm rounded-full shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <Smartphone className="w-4 h-4" />
                      <span>Send 6-Digit OTP to {countryCode} {mobileLoginNumber || '...'}</span>
                    </button>
                  ) : (
                    <div className="space-y-3 p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          OTP Sent to {countryCode} {mobileLoginNumber}
                        </span>
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          className="text-[11px] text-[#0a66c2] hover:underline font-semibold flex items-center gap-1"
                        >
                          <RefreshCw className="w-3 h-3" /> Resend OTP
                        </button>
                      </div>

                      <div className="p-2 rounded-lg bg-white border border-emerald-200 flex items-center justify-between text-xs">
                        <span className="text-slate-600">
                          Demo SMS Code: <strong className="font-mono text-emerald-700 text-sm">{generatedOtp}</strong>
                        </span>
                        <button
                          type="button"
                          onClick={() => setEnteredOtp(generatedOtp)}
                          className="text-[11px] font-bold text-emerald-700 hover:underline"
                        >
                          Auto-filled ✓
                        </button>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Enter 6-Digit OTP
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={enteredOtp}
                          onChange={e => setEnteredOtp(e.target.value)}
                          placeholder="Enter 6-digit OTP"
                          className="w-full px-3.5 py-2 text-center tracking-[0.35em] font-mono font-bold text-base bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-full shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <span>Verify OTP & Sign In</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </form>
              )}

              {/* METHOD 3: STUDENT USN / ROLL NO */}
              {loginMethod === 'usn' && (
                <form onSubmit={handleUsnLoginSubmit} className="space-y-3.5">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-700">
                        University Seat Number (USN) / College ID
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setLoginUsn('1MS23CS108');
                          setUsnPassword('campus123');
                        }}
                        className="text-[11px] text-[#0a66c2] hover:underline font-semibold"
                      >
                        Fill Sample USN
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      value={loginUsn}
                      onChange={e => setLoginUsn(e.target.value.toUpperCase())}
                      placeholder="e.g. 1MS23CS108"
                      className="w-full px-3.5 py-2 text-sm font-mono uppercase border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#0a66c2]/20 focus:border-[#0a66c2]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Campus Portal PIN / Password
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        required
                        value={usnPassword}
                        onChange={e => setUsnPassword(e.target.value)}
                        placeholder="Enter portal password"
                        className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#0a66c2]/20 focus:border-[#0a66c2]"
                      />
                      <KeyRound className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 bg-[#0a66c2] hover:bg-[#004182] text-white font-bold text-sm rounded-full shadow-xs transition-colors cursor-pointer"
                  >
                    Sign In with Student USN
                  </button>
                </form>
              )}
            </div>
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
                        ? 'border-[#0a66c2] bg-blue-50 text-[#0a66c2] font-semibold'
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
                        ? 'border-[#0a66c2] bg-blue-50 text-[#0a66c2] font-semibold'
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
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#0a66c2]/20 focus:border-[#0a66c2]"
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
                    onChange={e => setUsn(e.target.value)}
                    placeholder="e.g. 1MS23CS045"
                    className="w-full px-3 py-2 text-sm uppercase font-mono border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#0a66c2]/20 focus:border-[#0a66c2]"
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
                    onChange={e => setCollegeName(e.target.value)}
                    placeholder="e.g. Intellipaat School of Technology"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#0a66c2]/20 focus:border-[#0a66c2]"
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
                    onChange={e => setDepartment(e.target.value)}
                    placeholder="e.g. Computer Science"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#0a66c2]/20 focus:border-[#0a66c2]"
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
                      onChange={e => setYearSemester(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#0a66c2]/20 focus:border-[#0a66c2] bg-white"
                    >
                      <option value="1st Year / 1st Sem">1st Year / 1st Sem</option>
                      <option value="1st Year / 2nd Sem">1st Year / 2nd Sem</option>
                      <option value="2nd Year / 3rd Sem">2nd Year / 3rd Sem</option>
                      <option value="2nd Year / 4th Sem">2nd Year / 4th Sem</option>
                      <option value="3rd Year / 5th Sem">3rd Year / 5th Sem</option>
                      <option value="3rd Year / 6th Semester">3rd Year / 6th Semester</option>
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
                      onChange={e => setOrganization(e.target.value)}
                      placeholder="e.g. Assistant Professor / Club Lead"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#0a66c2]/20 focus:border-[#0a66c2]"
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
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#0a66c2]/20 focus:border-[#0a66c2]"
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
                  onChange={e => setEmail(e.target.value)}
                  placeholder="student@college.edu or name@gmail.com"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#0a66c2]/20 focus:border-[#0a66c2]"
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
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#0a66c2]/20 focus:border-[#0a66c2]"
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
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#0a66c2]/20 focus:border-[#0a66c2]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-2.5 px-4 bg-[#0a66c2] hover:bg-[#004182] text-white font-bold text-sm rounded-full shadow-xs transition-colors cursor-pointer"
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
