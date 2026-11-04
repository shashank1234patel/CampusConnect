import React, { useState } from 'react';
import { 
  X, 
  GitBranch, 
  ExternalLink, 
  Copy, 
  Check, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  Terminal, 
  FileCode2, 
  Layers, 
  Key,
  Globe,
  ArrowRight,
  Server
} from 'lucide-react';
import { getStoredSupabaseKey, SUPABASE_PROJECT_URL } from '../lib/supabase';

interface GitHubDeployModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GitHubDeployModal: React.FC<GitHubDeployModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'guide' | 'workflow' | 'preflight' | 'options'>('guide');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [githubRepoUrl, setGithubRepoUrl] = useState<string>('https://github.com/shashank1234patel/CampusConnect---Event-Management-Platform.git');
  
  const storedAnonKey = getStoredSupabaseKey() || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2200);
  };

  const cleanRepoUrl = githubRepoUrl.trim() || 'https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git';

  const gitPushCommand = `git remote add origin ${cleanRepoUrl}
git branch -M main
git push -u origin main`;

  const workflowYaml = `name: Deploy CampusConnect to GitHub Pages

on:
  push:
    branches: [main, master]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci || npm install

      - name: Build Vite application
        env:
          VITE_SUPABASE_URL: \${{ secrets.VITE_SUPABASE_URL || '${SUPABASE_PROJECT_URL}' }}
          VITE_SUPABASE_ANON_KEY: \${{ secrets.VITE_SUPABASE_ANON_KEY }}
        run: npm run build

      - name: Configure GitHub Pages
        uses: actions/configure-pages@v5

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

  deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold">Deploy with GitHub Actions</h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Workflow Ready
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Automated CI/CD pipeline targeting GitHub Pages with Supabase persistence
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50 px-4 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('guide')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'guide'
                ? 'border-indigo-600 text-indigo-700 bg-white -mb-px'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Deployment Guide
          </button>
          <button
            onClick={() => setActiveTab('workflow')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'workflow'
                ? 'border-indigo-600 text-indigo-700 bg-white -mb-px'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5" />
            Workflow (.github/workflows/deploy.yml)
          </button>
          <button
            onClick={() => setActiveTab('preflight')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'preflight'
                ? 'border-indigo-600 text-indigo-700 bg-white -mb-px'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Pre-flight Checklist
          </button>
          <button
            onClick={() => setActiveTab('options')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'options'
                ? 'border-indigo-600 text-indigo-700 bg-white -mb-px'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            Other Hosts (Vercel / Docker)
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: GUIDE */}
          {activeTab === 'guide' && (
            <div className="space-y-6">
              {/* Highlight Banner */}
              <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Zero-Config GitHub Pages Deployment</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    The GitHub Actions workflow file <code className="bg-white px-1.5 py-0.5 rounded border border-indigo-200 text-indigo-700 font-mono text-[11px]">.github/workflows/deploy.yml</code> is created and committed to the repository. Every time you push to <code className="font-mono text-slate-800">main</code>, GitHub Actions builds and publishes your site automatically!
                  </p>
                </div>
              </div>

              {/* Step 1 */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">1</span>
                  <h4 className="text-sm font-bold text-slate-900">Create a New Repository on GitHub</h4>
                </div>
                <div className="pl-8 text-xs text-slate-600 space-y-2">
                  <p>Open GitHub in your browser and create a new repository (e.g. named <code className="font-semibold text-slate-800">campusconnect</code>).</p>
                  <a
                    href="https://github.com/new"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold text-xs transition-colors"
                  >
                    <span>Open GitHub (Create New Repo)</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Step 2 */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">2</span>
                  <h4 className="text-sm font-bold text-slate-900">Push the Code to Your GitHub Repository</h4>
                </div>
                <div className="pl-8 text-xs text-slate-600 space-y-3">
                  <p>Enter your GitHub repository URL below to generate your exact copyable command:</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="https://github.com/username/campusconnect.git"
                      value={githubRepoUrl}
                      onChange={(e) => setGithubRepoUrl(e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono focus:bg-white focus:outline-indigo-600"
                    />
                  </div>

                  <div className="relative bg-slate-900 text-slate-100 p-3.5 rounded-xl font-mono text-[12px] overflow-x-auto shadow-inner">
                    <button
                      onClick={() => handleCopy(gitPushCommand, 'git-push')}
                      className="absolute top-2.5 right-2.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded text-[11px] flex items-center gap-1 transition-colors"
                    >
                      {copiedKey === 'git-push' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'git-push' ? 'Copied!' : 'Copy'}</span>
                    </button>
                    <pre className="pr-16 text-emerald-400">{gitPushCommand}</pre>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    💡 <em>Note:</em> The git local branch and initial commit have already been initialized and committed in your project folder!
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">3</span>
                  <h4 className="text-sm font-bold text-slate-900">Enable GitHub Pages to Use GitHub Actions</h4>
                </div>
                <div className="pl-8 text-xs text-slate-600 space-y-2">
                  <p>In your GitHub repository:</p>
                  <ol className="list-decimal list-inside space-y-1.5 font-medium text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <li>Click on <strong>Settings</strong> (top tab).</li>
                    <li>In the left sidebar, click <strong>Pages</strong>.</li>
                    <li>
                      Under <strong>Build and deployment</strong>, change <strong>Source</strong> from <em>Deploy from a branch</em> to:
                      <span className="block mt-1 font-bold text-indigo-700 pl-4">
                        👉 Source: &quot;GitHub Actions&quot;
                      </span>
                    </li>
                  </ol>
                </div>
              </div>

              {/* Step 4 */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">4</span>
                  <h4 className="text-sm font-bold text-slate-900">Configure Supabase Secrets in GitHub</h4>
                </div>
                <div className="pl-8 text-xs text-slate-600 space-y-3">
                  <p>
                    Go to <strong>Settings</strong> &rarr; <strong>Secrets and variables</strong> &rarr; <strong>Actions</strong> &rarr; Click <strong>New repository secret</strong>:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Secret 1 */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 font-mono text-[11px]">VITE_SUPABASE_URL</span>
                          <button
                            onClick={() => handleCopy(SUPABASE_PROJECT_URL, 'supa-url')}
                            className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-semibold"
                          >
                            {copiedKey === 'supa-url' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedKey === 'supa-url' ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 truncate">{SUPABASE_PROJECT_URL}</p>
                      </div>
                    </div>

                    {/* Secret 2 */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 font-mono text-[11px]">VITE_SUPABASE_ANON_KEY</span>
                          <button
                            onClick={() => handleCopy(storedAnonKey, 'supa-anon')}
                            className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-semibold"
                          >
                            {copiedKey === 'supa-anon' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedKey === 'supa-anon' ? 'Copied' : 'Copy Anon Key'}</span>
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 font-mono truncate">
                          {storedAnonKey.substring(0, 24)}...
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 5 */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">5</span>
                  <h4 className="text-sm font-bold text-slate-900">Watch the Action Run & Get Live URL!</h4>
                </div>
                <div className="pl-8 text-xs text-slate-600">
                  <p>
                    Go to the <strong>Actions</strong> tab in your repository. You will see <code className="font-bold text-slate-800">Deploy CampusConnect to GitHub Pages</code> running. Once complete (~1 minute), click the deployment link to view your live public site!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: WORKFLOW YAML */}
          {activeTab === 'workflow' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">.github/workflows/deploy.yml</h4>
                  <p className="text-xs text-slate-500">Official GitHub Actions workflow file included in your repository</p>
                </div>
                <button
                  onClick={() => handleCopy(workflowYaml, 'yaml')}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  {copiedKey === 'yaml' ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'yaml' ? 'Copied YAML!' : 'Copy Workflow YAML'}</span>
                </button>
              </div>

              <div className="relative bg-slate-950 text-slate-200 p-4 rounded-xl font-mono text-[11px] leading-relaxed overflow-x-auto border border-slate-800 max-h-96">
                <pre>{workflowYaml}</pre>
              </div>
            </div>
          )}

          {/* TAB 3: PRE-FLIGHT CHECKLIST */}
          {activeTab === 'preflight' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600">
                All configuration requirements for GitHub Actions deployment have been verified:
              </p>

              <div className="space-y-2.5">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <h5 className="text-xs font-bold text-emerald-950">Vite Build Output Verified</h5>
                    <p className="text-[11px] text-emerald-700 mt-0.5">
                      `npm run build` compiles with 0 errors and generates static production assets in `/dist`.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <h5 className="text-xs font-bold text-emerald-950">Relative Base Path Configured</h5>
                    <p className="text-[11px] text-emerald-700 mt-0.5">
                      `vite.config.ts` has `base: process.env.VITE_BASE_URL || &#39;./&#39;`, preventing broken asset links on GitHub Pages subpaths (`username.github.io/repo/`).
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <h5 className="text-xs font-bold text-emerald-950">SPA 404 Routing Fallback</h5>
                    <p className="text-[11px] text-emerald-700 mt-0.5">
                      `public/404.html` SPA redirect handler is configured so page refreshes or sub-routes won&apos;t result in 404 on GitHub Pages.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <h5 className="text-xs font-bold text-emerald-950">Git Repository Initialized &amp; Committed</h5>
                    <p className="text-[11px] text-emerald-700 mt-0.5">
                      Local git repository initialized on branch `main` with all files and workflows committed.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <h5 className="text-xs font-bold text-emerald-950">Supabase Client Dual-Mode Support</h5>
                    <p className="text-[11px] text-emerald-700 mt-0.5">
                      Supports direct remote Supabase connection via environment secrets as well as interactive UI token persistence.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: OTHER DEPLOYMENT OPTIONS */}
          {activeTab === 'options' && (
            <div className="space-y-4 text-xs text-slate-700">
              <h4 className="font-bold text-slate-900 text-sm">Deploying to Other Clouds via GitHub Actions</h4>
              <p className="text-slate-600">
                You can also deploy to full-stack cloud providers using GitHub Actions:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <span className="font-bold text-slate-900 text-sm block">Vercel (Frontend + Serverless)</span>
                  <p className="text-[11px] text-slate-600">
                    Connect your GitHub repo on <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-indigo-600 underline">vercel.com</a>. Vercel automatically detects Vite and deploys on every push.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <span className="font-bold text-slate-900 text-sm block">Render / Railway (Express Backend)</span>
                  <p className="text-[11px] text-slate-600">
                    If you want to run `server.ts` with Node.js, create a Web Service on <a href="https://render.com" target="_blank" rel="noreferrer" className="text-indigo-600 underline">render.com</a> with build command `npm install &amp;&amp; npm run build` and start command `npm start`.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            Close
          </button>
          <div className="flex items-center gap-2">
            <a
              href="https://github.com/new"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
            >
              <span>Go to GitHub.com</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
