import { CampusEvent, EventRegistration, Announcement } from '../types';

export interface CreateRegistrationPayload {
  eventId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  userCollege: string;
  userDept: string;
  userUsn?: string;
  userId?: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  status: number;
}

/**
 * CampusConnect API Service
 * Implements the required REST endpoints:
 * - GET /api/events (Browse events)
 * - GET /api/events/{id} (Event details)
 * - POST /api/registrations (Create registration, 201 or 409)
 * - GET /api/me/registrations (Current user's registrations)
 * - GET /api/events/{id}/registrations (Attendee list, owning organizer only)
 */
export const api = {
  /**
   * GET /api/events
   * Browse events with optional search and category filters
   */
  async getEvents(params?: { category?: string; search?: string }): Promise<CampusEvent[]> {
    const query = new URLSearchParams();
    if (params?.category && params.category !== 'All') {
      query.set('category', params.category);
    }
    if (params?.search) {
      query.set('search', params.search);
    }

    const url = `/api/events${query.toString() ? `?${query.toString()}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch events: ${res.statusText}`);
    }
    return res.json();
  },

  /**
   * GET /api/events/{id}
   * Fetch specific event details
   */
  async getEventById(id: string): Promise<CampusEvent> {
    const res = await fetch(`/api/events/${encodeURIComponent(id)}`);
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error('Event not found');
      }
      throw new Error(`Failed to fetch event: ${res.statusText}`);
    }
    return res.json();
  },

  /**
   * POST /api/registrations
   * Create registration - returns 201 on success or 409 on duplicate conflict
   */
  async createRegistration(payload: CreateRegistrationPayload): Promise<{
    success: boolean;
    status: number;
    registration?: EventRegistration;
    registrationId?: string;
    message: string;
    error?: string;
  }> {
    const res = await fetch('/api/registrations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (res.status === 201) {
      return {
        success: true,
        status: 201,
        registration: data.registration,
        registrationId: data.registration?.id || data.registrationId,
        message: data.message || 'Registration created successfully (201 Created)',
      };
    } else if (res.status === 409) {
      return {
        success: false,
        status: 409,
        registrationId: data.registrationId,
        message: data.message || 'Duplicate registration detected (409 Conflict)',
        error: data.error || 'Conflict',
      };
    } else {
      return {
        success: false,
        status: res.status,
        message: data.message || data.error || 'Failed to complete registration',
        error: data.error,
      };
    }
  },

  /**
   * GET /api/me/registrations
   * Retrieve current user's registrations
   */
  async getMyRegistrations(userEmail: string, userId?: string): Promise<EventRegistration[]> {
    const res = await fetch('/api/me/registrations', {
      headers: {
        'x-user-email': userEmail,
        ...(userId ? { 'x-user-id': userId } : {}),
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch my registrations: ${res.statusText}`);
    }
    return res.json();
  },

  /**
   * GET /api/events/{id}/registrations
   * Attendee list, owning organizer only. Returns 403 if unauthorized.
   */
  async getEventRegistrations(
    eventId: string,
    organizerId?: string,
    userRole?: string
  ): Promise<{
    success: boolean;
    status: number;
    registrations?: EventRegistration[];
    error?: string;
  }> {
    const res = await fetch(`/api/events/${encodeURIComponent(eventId)}/registrations`, {
      headers: {
        ...(organizerId ? { 'x-user-id': organizerId } : {}),
        ...(userRole ? { 'x-user-role': userRole } : {}),
      },
    });

    if (res.status === 403) {
      const err = await res.json();
      return {
        success: false,
        status: 403,
        error: err.message || err.error || 'Forbidden: Attendee list is accessible to owning organizer only.',
      };
    }

    if (!res.ok) {
      return {
        success: false,
        status: res.status,
        error: `Error ${res.status}: ${res.statusText}`,
      };
    }

    const data = await res.json();
    return {
      success: true,
      status: 200,
      registrations: data,
    };
  },
};
