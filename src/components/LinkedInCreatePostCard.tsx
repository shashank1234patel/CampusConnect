import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Video, 
  Image as ImageIcon, 
  FileText, 
  Calendar,
  X,
  Sparkles,
  Send,
  ShieldCheck
} from 'lucide-react';

interface LinkedInCreatePostCardProps {
  onHostEventClick?: () => void;
}

export const LinkedInCreatePostCard: React.FC<LinkedInCreatePostCardProps> = ({
  onHostEventClick
}) => {
  const { currentUser, createPost, events } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [selectedEventId, setSelectedEventId] = useState<string>('');

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim()) return;
    createPost(postContent.trim(), selectedEventId ? 'event' : undefined, selectedEventId || undefined);
    setPostContent('');
    setSelectedEventId('');
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="bg-white rounded-lg border border-slate-200/90 shadow-2xs p-3 sm:p-4">
        {/* Top Row: Avatar + Pill input */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center shrink-0 border border-slate-200 shadow-2xs">
            {currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).join('') : 'SP'}
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex-1 text-left px-4 py-3 rounded-full border border-slate-300 hover:bg-slate-100/70 text-slate-500 text-xs sm:text-sm font-semibold transition-colors focus:outline-none"
          >
            Start a post
          </button>
        </div>

        {/* Bottom Row: Actions from screenshot (Video, Photo, Write article, Event) */}
        <div className="flex items-center justify-between sm:justify-around pt-3 mt-2 border-t border-slate-100 text-xs font-semibold text-slate-600">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-slate-100 transition-colors"
          >
            <Video className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">Video</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-slate-100 transition-colors"
          >
            <ImageIcon className="w-4 h-4 text-sky-600" />
            <span className="hidden sm:inline">Photo</span>
          </button>

          <button
            onClick={onHostEventClick}
            className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-slate-100 transition-colors text-indigo-700"
          >
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span>Event</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-slate-100 transition-colors"
          >
            <FileText className="w-4 h-4 text-amber-700" />
            <span className="hidden sm:inline">Write article</span>
          </button>
        </div>
      </div>

      {/* Create Post Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-2xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-xs">
                  {currentUser?.name.charAt(0) || 'S'}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{currentUser?.name}</h4>
                  <span className="text-[11px] text-slate-500 block">Post to Anyone on Campus</span>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handlePostSubmit} className="p-4 space-y-3">
              <textarea
                placeholder="What do you want to talk about? (e.g. hackathon victory, running marathon, or technical project)"
                rows={5}
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                className="w-full text-sm text-slate-800 placeholder:text-slate-400 border-none focus:outline-none resize-none leading-relaxed"
                autoFocus
              />

              {/* Optional Attach Campus Event */}
              <div className="pt-2 border-t border-slate-100">
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                  Attach Campus Event (Optional):
                </label>
                <select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-[#0a66c2]"
                >
                  <option value="">None (Standard post)</option>
                  {events.map((evt) => (
                    <option key={evt.id} value={evt.id}>
                      {evt.title} ({evt.category} - {evt.date})
                    </option>
                  ))}
                </select>
              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-500 text-xs">
                  <span className="flex items-center gap-1 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#0a66c2]" />
                    Verified Student Post
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-full"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!postContent.trim()}
                    className="px-4 py-1.5 text-xs font-bold text-white bg-[#0a66c2] disabled:opacity-50 hover:bg-[#004182] rounded-full shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Post</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
