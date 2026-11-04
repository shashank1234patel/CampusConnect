import React from 'react';
import { Download, Monitor, CheckCircle2, Terminal, FolderArchive, X } from 'lucide-react';

interface DownloadDesktopModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DownloadDesktopModal: React.FC<DownloadDesktopModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              <Monitor className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Save Project to Your Desktop</h3>
              <p className="text-xs text-slate-500">Download the complete source code bundle</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-start gap-3 text-xs text-indigo-900">
            <FolderArchive className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">CampusConnect_Project.zip</p>
              <p className="text-indigo-700 mt-0.5">
                Contains all React components, TypeScript models, Tailwind styles, and initial seed database.
              </p>
            </div>
          </div>

          {/* Quick steps */}
          <div className="space-y-3 text-xs text-slate-700">
            <p className="font-bold text-slate-900 text-sm">How to save and run on your Desktop:</p>
            
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-800 font-bold flex items-center justify-center text-[11px] shrink-0">1</span>
              <div>
                <strong>Download the zip:</strong> Click the button below to download <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-700">CampusConnect_Project.zip</code>.
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-800 font-bold flex items-center justify-center text-[11px] shrink-0">2</span>
              <div>
                <strong>Extract to Desktop:</strong> Move the downloaded zip file to your <strong>Desktop</strong>, right-click, and choose <em>"Extract All..."</em> (Windows) or double-click to unzip (Mac).
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-800 font-bold flex items-center justify-center text-[11px] shrink-0">3</span>
              <div>
                <strong>Run locally in Terminal:</strong>
                <div className="mt-1.5 p-2.5 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-lg space-y-1">
                  <p>npm install</p>
                  <p>npm run dev</p>
                </div>
              </div>
            </div>
          </div>

          {/* Download Button */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Close
            </button>

            <a
              href="/CampusConnect_Project.zip"
              download="CampusConnect_Project.zip"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download Zip to Desktop
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
