import React, { useState } from 'react';
import { CampusPost, CampusEvent } from '../types';
import { useApp } from '../context/AppContext';
import { 
  ThumbsUp, 
  MessageSquare, 
  Repeat2, 
  Send, 
  MoreHorizontal, 
  X, 
  ShieldCheck, 
  Calendar, 
  MapPin, 
  Clock, 
  Ticket, 
  ArrowRight,
  Flame,
  Award,
  Share2,
  Check
} from 'lucide-react';

interface LinkedInPostCardProps {
  post: CampusPost;
  onRegisterEvent?: (event: CampusEvent) => void;
  onViewEventDetails?: (event: CampusEvent) => void;
}

export const LinkedInPostCard: React.FC<LinkedInPostCardProps> = ({
  post,
  onRegisterEvent,
  onViewEventDetails
}) => {
  const { events, likePost, addComment, currentUser } = useApp();
  const [showFullText, setShowFullText] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // If post is linked to an event, find it
  const linkedEvent = post.eventId ? events.find(e => e.id === post.eventId) : undefined;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    addComment(post.id, commentInput.trim());
    setCommentInput('');
  };

  const shouldTruncate = post.content.length > 140 && !showFullText;
  const displayedContent = shouldTruncate ? post.content.slice(0, 140) + '...' : post.content;

  return (
    <article className="bg-white rounded-lg border border-slate-200/90 shadow-2xs overflow-hidden transition-shadow hover:shadow-xs">
      {/* Post Author Header */}
      <div className="p-3 sm:p-4 pb-2 flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          {/* Author Avatar */}
          <div className="w-11 h-11 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center shrink-0 border border-slate-200 shadow-2xs overflow-hidden">
            {post.authorName === 'Guruprasad Limkar' ? (
              <div className="w-full h-full bg-gradient-to-tr from-slate-900 to-indigo-900 flex items-center justify-center text-sm font-bold text-amber-200">
                GL
              </div>
            ) : post.authorName === 'Shashank Patel' ? (
              <div className="w-full h-full bg-gradient-to-tr from-indigo-700 to-slate-900 flex items-center justify-center text-sm font-bold text-white">
                SP
              </div>
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-purple-700 to-indigo-800 flex items-center justify-center text-sm font-bold text-white">
                {post.authorName.charAt(0)}
              </div>
            )}
          </div>

          {/* Author Details */}
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-slate-900 text-sm hover:text-[#0a66c2] hover:underline cursor-pointer">
                {post.authorName}
              </span>
              {post.isVerified && (
                <span title="Verified Campus Member">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#0a66c2] shrink-0" />
                </span>
              )}
              {post.connectionDegree && (
                <span className="text-[11px] text-slate-500 font-normal">
                  · {post.connectionDegree}
                </span>
              )}
            </div>

            <p className="text-[11px] text-slate-600 line-clamp-1 leading-tight mt-0.5">
              {post.authorHeadline}
            </p>

            <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
              <span>{post.createdAt}</span>
              <span>·</span>
              <span title="Shared publicly with college campus">🌐</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 text-slate-500">
          <button 
            onClick={handleShare}
            className="p-1.5 rounded-full hover:bg-slate-100 transition-colors"
            title="Share post link"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <MoreHorizontal className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Post Text Body */}
      <div className="px-3 sm:px-4 py-1.5 text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line font-normal">
        {displayedContent}
        {shouldTruncate && (
          <button
            onClick={() => setShowFullText(true)}
            className="text-slate-500 hover:text-[#0a66c2] font-semibold ml-1 cursor-pointer"
          >
            ...more
          </button>
        )}
      </div>

      {/* Post Media: Indian Air Force Day Marathon Run (Recreation from user screenshot) */}
      {post.mediaType === 'iaf-marathon' && (
        <div className="mt-2.5 bg-slate-950 text-white relative overflow-hidden border-y border-slate-900">
          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-800">
            {/* Left Box: Running Strava Infographic */}
            <div className="p-4 sm:p-5 bg-gradient-to-br from-amber-950/70 via-slate-950 to-orange-950/60 flex flex-col justify-between min-h-[220px] relative">
              <div className="absolute top-3 right-3 text-right">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-orange-600 text-white uppercase tracking-wider">
                  STRAVA
                </span>
              </div>

              <div>
                <p className="text-[11px] font-semibold text-orange-400 tracking-wider uppercase flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-orange-400" />
                  <span>Bengaluru Circuit</span>
                </p>
                <h4 className="text-xl sm:text-2xl font-black text-amber-100 tracking-tight mt-1 italic font-serif">
                  Same Roads<br />
                  <span className="text-orange-500">Bigger Dreams</span>
                </h4>
              </div>

              {/* Running Route Vector Visual */}
              <div className="my-3 py-2 flex items-center justify-center">
                <svg className="w-36 h-20 text-orange-400 drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]" viewBox="0 0 160 90" fill="none">
                  <path 
                    d="M 15 45 C 30 15, 60 10, 80 35 C 100 60, 130 20, 145 50 C 130 80, 85 85, 55 70 Z" 
                    stroke="currentColor" 
                    strokeWidth="3.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                  />
                  <circle cx="15" cy="45" r="4.5" fill="#22c55e" />
                  <circle cx="145" cy="50" r="4.5" fill="#ef4444" />
                </svg>
              </div>

              {/* Stats Strip */}
              <div className="grid grid-cols-4 gap-1 pt-2 border-t border-slate-800 text-center font-mono">
                <div>
                  <span className="text-[9px] text-slate-400 block uppercase">Distance</span>
                  <span className="text-xs sm:text-sm font-bold text-white">7.31 km</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block uppercase">Moving Time</span>
                  <span className="text-xs sm:text-sm font-bold text-white">41:26</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block uppercase">Avg Pace</span>
                  <span className="text-xs sm:text-sm font-bold text-white">5:40 /km</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block uppercase">Elevation</span>
                  <span className="text-xs sm:text-sm font-bold text-white">55 m</span>
                </div>
              </div>
            </div>

            {/* Right Box: Medal & Finisher Certificate Simulation */}
            <div className="p-4 sm:p-5 bg-slate-900 flex flex-col justify-between items-center text-center relative">
              <div className="w-full flex justify-between items-center text-[10px] text-slate-400">
                <span className="font-semibold text-amber-400">INDIAN AIR FORCE DAY</span>
                <span>OCTOBER 2026</span>
              </div>

              <div className="my-3 flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-700 p-1 shadow-lg shadow-amber-500/20 flex items-center justify-center">
                  <div className="w-full h-full rounded-full bg-slate-950 flex flex-col items-center justify-center text-amber-300 border border-amber-400/50 p-1">
                    <Award className="w-7 h-7 text-amber-400 animate-pulse" />
                    <span className="text-[8px] font-bold uppercase tracking-widest mt-0.5">Finisher</span>
                  </div>
                </div>
                <p className="text-xs font-bold text-white mt-2">Finisher Medal Honor</p>
                <p className="text-[10px] text-slate-400">Awarded for completing official 7.3K Run</p>
              </div>

              <div className="w-full bg-slate-950/80 p-2 rounded border border-slate-800 text-[11px] text-slate-300">
                🎖️ &ldquo;Honour to receive this wonderful gift from INDIAN AIR FORCE 🫡🇮🇳&rdquo;
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Linked Campus Event Card (Connected to Supabase) */}
      {linkedEvent && (
        <div className="m-3 sm:m-4 p-3.5 bg-gradient-to-r from-indigo-50/70 to-blue-50/70 border border-indigo-200/80 rounded-xl space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded">
                {linkedEvent.category}
              </span>
              <h4 className="text-sm sm:text-base font-bold text-slate-900 mt-1.5">
                {linkedEvent.title}
              </h4>
              <p className="text-xs text-slate-600 line-clamp-2 mt-0.5">
                {linkedEvent.description}
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded block">
                {linkedEvent.fee === 0 ? 'FREE ENTRY' : `₹${linkedEvent.fee}`}
              </span>
              <span className="text-[10px] text-slate-500 mt-1 block">
                {linkedEvent.maxParticipants - linkedEvent.registeredCount} seats left
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-1 border-t border-indigo-100">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              {linkedEvent.date}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              {linkedEvent.startTime}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-indigo-600" />
              {linkedEvent.venue}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 pt-1">
            <button
              onClick={() => onViewEventDetails && onViewEventDetails(linkedEvent)}
              className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 transition-colors"
            >
              View Event Syllabus & Details &rarr;
            </button>
            <button
              onClick={() => onRegisterEvent && onRegisterEvent(linkedEvent)}
              className="px-3.5 py-1.5 bg-[#0a66c2] hover:bg-[#004182] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>Get Digital Pass</span>
            </button>
          </div>
        </div>
      )}

      {/* Reactions Count Bar */}
      <div className="px-3 sm:px-4 py-1.5 flex items-center justify-between text-xs text-slate-500 border-b border-slate-100">
        <div className="flex items-center gap-1">
          <span className="flex items-center justify-center w-4 h-4 rounded-full bg-[#0a66c2] text-white text-[9px]">
            👍
          </span>
          <span className="flex items-center justify-center w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] -ml-2">
            ❤️
          </span>
          <span className="ml-1 text-[11px] font-medium text-slate-600">
            {post.likes}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <button 
            onClick={() => setShowComments(!showComments)}
            className="hover:text-[#0a66c2] hover:underline"
          >
            {post.commentsCount} comments
          </button>
          <span>·</span>
          <span>{post.repostsCount} reposts</span>
        </div>
      </div>

      {/* Interactive Action Bar (Like, Comment, Repost, Send) */}
      <div className="px-1 py-1 grid grid-cols-4 gap-1 text-slate-600 font-semibold text-xs">
        <button
          onClick={() => likePost(post.id)}
          className={`py-2 px-1 flex items-center justify-center gap-1.5 rounded hover:bg-slate-100 transition-colors ${
            post.isLiked ? 'text-[#0a66c2]' : 'text-slate-600'
          }`}
        >
          <ThumbsUp className={`w-4 h-4 ${post.isLiked ? 'fill-[#0a66c2]' : ''}`} />
          <span className="hidden sm:inline">Like</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="py-2 px-1 flex items-center justify-center gap-1.5 rounded hover:bg-slate-100 transition-colors"
        >
          <MessageSquare className="w-4 h-4" />
          <span className="hidden sm:inline">Comment</span>
        </button>

        <button
          onClick={() => {
            alert('Reposted to your campus network feed!');
          }}
          className="py-2 px-1 flex items-center justify-center gap-1.5 rounded hover:bg-slate-100 transition-colors"
        >
          <Repeat2 className="w-4 h-4" />
          <span className="hidden sm:inline">Repost</span>
        </button>

        <button
          onClick={handleShare}
          className="py-2 px-1 flex items-center justify-center gap-1.5 rounded hover:bg-slate-100 transition-colors"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="px-3 sm:px-4 py-3 bg-slate-50 border-t border-slate-100 space-y-3">
          {/* Comment Input */}
          <form onSubmit={handleCommentSubmit} className="flex gap-2">
            <div className="w-7 h-7 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center shrink-0">
              {currentUser?.name.charAt(0) || 'S'}
            </div>
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                placeholder="Add a comment on this campus post..."
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-full focus:outline-[#0a66c2] focus:border-[#0a66c2]"
              />
              <button
                type="submit"
                disabled={!commentInput.trim()}
                className="px-3 py-1 text-xs font-semibold bg-[#0a66c2] disabled:opacity-50 text-white rounded-full hover:bg-[#004182] transition-colors"
              >
                Post
              </button>
            </div>
          </form>

          {/* Existing Comments */}
          {post.comments && post.comments.length > 0 && (
            <div className="space-y-2 pt-2">
              {post.comments.map((comment) => (
                <div key={comment.id} className="flex items-start gap-2 text-xs">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    {comment.authorName.charAt(0)}
                  </div>
                  <div className="flex-1 bg-white p-2.5 rounded-xl border border-slate-200/80">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900">{comment.authorName}</span>
                      <span className="text-[10px] text-slate-400">{comment.timestamp}</span>
                    </div>
                    <p className="text-[10px] text-slate-500">{comment.authorHeadline}</p>
                    <p className="text-slate-800 mt-1 leading-snug">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </article>
  );
};
