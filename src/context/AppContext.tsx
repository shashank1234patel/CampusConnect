import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, CampusEvent, EventRegistration, Announcement, UserRole, CampusPost } from '../types';
import { INITIAL_USERS, INITIAL_EVENTS, INITIAL_REGISTRATIONS, INITIAL_ANNOUNCEMENTS, INITIAL_POSTS } from '../data/initialData';
import { api } from '../services/api';
import { isSupabaseConfigured } from '../lib/supabase';
import { supabaseService } from '../services/supabaseService';


export interface ApiLog {
  id: string;
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  endpoint: string;
  status: number;
  timestamp: string;
  details?: string;
}

interface AppContextType {
  currentUser: User | null;
  users: User[];
  events: CampusEvent[];
  registrations: EventRegistration[];
  announcements: Announcement[];
  apiLogs: ApiLog[];
  posts: CampusPost[];
  
  // Post methods
  createPost: (content: string, mediaType?: 'iaf-marathon' | 'image' | 'event', eventId?: string) => void;
  likePost: (postId: string) => void;
  addComment: (postId: string, text: string) => void;
  
  // Auth methods
  login: (email: string, role?: UserRole) => { success: boolean; message: string };
  signup: (userData: Omit<User, 'id' | 'createdAt'>) => { success: boolean; message: string; user?: User };
  logout: () => void;
  switchDemoRole: (role: UserRole) => void;
  updateProfile: (updates: Partial<User>) => void;
  
  // Event methods
  createEvent: (eventData: Omit<CampusEvent, 'id' | 'registeredCount' | 'status' | 'createdAt'>) => { success: boolean; event: CampusEvent; message: string };
  updateEvent: (eventId: string, updates: Partial<CampusEvent>) => void;
  deleteEvent: (eventId: string) => void;
  toggleRegistrationStatus: (eventId: string, isClosed: boolean) => void;
  
  // Registration methods
  registerForEvent: (eventId: string, participantData?: Partial<User>) => Promise<{ success: boolean; message: string; registrationId?: string; status?: number }>;
  cancelRegistration: (registrationId: string) => Promise<{ success: boolean; message: string }>;
  fetchMyRegistrations: () => Promise<void>;
  fetchEventAttendees: (eventId: string) => Promise<{ success: boolean; status: number; registrations?: EventRegistration[]; error?: string }>;
  
  // Admin methods
  approveEvent: (eventId: string) => void;
  rejectEvent: (eventId: string, reason: string) => void;
  deleteUser: (userId: string) => void;
  
  // Organizer methods
  sendAnnouncement: (eventId: string, title: string, message: string) => void;
  
