import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { 
  getSupabaseUrl, 
  getSupabaseAnonKey, 
  saveSupabaseAnonKey, 
  isSupabaseConfigured,
  getSyncMode,
  setSyncMode
} from '../lib/supabase';
import { supabaseService } from '../services/supabaseService';
import { 
  X, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Terminal, 
  Play, 
  Database,
  ExternalLink,
  Copy,
  Key,
  ShieldCheck,
  Check,
  Server,
  UploadCloud,
  Send,
  Info,
  Radio
} from 'lucide-react';

interface ApiInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiInspectorModal: React.FC<ApiInspectorModalProps> = ({ isOpen, onClose }) => {
  const { apiLogs, currentUser, events } = useApp();
  const [activeTab, setActiveTab] = useState<'supabase' | 'endpoints' | 'logs'>('supabase');
  
  // Supabase connection state
  const [anonKeyInput, setAnonKeyInput] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [testResult, setTestResult] = useState<{
    tested: boolean;
    success: boolean;
    message: string;
    count?: number;
    data?: any;
  } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  // Live Data Insertion Test state
  const [testInsertTitle, setTestInsertTitle] = useState('Campus Hackathon 2026');
  const [isInserting, setIsInserting] = useState(false);
  const [isInsertingReg, setIsInsertingReg] = useState(false);
  const [syncTarget, setSyncTarget] = useState<'supabase' | 'local'>(() => getSyncMode());
  const [insertResult, setInsertResult] = useState<{
    tested: boolean;
    success: boolean;
    message: string;
    details?: string;
    insertedData?: any;
    httpCode?: number;
  } | null>(null);

  const handleSelectSyncTarget = (mode: 'supabase' | 'local') => {
    setSyncMode(mode);
    setSyncTarget(mode);
  };


  // Endpoint testing state
  const [activeTestResponse, setActiveTestResponse] = useState<{
    endpoint: string;
    method: string;
    status: number;
    data: any;
  } | null>(null);
  const [testingEndpoint, setTestingEndpoint] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setAnonKeyInput(getSupabaseAnonKey());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const sampleEventId = events[0]?.id || 'event-1';
  const supabaseUrl = getSupabaseUrl();
  const configured = isSupabaseConfigured();

  const handleSaveKey = () => {
    saveSupabaseAnonKey(anonKeyInput);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
    handleTestSupabase();
  };

