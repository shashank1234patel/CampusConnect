export type UserRole = 'student' | 'organizer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isStudent: boolean;
  usn?: string; // Student ID / University Seat Number
  collegeName: string;
  department: string;
  headline?: string;
  location?: string;
  connectionsCount?: number;
  profileViews?: number;
  avatarUrl?: string;
  bannerUrl?: string;
  yearSemester?: string;
  phone: string;
  organization?: string;
  avatarColor?: string;
  createdAt: string;
}

export interface PostComment {
  id: string;
  authorName: string;
  authorHeadline: string;
  content: string;
  timestamp: string;
}

export interface CampusPost {
  id: string;
  authorId: string;
  authorName: string;
  authorHeadline: string;
  authorRole?: string;
  isVerified?: boolean;
  connectionDegree?: string; // e.g. '1st'
  createdAt: string; // e.g. "1w", "2h"
  content: string;
  eventId?: string; // Optional linked event
  mediaType?: 'iaf-marathon' | 'image' | 'event';
  mediaUrl?: string;
  stats?: {
    distance?: string;
    movingTime?: string;
    avgPace?: string;
    elevation?: string;
    title?: string;
    location?: string;
  };
  likes: number;
  commentsCount: number;
  repostsCount: number;
  isLiked?: boolean;
  comments?: PostComment[];
}

export type EventCategory =
  | 'Technical Events'
  | 'Workshops'
  | 'Hackathons'
  | 'Cultural Events'
  | 'Sports Events'
  | 'Seminars'
  | 'Competitions'
  | 'Other Events';

export type EventStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface CampusEvent {
  id: string;
  title: string;
  category: EventCategory;
  description: string;
  organizerName: string;
  organizerClub: string;
  organizerEmail: string;
  organizerPhone: string;
  organizerId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // e.g. "09:30 AM"
  endTime: string; // e.g. "04:30 PM"
  venue: string;
  maxParticipants: number;
  registeredCount: number;
  registrationDeadline: string; // YYYY-MM-DD
  posterUrl?: string;
  posterTheme: 'indigo' | 'purple' | 'blue' | 'emerald' | 'amber' | 'rose';
  fee: number; // 0 for Free
  instructions: string;
  allowCancellation: boolean;
  isRegistrationClosed: boolean;
  status: EventStatus;
  featured?: boolean;
  createdAt: string;
  rejectionReason?: string;
}

export interface EventRegistration {
  id: string; // e.g. "REG-83921"
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventVenue: string;
  eventTime: string;
  eventCategory: EventCategory;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  userCollege: string;
  userDept: string;
  userUsn?: string;
  registeredAt: string;
  status: 'confirmed' | 'cancelled';
  checkInStatus?: 'registered' | 'checked-in';
}

export interface Announcement {
  id: string;
  eventId: string;
  eventTitle: string;
  organizerName: string;
  title: string;
  message: string;
  createdAt: string;
}