  // Reset demo data helper
  resetToSampleData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'campusconnect_v1_';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}users`);
      return saved ? JSON.parse(saved) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}current_user`);
      if (saved) return JSON.parse(saved);
      // Default to student demo user
      return INITIAL_USERS[0];
    } catch {
      return INITIAL_USERS[0];
    }
  });

  const [events, setEvents] = useState<CampusEvent[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}events`);
      return saved ? JSON.parse(saved) : INITIAL_EVENTS;
    } catch {
      return INITIAL_EVENTS;
    }
  });

  const [registrations, setRegistrations] = useState<EventRegistration[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}registrations`);
      return saved ? JSON.parse(saved) : INITIAL_REGISTRATIONS;
    } catch {
      return INITIAL_REGISTRATIONS;
    }
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}announcements`);
      return saved ? JSON.parse(saved) : INITIAL_ANNOUNCEMENTS;
    } catch {
      return INITIAL_ANNOUNCEMENTS;
    }
  });

  const [posts, setPosts] = useState<CampusPost[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}posts`);
      return saved ? JSON.parse(saved) : INITIAL_POSTS;
    } catch {
      return INITIAL_POSTS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}posts`, JSON.stringify(posts));
    } catch (e) {
      console.warn('Failed to save posts', e);
    }
  }, [posts]);

  const createPost = (content: string, mediaType?: 'iaf-marathon' | 'image' | 'event', eventId?: string) => {
    if (!content.trim()) return;
    const author = currentUser || INITIAL_USERS[0];
    const newPost: CampusPost = {
      id: `post-${Date.now()}`,
      authorId: author.id,
      authorName: author.name,
      authorHeadline: author.headline || `${author.role.toUpperCase()} · ${author.collegeName}`,
      authorRole: author.role,
      isVerified: true,
      connectionDegree: 'You',
      createdAt: 'Just now',
      content: content.trim(),
      mediaType,
      eventId,
      likes: 0,
      commentsCount: 0,
      repostsCount: 0,
      isLiked: false,
      comments: []
    };
    setPosts(prev => [newPost, ...prev]);
  };

  const likePost = (postId: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const nextLiked = !post.isLiked;
        return {
          ...post,
          isLiked: nextLiked,
          likes: nextLiked ? post.likes + 1 : Math.max(0, post.likes - 1)
        };
      }
      return post;
    }));
  };

  const addComment = (postId: string, text: string) => {
    if (!text.trim()) return;
    const author = currentUser || INITIAL_USERS[0];
    const newComment = {
      id: `c-${Date.now()}`,
      authorName: author.name,
      authorHeadline: author.headline || `${author.role} · ${author.collegeName}`,
      content: text.trim(),
      timestamp: 'Just now'
    };
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          commentsCount: post.commentsCount + 1,
          comments: [...(post.comments || []), newComment]
        };
      }
      return post;
    }));
  };

  const [apiLogs, setApiLogs] = useState<ApiLog[]>([]);

  const addLog = (method: 'GET' | 'POST' | 'PATCH' | 'DELETE', endpoint: string, status: number, details?: string) => {
    const newLog: ApiLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      method,
      endpoint,
      status,
      timestamp: new Date().toLocaleTimeString(),
      details,
    };
    setApiLogs(prev => [newLog, ...prev.slice(0, 19)]);
  };

  // Sync from GET /api/events on mount
  useEffect(() => {
    api.getEvents()
      .then(remoteEvents => {
        if (remoteEvents && remoteEvents.length > 0) {
          setEvents(prev => {
            const localPending = prev.filter(e => e.status !== 'approved');
            return [...remoteEvents, ...localPending];
          });
          addLog('GET', '/api/events', 200, `Loaded ${remoteEvents.length} events from API`);
        }
      })
      .catch(err => {
        console.warn('Backend sync using local seed:', err);
      });
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}users`, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}current_user`, JSON.stringify(currentUser));
      // Call GET /api/me/registrations for current user
      api.getMyRegistrations(currentUser.email, currentUser.id)
        .then(userRegs => {
          if (userRegs) {
            setRegistrations(prev => {
              const others = prev.filter(r => r.userEmail.toLowerCase() !== currentUser.email.toLowerCase());
              return [...userRegs, ...others];
            });
            addLog('GET', '/api/me/registrations', 200, `Fetched ${userRegs.length} registrations for ${currentUser.name}`);
          }
        })
        .catch(() => {});
    } else {
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}current_user`);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}events`, JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}registrations`, JSON.stringify(registrations));
  }, [registrations]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}announcements`, JSON.stringify(announcements));
  }, [announcements]);

  // Auth Functions
  const login = (email: string, role?: UserRole) => {
    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      setCurrentUser(existing);
      return { success: true, message: `Welcome back, ${existing.name}!` };
    }
    // If not found, check if it's admin or create quick session
    if (role === 'admin' && email.includes('admin')) {
      const adminUser = users.find(u => u.role === 'admin') || INITIAL_USERS[2];
      setCurrentUser(adminUser);
      return { success: true, message: `Logged in as Administrator (${adminUser.name})` };
    }
    return { success: false, message: 'Account not found. Please check your email or Sign Up.' };
  };

  const signup = (userData: Omit<User, 'id' | 'createdAt'>) => {
    const existing = users.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
    if (existing) {
      return { success: false, message: 'An account with this email address already exists. Please log in.' };
    }

    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`,
      avatarColor: userData.role === 'admin' ? 'bg-blue-600' : userData.role === 'organizer' ? 'bg-purple-600' : 'bg-indigo-600',
      createdAt: new Date().toISOString(),
    };

    setUsers(prev => [newUser, ...prev]);
    setCurrentUser(newUser);
    return { success: true, message: 'Account created successfully! Welcome to CampusConnect.', user: newUser };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const switchDemoRole = (role: UserRole) => {
    const targetUser = users.find(u => u.role === role);
    if (targetUser) {
      setCurrentUser(targetUser);
    } else {
      const initMatch = INITIAL_USERS.find(u => u.role === role) || INITIAL_USERS[0];
      setCurrentUser(initMatch);
    }
  };

  const updateProfile = (updates: Partial<User>) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, ...updates };
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => (u.id === currentUser.id ? updatedUser : u)));
  };

  // Event Creation & Management
  const createEvent = (eventData: Omit<CampusEvent, 'id' | 'registeredCount' | 'status' | 'createdAt'>) => {
    const isAdmin = currentUser?.role === 'admin';
    const newEvent: CampusEvent = {
      ...eventData,
      id: `event-${Date.now()}`,
      registeredCount: 0,
      status: isAdmin ? 'approved' : 'pending',
      createdAt: new Date().toISOString(),
    };

    setEvents(prev => [newEvent, ...prev]);
    addLog('POST', '/api/events', 201, `Event "${newEvent.title}" submitted`);

    // Sync to Supabase project if configured
    if (isSupabaseConfigured()) {
      supabaseService.syncEventToSupabase(newEvent)
        .then(ok => {
          if (ok) {
            addLog('POST', 'supabase:events', 201, `Synced event to Supabase events table (${newEvent.title})`);
          } else {
            addLog('POST', 'supabase:events', 400, `Supabase sync check notice`);
          }
        })
        .catch(err => {
          addLog('POST', 'supabase:events', 500, `Supabase network error: ${String(err)}`);
        });
    } else {
      addLog('POST', 'supabase:events', 401, 'Data not saved to Supabase: Missing anon key (saved in website memory)');
    }

    return {
      success: true,
      event: newEvent,
      message: isAdmin
        ? 'Event published successfully and is now publicly live!'
        : 'Event submitted successfully! It has been sent to the Admin queue for review and will go live once approved.',
    };
  };

  const updateEvent = (eventId: string, updates: Partial<CampusEvent>) => {
    setEvents(prev => prev.map(ev => (ev.id === eventId ? { ...ev, ...updates } : ev)));
    addLog('PATCH', `/api/events/${eventId}`, 200, 'Event updated');
  };

  const deleteEvent = (eventId: string) => {
    setEvents(prev => prev.filter(ev => ev.id !== eventId));
    setRegistrations(prev => prev.filter(reg => reg.eventId !== eventId));
    addLog('DELETE', `/api/events/${eventId}`, 200, 'Event deleted');
  };

  const toggleRegistrationStatus = (eventId: string, isClosed: boolean) => {
    setEvents(prev =>
      prev.map(ev => (ev.id === eventId ? { ...ev, isRegistrationClosed: isClosed } : ev))
    );
  };

  // Registrations - calling POST /api/registrations (handles 201 Created and 409 Conflict)
  const registerForEvent = async (eventId: string, participantData?: Partial<User>) => {
    const targetEvent = events.find(ev => ev.id === eventId);
    if (!targetEvent) {
      return { success: false, message: 'Event not found.', status: 404 };
    }

    if (targetEvent.status !== 'approved') {
      return { success: false, message: 'This event is currently pending approval and not open for registrations.', status: 400 };
    }

    const effectiveUser = currentUser || {
      id: `anon-${Date.now()}`,
      name: participantData?.name || 'Guest Participant',
      email: participantData?.email || 'guest@example.com',
      phone: participantData?.phone || '+91 90000 00000',
      collegeName: participantData?.collegeName || 'CampusConnect Member',
      department: participantData?.department || 'General',
      usn: participantData?.usn,
      role: 'student' as UserRole,
      isStudent: true,
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await api.createRegistration({
        eventId,
        userName: effectiveUser.name,
        userEmail: effectiveUser.email,
        userPhone: effectiveUser.phone || '',
        userCollege: effectiveUser.collegeName || 'CampusConnect College',
        userDept: effectiveUser.department || 'General',
        userUsn: effectiveUser.usn,
        userId: effectiveUser.id,
      });

      addLog('POST', '/api/registrations', res.status, res.message);

      if (res.status === 201 && res.registration) {
        setRegistrations(prev => [res.registration!, ...prev]);
        setEvents(prev =>
          prev.map(ev =>
            ev.id === eventId
              ? {
                  ...ev,
                  registeredCount: ev.registeredCount + 1,
                  isRegistrationClosed: ev.registeredCount + 1 >= ev.maxParticipants ? true : ev.isRegistrationClosed,
                }
              : ev
          )
        );

        if (isSupabaseConfigured()) {
          supabaseService.createRegistration(
            effectiveUser.id,
            eventId,
            { name: effectiveUser.name, email: effectiveUser.email, role: effectiveUser.role },
            {
              title: targetEvent.title,
              capacity: targetEvent.maxParticipants,
              date: targetEvent.date,
              organizerId: targetEvent.organizerId,
            }
          )
            .then(sRes => {
              if (sRes.success) {
                addLog('POST', 'supabase:registrations', sRes.status, `Saved to Supabase registrations table (Pass: ${sRes.registrationId})`);
              } else {
                addLog('POST', 'supabase:registrations', sRes.status, `Supabase notice: ${sRes.message}`);
              }
            })
            .catch(err => {
              addLog('POST', 'supabase:registrations', 500, `Supabase error: ${String(err)}`);
            });
        } else {
          addLog('POST', 'supabase:registrations', 401, 'Data not saved to Supabase: Missing anon key (saved in local memory)');
        }

        return {
          success: true,
          status: 201,
          message: res.message,
          registrationId: res.registration.id,
        };
      } else if (res.status === 409) {
        return {
          success: false,
          status: 409,
          message: res.message,
          registrationId: res.registrationId,
        };
      } else {
        return {
          success: false,
          status: res.status,
          message: res.message,
        };
      }
    } catch (err) {
      console.warn('API error, falling back to local registration store:', err);

      // Check local duplicate registration
      const existingRegistration = registrations.find(
        r => r.eventId === eventId && r.userEmail.toLowerCase() === effectiveUser.email.toLowerCase() && r.status === 'confirmed'
      );

      if (existingRegistration) {
        addLog('POST', '/api/registrations', 409, 'Duplicate registration (local cache)');
        return {
          success: false,
          status: 409,
          message: `You are already registered for this event! Registration ID: ${existingRegistration.id}`,
          registrationId: existingRegistration.id,
        };
      }

      if (targetEvent.isRegistrationClosed || targetEvent.registeredCount >= targetEvent.maxParticipants) {
        addLog('POST', '/api/registrations', 400, 'Seats full');
        return { success: false, status: 400, message: 'Sorry, this event has reached maximum capacity or registrations are closed.' };
      }

      const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();
      const newRegId = `CC-${new Date().getFullYear()}-${randomHex}`;

      const newRegistration: EventRegistration = {
        id: newRegId,
        eventId: targetEvent.id,
        eventTitle: targetEvent.title,
        eventDate: targetEvent.date,
        eventVenue: targetEvent.venue,
        eventTime: `${targetEvent.startTime} - ${targetEvent.endTime}`,
        eventCategory: targetEvent.category,
        userId: effectiveUser.id,
        userName: effectiveUser.name,
        userEmail: effectiveUser.email,
        userPhone: effectiveUser.phone || '',
        userCollege: effectiveUser.collegeName || 'BIT',
        userDept: effectiveUser.department || 'Engineering',
        userUsn: effectiveUser.usn,
        registeredAt: new Date().toISOString(),
        status: 'confirmed',
        checkInStatus: 'registered',
      };

      setRegistrations(prev => [newRegistration, ...prev]);
      setEvents(prev =>
        prev.map(ev =>
          ev.id === eventId
            ? {
                ...ev,
                registeredCount: ev.registeredCount + 1,
                isRegistrationClosed: ev.registeredCount + 1 >= ev.maxParticipants ? true : ev.isRegistrationClosed,
              }
            : ev
        )
      );

      addLog('POST', '/api/registrations', 201, `Registration created (Pass ID: ${newRegId})`);

      if (isSupabaseConfigured()) {
        supabaseService.createRegistration(
          effectiveUser.id,
          eventId,
          { name: effectiveUser.name, email: effectiveUser.email, role: effectiveUser.role },
          {
            title: targetEvent.title,
            capacity: targetEvent.maxParticipants,
            date: targetEvent.date,
            organizerId: targetEvent.organizerId,
          }
        )
          .then(sRes => {
            if (sRes.success) {
              addLog('POST', 'supabase:registrations', sRes.status, `Saved to Supabase registrations table (Pass: ${sRes.registrationId})`);
            }
          })
          .catch(() => {});
      }

      return {
        success: true,
        status: 201,
        message: 'Registration confirmed successfully!',
        registrationId: newRegId,
      };
    }
  };

  // GET /api/me/registrations
  const fetchMyRegistrations = async () => {
    if (!currentUser?.email) return;
    try {
      const userRegs = await api.getMyRegistrations(currentUser.email, currentUser.id);
      addLog('GET', '/api/me/registrations', 200, `Retrieved ${userRegs.length} registrations`);
      setRegistrations(prev => {
        const others = prev.filter(r => r.userEmail.toLowerCase() !== currentUser.email.toLowerCase());
        return [...userRegs, ...others];
      });
    } catch (err) {
      console.warn('Error fetching my registrations:', err);
    }
  };

  // GET /api/events/{id}/registrations (Attendee list, owning organizer only)
  const fetchEventAttendees = async (eventId: string) => {
    const res = await api.getEventRegistrations(eventId, currentUser?.id, currentUser?.role);
    addLog(
      'GET',
      `/api/events/${eventId}/registrations`,
      res.status,
      res.success ? `Attendee list loaded (${res.registrations?.length} records)` : (res.error || 'Access denied (403)')
    );
    return res;
  };

  const cancelRegistration = async (registrationId: string) => {
    const reg = registrations.find(r => r.id === registrationId);
    if (!reg) {
      return { success: false, message: 'Registration record not found.' };
    }

    const ev = events.find(e => e.id === reg.eventId);
    if (ev && !ev.allowCancellation) {
      return { success: false, message: 'The event organizer has specified that registrations cannot be cancelled for this event.' };
    }

    setRegistrations(prev => prev.filter(r => r.id !== registrationId));
    if (ev) {
      setEvents(prev =>
        prev.map(e =>
          e.id === ev.id
            ? {
                ...e,
                registeredCount: Math.max(0, e.registeredCount - 1),
                isRegistrationClosed: false,
              }
            : e
        )
      );
    }

    addLog('DELETE', `/api/registrations/${registrationId}`, 200, 'Registration cancelled');
    return { success: true, message: 'Your registration has been cancelled successfully.' };
  };

  // Admin Actions
  const approveEvent = (eventId: string) => {
    setEvents(prev =>
      prev.map(ev => (ev.id === eventId ? { ...ev, status: 'approved', rejectionReason: undefined } : ev))
    );
  };

  const rejectEvent = (eventId: string, reason: string) => {
    setEvents(prev =>
      prev.map(ev => (ev.id === eventId ? { ...ev, status: 'rejected', rejectionReason: reason } : ev))
    );
  };

  const deleteUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  // Organizer Actions
  const sendAnnouncement = (eventId: string, title: string, message: string) => {
    const ev = events.find(e => e.id === eventId);
    const newAnnouncement: Announcement = {
      id: `ann-${Date.now()}`,
      eventId,
      eventTitle: ev?.title || 'Campus Event',
      organizerName: currentUser?.name || 'Event Coordinator',
      title,
      message,
      createdAt: new Date().toISOString(),
    };

    setAnnouncements(prev => [newAnnouncement, ...prev]);
  };

  const resetToSampleData = () => {
    setUsers(INITIAL_USERS);
    setCurrentUser(INITIAL_USERS[0]);
    setEvents(INITIAL_EVENTS);
    setRegistrations(INITIAL_REGISTRATIONS);
    setAnnouncements(INITIAL_ANNOUNCEMENTS);
    localStorage.clear();
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        events,
        registrations,
        announcements,
        apiLogs,
        posts,
        createPost,
        likePost,
        addComment,
        login,
        signup,
        logout,
        switchDemoRole,
        updateProfile,
        createEvent,
        updateEvent,
        deleteEvent,
        toggleRegistrationStatus,
        registerForEvent,
        cancelRegistration,
        fetchMyRegistrations,
        fetchEventAttendees,
        approveEvent,
        rejectEvent,
        deleteUser,
        sendAnnouncement,
        resetToSampleData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