  const handleTestSupabase = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await supabaseService.testConnection();
      if (res.connected) {
        // Also fetch sample data
        const sampleEvents = await supabaseService.getEvents();
        setTestResult({
          tested: true,
          success: true,
          message: `Connected successfully! Found ${res.eventsCount ?? 0} events in table "events".`,
          count: res.eventsCount,
          data: sampleEvents,
        });
      } else {
        setTestResult({
          tested: true,
          success: false,
          message: res.error || 'Connection failed',
          data: res.details,
        });
      }
    } catch (e: any) {
      setTestResult({
        tested: true,
        success: false,
        message: e.message || 'Error executing Supabase query',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleTestInsert = async () => {
    setIsInserting(true);
    setInsertResult(null);
    try {
      const res = await supabaseService.insertTestDataToSupabase(testInsertTitle);
      setInsertResult({
        tested: true,
        success: res.success,
        message: res.message,
        details: res.details,
        insertedData: res.insertedData,
        httpCode: res.httpCode,
      });
    } catch (err: any) {
      setInsertResult({
        tested: true,
        success: false,
        message: err.message || 'Error executing Supabase insertion check',
        details: String(err),
      });
    } finally {
      setIsInserting(false);
    }
  };

  const handleTestRegistrationInsert = async () => {
    setIsInsertingReg(true);
    setInsertResult(null);
    try {
      const res = await supabaseService.insertTestRegistrationToSupabase(testInsertTitle);
      setInsertResult({
        tested: true,
        success: res.success,
        message: res.message,
        details: res.details,
        insertedData: res.insertedData,
        httpCode: res.httpCode,
      });
    } catch (err: any) {
      setInsertResult({
        tested: true,
        success: false,
        message: err.message || 'Error executing Supabase registration check',
        details: String(err),
      });
    } finally {
      setIsInsertingReg(false);
    }
  };


  const rlsSql = `-- Copy & run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/rerdtoiflkjczoftrbri/sql/new

-- 1. Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- 2. Allow public/anon read access to events
CREATE POLICY "Public events can be viewed by anyone" 
ON events FOR SELECT USING (true);

-- 3. Allow users to register for events
CREATE POLICY "Enable insert for registered users" 
ON registrations FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable select for registrations" 
ON registrations FOR SELECT USING (true);

-- 4. Sample Seed data (optional test event)
INSERT INTO users (id, email, role)
VALUES ('00000000-0000-0000-0000-000000000001', 'shashank1234patel@gmail.com', 'admin')
ON CONFLICT (id) DO NOTHING;

INSERT INTO events (id, organiser_id, title, capacity, timestamp)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000001',
  'Inter-College Hackathon 2026',
  150,
  NOW() + INTERVAL '5 days'
) ON CONFLICT (id) DO NOTHING;`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(rlsSql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const endpoints = [
    {
      method: 'GET',
      endpoint: '/api/events',
      desc: 'Browse events.',
      testAction: async () => {
        setTestingEndpoint('/api/events');
        try {
          const res = await api.getEvents();
          setActiveTestResponse({
            endpoint: '/api/events',
            method: 'GET',
            status: 200,
            data: res.slice(0, 3),
          });
        } catch (e) {
          setActiveTestResponse({
            endpoint: '/api/events',
            method: 'GET',
            status: 500,
            data: { error: String(e) },
          });
        }
        setTestingEndpoint(null);
      },
    },
    {
      method: 'GET',
      endpoint: `/api/events/${sampleEventId}`,
      desc: 'Event details.',
      testAction: async () => {
        setTestingEndpoint(`/api/events/${sampleEventId}`);
        try {
          const res = await api.getEventById(sampleEventId);
          setActiveTestResponse({
            endpoint: `/api/events/${sampleEventId}`,
            method: 'GET',
            status: 200,
            data: res,
          });
        } catch (e) {
          setActiveTestResponse({
            endpoint: `/api/events/${sampleEventId}`,
            method: 'GET',
            status: 404,
            data: { error: String(e) },
          });
        }
        setTestingEndpoint(null);
      },
    },
    {
      method: 'POST',
      endpoint: '/api/registrations',
      desc: 'Create registration, 201 or 409.',
      testAction: async () => {
        setTestingEndpoint('/api/registrations');
        try {
          const res = await api.createRegistration({
            eventId: sampleEventId,
            userName: currentUser?.name || 'Tester Student',
            userEmail: currentUser?.email || 'shashank1234patel@gmail.com',
            userPhone: '+91 98450 12345',
            userCollege: 'Bangalore Institute of Technology',
            userDept: 'CSE',
            userUsn: '1MS23CS108',
            userId: currentUser?.id || 'user-student-1',
          });
          setActiveTestResponse({
            endpoint: '/api/registrations',
            method: 'POST',
            status: res.status,
            data: res,
          });
        } catch (e) {
          setActiveTestResponse({
            endpoint: '/api/registrations',
            method: 'POST',
            status: 500,
            data: { error: String(e) },
          });
        }
        setTestingEndpoint(null);
      },
    },
    {
      method: 'GET',
      endpoint: '/api/me/registrations',
      desc: "Current user's registrations.",
      testAction: async () => {
        setTestingEndpoint('/api/me/registrations');
        try {
          const res = await api.getMyRegistrations(
            currentUser?.email || 'shashank1234patel@gmail.com',
            currentUser?.id || 'user-student-1'
          );
          setActiveTestResponse({
            endpoint: '/api/me/registrations',
            method: 'GET',
            status: 200,
            data: res,
          });
        } catch (e) {
          setActiveTestResponse({
            endpoint: '/api/me/registrations',
            method: 'GET',
            status: 400,
            data: { error: String(e) },
          });
        }
        setTestingEndpoint(null);
      },
    },
    {
      method: 'GET',
      endpoint: `/api/events/${sampleEventId}/registrations`,
      desc: 'Attendee list, owning organizer only.',
      testAction: async () => {
        setTestingEndpoint(`/api/events/${sampleEventId}/registrations`);
        try {
          const res = await api.getEventRegistrations(
            sampleEventId,
            currentUser?.id || 'user-student-1',
            currentUser?.role || 'student'
          );
          setActiveTestResponse({
            endpoint: `/api/events/${sampleEventId}/registrations`,
            method: 'GET',
            status: res.status,
            data: res,
          });
        } catch (e) {
          setActiveTestResponse({
            endpoint: `/api/events/${sampleEventId}/registrations`,
            method: 'GET',
            status: 403,
            data: { error: String(e) },
          });
        }
        setTestingEndpoint(null);
      },
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  Supabase & REST API Inspector
                </h2>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                  configured 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${configured ? 'bg-emerald-600 animate-pulse' : 'bg-amber-600'}`} />
                  {configured ? 'Supabase Connected' : 'Anon Key Needed'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Connected to project <code className="font-mono text-indigo-600 font-semibold">rerdtoiflkjczoftrbri</code>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-200 bg-slate-50/40 flex items-center gap-1">
          <button
            onClick={() => setActiveTab('supabase')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'supabase'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            Supabase Backend Connection
          </button>
          <button
            onClick={() => setActiveTab('endpoints')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'endpoints'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            REST Endpoints (5 Spec APIs)
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'logs'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Traffic Logs ({apiLogs.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'supabase' && (
            <div className="space-y-6">
              {/* Project Details Banner */}
              <div className="p-4 rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    Supabase Project: vishu777patel@gmail.com's Project
                  </div>
                  <div className="mt-1 text-xs text-indigo-700/80 font-mono">
                    URL: <span className="font-semibold">{supabaseUrl}</span>
                  </div>
                </div>

                <a
                  href="https://supabase.com/dashboard/project/rerdtoiflkjczoftrbri/settings/api"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 shrink-0 shadow-xs"
                >
                  <span>Open Supabase API Keys</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Paste Anon Key */}
              <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <Key className="w-3.5 h-3.5 text-emerald-600" />
                    Supabase Anon Public API Key (Project Anon Key)
                  </label>
                  <span className="text-[11px] text-slate-500">
                    Found in: <strong className="text-slate-700">Project Settings → API</strong>
                  </span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="password"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={anonKeyInput}
                    onChange={(e) => setAnonKeyInput(e.target.value)}
                    className="flex-1 px-3.5 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50"
                  />
                  <button
                    onClick={handleSaveKey}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors shrink-0"
                  >
                    {isSaved ? <Check className="w-3.5 h-3.5" /> : <Database className="w-3.5 h-3.5" />}
                    <span>{isSaved ? 'Saved!' : 'Save & Connect'}</span>
                  </button>
                  <button
                    onClick={handleTestSupabase}
                    disabled={isTesting}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors shrink-0 disabled:opacity-50"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>{isTesting ? 'Testing...' : 'Test Query'}</span>
                  </button>
                </div>

                <p className="text-[11px] text-slate-500">
                  Tip: You can also set <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-700">VITE_SUPABASE_ANON_KEY="..."</code> in your project's <code className="bg-slate-100 px-1 py-0.5 rounded">.env</code> file.
                </p>

                {/* Test Result Callout */}
                {testResult && (
                  <div className={`p-3.5 rounded-lg border text-xs font-mono mt-3 ${
                    testResult.success
                      ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50/80 border-rose-200 text-rose-900'
                  }`}>
                    <div className="flex items-center gap-2 font-bold mb-1">
                      {testResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
                      <span>{testResult.message}</span>
                    </div>
                    {testResult.data && (
                      <pre className="mt-2 text-[10px] bg-slate-900 text-emerald-300 p-2.5 rounded overflow-x-auto max-h-32">
                        {JSON.stringify(testResult.data, null, 2)}
                      </pre>
                    )}
                  </div>
                )}
              </div>

              {/* Live Data Insertion & Verification Check */}
              <div className="p-5 rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/40 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-100/80 pb-3">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <UploadCloud className="w-4 h-4 text-indigo-600" />
                      Live Data Insertion & Connectivity Test
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Verify whether data submitted on this website actually reaches your Supabase database or stays in local memory.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-slate-500">Target Database:</span>
                    <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full font-bold flex items-center gap-1.5 ${
                      configured 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${configured ? 'bg-emerald-600' : 'bg-amber-600'}`} />
                      {configured ? 'Supabase Connected' : 'Website Local Memory'}
                    </span>
                  </div>
                </div>

                {/* Status Comparison Cards - Selectable by User */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Select Website Sync Target (Click to Choose Mode):
                    </span>
                    <span className="text-[11px] text-indigo-700 font-semibold">
                      {syncTarget === 'supabase' ? '● Supabase Sync Active' : '○ Local Memory Only'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {/* Card 1: Website Live Supabase Sync */}
                    <button
                      type="button"
                      onClick={() => handleSelectSyncTarget('supabase')}
                      className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                        syncTarget === 'supabase'
                          ? 'border-indigo-600 bg-indigo-50/90 shadow-xs ring-2 ring-indigo-500/30'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold text-slate-900 mb-1.5">
                        <span className="flex items-center gap-1.5">
                          <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                            syncTarget === 'supabase'
                              ? 'border-indigo-600 bg-indigo-600 text-white'
                              : 'border-slate-400 bg-white'
                          }`}>
                            {syncTarget === 'supabase' && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </span>
                          1. Website State: Live Supabase Sync
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          configured 
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}>
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          {configured ? 'Selected & Ready' : 'Key Needed'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-700 leading-relaxed">
                        <strong className="text-indigo-900 font-semibold">Active: </strong>
                        When users register for events or hosts create events on the website, submissions write directly into Supabase tables (<span className="font-mono text-purple-700 font-semibold">registrations</span>, <span className="font-mono text-blue-700 font-semibold">events</span>, <span className="font-mono text-slate-700 font-semibold">users</span>).
                      </p>
                    </button>

                    {/* Card 2: Local Memory Sandbox */}
                    <button
                      type="button"
                      onClick={() => handleSelectSyncTarget('local')}
                      className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                        syncTarget === 'local'
                          ? 'border-slate-800 bg-slate-100 shadow-xs ring-2 ring-slate-400/30'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold text-slate-900 mb-1.5">
                        <span className="flex items-center gap-1.5">
                          <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                            syncTarget === 'local'
                              ? 'border-slate-800 bg-slate-800 text-white'
                              : 'border-slate-400 bg-white'
                          }`}>
                            {syncTarget === 'local' && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </span>
                          2. Local Memory Sandbox Only
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                          {syncTarget === 'local' ? 'Active' : 'Offline'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        Data submissions stay strictly in temporary browser session state and will not be pushed to Supabase tables.
                      </p>
                    </button>
                  </div>

                  {/* Active Selection Banner */}
                  <div className={`mt-2.5 p-2.5 rounded-lg border text-xs flex items-center gap-2 ${
                    syncTarget === 'supabase'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-slate-100 border-slate-200 text-slate-700'
                  }`}>
                    {syncTarget === 'supabase' ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>
                          <strong>Website Status Selected: Direct Supabase Cloud Sync Active.</strong> Any registration or new event on the website will update directly to your Supabase tables.
                        </span>
                      </>
                    ) : (
                      <>
                        <Info className="w-4 h-4 text-slate-500 shrink-0" />
                        <span>
                          <strong>Website Status Selected: Local Memory Sandbox.</strong> Click Card 1 above to switch to live Supabase database sync.
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Live Put Data Input & Action (Event & Registration tests) */}
                <div className="pt-2">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Test Payload: Event Title to Insert & Verify
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={testInsertTitle}
                      onChange={(e) => setTestInsertTitle(e.target.value)}
                      placeholder="e.g. National Hackathon 2026"
                      className="flex-1 px-3.5 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                    />
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={handleTestInsert}
                        disabled={isInserting || isInsertingReg}
                        className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{isInserting ? 'Writing...' : 'Put Event to Supabase'}</span>
                      </button>

                      <button
                        onClick={handleTestRegistrationInsert}
                        disabled={isInserting || isInsertingReg}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isInsertingReg ? 'Registering...' : 'Put Registration to Supabase'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Live Test Insertion Result */}
                {insertResult && (
                  <div className={`p-3.5 rounded-lg border text-xs font-mono mt-3 ${
                    insertResult.success
                      ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
                      : 'bg-rose-50/90 border-rose-300 text-rose-950'
                  }`}>
                    <div className="flex items-start gap-2">
                      {insertResult.success ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      )}
                      <div className="space-y-1 w-full">
                        <div className="font-bold flex items-center justify-between">
                          <span>{insertResult.message}</span>
                          {insertResult.httpCode && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/80 border font-mono">
                              HTTP {insertResult.httpCode}
                            </span>
                          )}
                        </div>
                        {insertResult.details && (
                          <p className="text-[11px] text-slate-700 font-sans mt-1">
                            {insertResult.details}
                          </p>
                        )}
                        {insertResult.insertedData && (
                          <div className="mt-2">
                            <span className="text-[10px] font-bold text-slate-600 block mb-0.5">Persisted Supabase Row:</span>
                            <pre className="text-[10px] bg-slate-900 text-emerald-300 p-2.5 rounded overflow-x-auto max-h-32">
                              {JSON.stringify(insertResult.insertedData, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>


              {/* Table Schema Visualizer (Matching User's Screenshot) */}
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Database className="w-4 h-4 text-indigo-600" />
                  Your Supabase Schema Tables (Auto-Mapped)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* users table */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
                      <span className="font-bold text-xs text-slate-900 font-mono">users</span>
                      <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-mono">3 cols</span>
                    </div>
                    <ul className="space-y-1 text-[11px] font-mono text-slate-600">
                      <li className="flex justify-between"><span>id</span> <span className="text-purple-600">uuid (PK)</span></li>
                      <li className="flex justify-between"><span>email</span> <span className="text-blue-600">text</span></li>
                      <li className="flex justify-between"><span>role</span> <span className="text-blue-600">text</span></li>
                    </ul>
                  </div>

                  {/* events table */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
                      <span className="font-bold text-xs text-slate-900 font-mono">events</span>
                      <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-mono">5 cols</span>
                    </div>
                    <ul className="space-y-1 text-[11px] font-mono text-slate-600">
                      <li className="flex justify-between"><span>id</span> <span className="text-purple-600">uuid (PK)</span></li>
                      <li className="flex justify-between"><span>organiser_id</span> <span className="text-indigo-600">uuid (FK)</span></li>
                      <li className="flex justify-between"><span>title</span> <span className="text-blue-600">text</span></li>
                      <li className="flex justify-between"><span>capacity</span> <span className="text-amber-600">int4</span></li>
                      <li className="flex justify-between"><span>timestamp</span> <span className="text-emerald-600">timestamptz</span></li>
                    </ul>
                  </div>

                  {/* registrations table */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
                      <span className="font-bold text-xs text-slate-900 font-mono">registrations</span>
                      <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-mono">4 cols</span>
                    </div>
                    <ul className="space-y-1 text-[11px] font-mono text-slate-600">
                      <li className="flex justify-between"><span>id</span> <span className="text-purple-600">uuid (PK)</span></li>
                      <li className="flex justify-between"><span>user_id</span> <span className="text-indigo-600">uuid (FK)</span></li>
                      <li className="flex justify-between"><span>event_id</span> <span className="text-indigo-600">uuid (FK)</span></li>
                      <li className="flex justify-between"><span>created_id</span> <span className="text-emerald-600">timestamptz</span></li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* RLS Policies SQL Runner Guide */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-900 text-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-200 flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    Supabase SQL Editor: Row Level Security (RLS) Setup
                  </div>
                  <button
                    onClick={handleCopySql}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs flex items-center gap-1 font-semibold transition-colors"
                  >
                    {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSql ? 'Copied SQL!' : 'Copy SQL'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Run this in your Supabase SQL Editor so the frontend can query events and create registrations:
                </p>
                <pre className="text-[11px] font-mono text-emerald-300 bg-slate-950 p-3 rounded-lg overflow-x-auto max-h-36 leading-relaxed">
                  {rlsSql}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'endpoints' && (
            <div className="space-y-6">
              {/* Endpoints Table exactly matching user's spec image */}
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-indigo-600" />
                  REST API Endpoints Specification
                </h3>

                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-indigo-50/60 text-slate-700 font-bold border-b border-indigo-100">
                      <tr>
                        <th className="px-4 py-3">Method</th>
                        <th className="px-4 py-3">Endpoint</th>
                        <th className="px-4 py-3">Description</th>
                        <th className="px-4 py-3 text-right">Interactive Test</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {endpoints.map((ep, idx) => {
                        const isPost = ep.method === 'POST';
                        return (
                          <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-4 py-3">
                              <span className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                                isPost ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                              }`}>
                                {ep.method}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-mono font-semibold text-indigo-700">
                              {ep.endpoint}
                            </td>
                            <td className="px-4 py-3 text-slate-700 font-medium">
                              {ep.desc}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={ep.testAction}
                                disabled={testingEndpoint !== null}
                                className="px-3 py-1 bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700 font-semibold rounded text-[11px] transition-colors inline-flex items-center gap-1 shadow-2xs disabled:opacity-50"
                              >
                                <Play className="w-3 h-3" />
                                <span>{testingEndpoint === ep.endpoint ? 'Sending...' : 'Test'}</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Interactive Live Test Output */}
              {activeTestResponse && (
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-900 text-slate-100 space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        activeTestResponse.method === 'POST' ? 'bg-purple-900 text-purple-200' : 'bg-blue-900 text-blue-200'
                      }`}>
                        {activeTestResponse.method}
                      </span>
                      <span className="text-slate-300">{activeTestResponse.endpoint}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                        activeTestResponse.status === 200 || activeTestResponse.status === 201
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : activeTestResponse.status === 409
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : 'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}>
                        HTTP {activeTestResponse.status}
                        {activeTestResponse.status === 201 && ' Created'}
                        {activeTestResponse.status === 409 && ' Conflict (Duplicate)'}
                        {activeTestResponse.status === 403 && ' Forbidden (Owning Organizer Only)'}
                        {activeTestResponse.status === 200 && ' OK'}
                      </span>
                      <button
                        onClick={() => setActiveTestResponse(null)}
                        className="text-slate-400 hover:text-slate-200 text-xs"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  <pre className="text-xs font-mono text-emerald-300 overflow-x-auto p-2 bg-slate-950 rounded max-h-48 leading-relaxed">
                    {JSON.stringify(activeTestResponse.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {activeTab === 'logs' && (
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  Live Frontend Request Stream
                </span>
                <span className="text-[11px] font-mono text-slate-400 font-normal">
                  {apiLogs.length} events logged
                </span>
              </h3>

              <div className="space-y-1.5 max-h-96 overflow-y-auto">
                {apiLogs.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
                    Perform an action like registering, exploring events, or testing an endpoint above to see real-time HTTP traffic.
                  </div>
                ) : (
                  apiLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          log.method === 'POST' ? 'bg-purple-100 text-purple-700' :
                          log.method === 'DELETE' ? 'bg-rose-100 text-rose-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {log.method}
                        </span>
                        <span className="font-mono text-slate-900 font-medium truncate max-w-xs">
                          {log.endpoint}
                        </span>
                        {log.details && (
                          <span className="text-slate-500 text-[11px] truncate max-w-sm hidden sm:inline">
                            — {log.details}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`font-mono font-bold text-[10px] px-1.5 py-0.5 rounded ${
                          log.status === 200 || log.status === 201 ? 'bg-emerald-100 text-emerald-700' :
                          log.status === 409 ? 'bg-amber-100 text-amber-700' :
                          'bg-rose-100 text-rose-700'
                        }`}>
                          {log.status}
                        </span>
                        <span className="text-slate-400 text-[10px] font-mono">
                          {log.timestamp}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Active Session: <strong className="text-slate-700">{currentUser?.name}</strong> ({currentUser?.role})</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-xs"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
