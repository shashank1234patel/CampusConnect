import React from 'react';
import { EventCategory } from '../types';
import { 
  Code2, 
  Wrench, 
  Laptop, 
  Music, 
  Trophy, 
  GraduationCap, 
  Flame, 
  Calendar,
  Sparkles
} from 'lucide-react';

interface EventPosterProps {
  title: string;
  category: EventCategory;
  posterTheme?: 'indigo' | 'purple' | 'blue' | 'emerald' | 'amber' | 'rose';
  posterUrl?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'banner';
}

const themeGradients = {
  indigo: 'from-indigo-600 via-indigo-700 to-slate-900',
  purple: 'from-purple-600 via-indigo-800 to-slate-950',
  blue: 'from-blue-600 via-sky-700 to-indigo-950',
  emerald: 'from-emerald-600 via-teal-800 to-slate-950',
  amber: 'from-amber-600 via-orange-700 to-slate-950',
  rose: 'from-rose-600 via-pink-800 to-slate-950',
};

const categoryIcons: Record<EventCategory, React.ElementType> = {
  'Technical Events': Code2,
  'Workshops': Wrench,
  'Hackathons': Laptop,
  'Cultural Events': Music,
  'Sports Events': Trophy,
  'Seminars': GraduationCap,
  'Competitions': Flame,
  'Other Events': Calendar,
};

export const EventPoster: React.FC<EventPosterProps> = ({
  title,
  category,
  posterTheme = 'indigo',
  posterUrl,
  className = '',
  size = 'md',
}) => {
  const Icon = categoryIcons[category] || Sparkles;
  const gradient = themeGradients[posterTheme] || themeGradients.indigo;

  // Aspect ratio and height classes based on size
  const heightClasses = {
    sm: 'h-36',
    md: 'h-48',
    lg: 'h-64',
    banner: 'h-64 md:h-80',
  }[size];

  if (posterUrl && posterUrl.startsWith('http') || posterUrl?.startsWith('data:image')) {
    return (
      <div className={`relative overflow-hidden ${heightClasses} ${className} bg-slate-900`}>
        <img
          src={posterUrl}
          alt={title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          onError={(e) => {
            // Graceful fallback to styled gradient container
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent pointer-events-none" />
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded text-xs font-semibold text-slate-900 shadow-xs flex items-center gap-1.5">
          <Icon className="w-3.5 h-3.5 text-indigo-600" />
          <span>{category}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden ${heightClasses} bg-gradient-to-br ${gradient} p-5 flex flex-col justify-between ${className}`}
    >
      {/* Subtle geometric background pattern */}
      <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      
      {/* Top Category Badge */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/15 backdrop-blur-md rounded text-xs font-medium text-white border border-white/20 shadow-xs">
          <Icon className="w-3.5 h-3.5 text-indigo-200" />
          <span>{category}</span>
        </div>
        <div className="text-[11px] font-mono tracking-wider uppercase text-white/60">
          CampusConnect
        </div>
      </div>

      {/* Center domain graphic watermark */}
      <div className="absolute right-4 bottom-4 text-white/10 pointer-events-none">
        <Icon className="w-28 h-28 stroke-[1.2]" />
      </div>

      {/* Bottom Title Preview */}
      <div className="relative z-10 mt-auto pt-4">
        <p className="text-white font-bold text-base md:text-lg line-clamp-2 leading-snug drop-shadow-xs">
          {title}
        </p>
      </div>
    </div>
  );
};
