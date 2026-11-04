import { getSupabaseClient, isSupabaseConfigured, getSupabaseUrl } from '../lib/supabase';
import { CampusEvent, EventRegistration } from '../types';

export interface SupabaseUserRow {
  id: string;
  email: string;
  role?: string;
}

export interface SupabaseEventRow {
  id: string;
  organiser_id: string;
  title: string;
  capacity?: number;
  timestamp?: string;
  description?: string;
  category?: string;
  venue?: string;
  fee?: number;
}

export interface SupabaseRegistrationRow {
  id: string;
  user_id: string;
  event_id: string;
  created_id?: string;
}

export const supabaseService = {
  /**
   * Quick connection & schema check against the Supabase project
   */
  async testConnection(): Promise<{
    connected: boolean;
    url: string;
    eventsCount?: number;
    error?: string;
    details?: string;
  }> {
    const url = getSupabaseUrl();
    if (!isSupabaseConfigured()) {
      return {
        connected: false,
        url,
        error: 'Missing Supabase anon key.',
        details: 'Provide your VITE_SUPABASE_ANON_KEY in .env or paste it into the Connect Supabase panel.',
      };
    }

    try {
      const client = getSupabaseClient();
      const { count, error } = await client
        .from('events')
        .select('*', { count: 'exact', head: true });

      if (error) {
        return {
          connected: false,
          url,
          error: error.message,
          details: error.hint || 'Check if the "events" table exists and Row Level Security (RLS) allows SELECT.',
        };
      }

      return {
        connected: true,
        url,
        eventsCount: count ?? 0,
        details: 'Connected successfully to Supabase backend project (rerdtoiflkjczoftrbri)!',
      };
    } catch (err: any) {
      return {
        connected: false,
        url,
        error: err.message || 'Unknown network error',
      };
    }
  },

  /**
   * 1. GET /api/events -> supabase.from('events').select('*')
   */
  async getEvents(): Promise<CampusEvent[] | null> {
    if (!isSupabaseConfigured()) return null;

    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from('events')
        .select(`
          id,
          organiser_id,
          title,
          capacity,
          timestamp,
          registrations (id)
        `);

      if (error) {
        console.warn('Supabase getEvents query notice:', error.message);
        return null;
      }

      if (!data) return null;

      return data.map((row: any) => {
        const regCount = Array.isArray(row.registrations) ? row.registrations.length : 0;
        const dateObj = row.timestamp ? new Date(row.timestamp) : new Date();
        const dateStr = dateObj.toISOString().split('T')[0];
        const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        return {
          id: row.id,
          title: row.title || 'Untitled Event',
          category: 'Technical Events',
          description: `Event organized in Supabase project (ID: ${row.id}).`,
          organizerName: 'Campus Organizer',
          organizerClub: 'University Club',
          organizerEmail: 'organizer@campusconnect.edu',
          organizerPhone: '+91 98765 43210',
          organizerId: row.organiser_id,
          date: dateStr,
          startTime: timeStr,
          endTime: '05:00 PM',
          venue: 'Campus Main Auditorium',
          maxParticipants: row.capacity || 100,
          registeredCount: regCount,
          registrationDeadline: dateStr,
          posterTheme: 'indigo',
          fee: 0,
          instructions: 'Please bring your student ID card.',
          allowCancellation: true,
          isRegistrationClosed: (row.capacity && regCount >= row.capacity) || false,
          status: 'approved',
          createdAt: row.timestamp || new Date().toISOString(),
        };
      });
    } catch (err) {
      console.warn('Supabase fetch exception:', err);
      return null;
    }
  },

  /**
   * 2. GET /api/events/{id} -> supabase.from('events').select('*').eq('id', id).single()
   */
  async getEventById(id: string): Promise<CampusEvent | null> {
    if (!isSupabaseConfigured()) return null;

    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from('events')
        .select(`
          id,
          organiser_id,
          title,
          capacity,
          timestamp,
          registrations (id)
        `)
        .eq('id', id)
        .single();

      if (error || !data) return null;

      const regCount = Array.isArray(data.registrations) ? data.registrations.length : 0;
      const dateObj = data.timestamp ? new Date(data.timestamp) : new Date();

      return {
        id: data.id,
        title: data.title || 'Untitled Event',
        category: 'Technical Events',
        description: `Full details for event ${data.title} hosted via Supabase database.`,
        organizerName: 'Campus Host',
        organizerClub: 'Technical Society',
        organizerEmail: 'host@campusconnect.edu',
        organizerPhone: '+91 98765 43210',
        organizerId: data.organiser_id,
        date: dateObj.toISOString().split('T')[0],
        startTime: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        endTime: '05:00 PM',
        venue: 'Campus Main Auditorium',
        maxParticipants: data.capacity || 100,
        registeredCount: regCount,
        registrationDeadline: dateObj.toISOString().split('T')[0],
        posterTheme: 'indigo',
        fee: 0,
        instructions: 'Keep valid entry pass ready for scan.',
        allowCancellation: true,
        isRegistrationClosed: (data.capacity && regCount >= data.capacity) || false,
        status: 'approved',
        createdAt: data.timestamp || new Date().toISOString(),
      };
    } catch {
      return null;
    }
  },

  /**
   * 3. POST /api/registrations -> inserts into 'registrations' table
   * Handles 201 Created and 409 Conflict duplicate checks
   */
  async createRegistration(userId: string, eventId: string): Promise<{
    success: boolean;
    status: number;
    registrationId?: string;
    message: string;
  }> {
    if (!isSupabaseConfigured()) {
      return { success: false, status: 503, message: 'Supabase credentials not configured yet.' };
    }

    try {
      const client = getSupabaseClient();

      // 1. Check duplicate registration (409 Conflict)
      const { data: existing } = await client
        .from('registrations')
        .select('id')
        .eq('user_id', userId)
        .eq('event_id', eventId)
        .maybeSingle();

      if (existing) {
        return {
          success: false,
          status: 409,
          registrationId: existing.id,
          message: `Duplicate registration: you are already registered in Supabase (Pass ID: ${existing.id}).`,
        };
      }

      // 2. Check event capacity
      const { data: eventData } = await client
        .from('events')
        .select('capacity, registrations(count)')
        .eq('id', eventId)
        .single();

      if (eventData && eventData.capacity) {
        const count = eventData.registrations?.[0]?.count || 0;
        if (count >= eventData.capacity) {
          return {
            success: false,
            status: 400,
            message: 'Event is at full capacity in Supabase.',
          };
        }
      }

      // 3. Insert registration (201 Created)
      const { data: inserted, error: insertErr } = await client
        .from('registrations')
        .insert({
          user_id: userId,
          event_id: eventId,
          created_id: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertErr || !inserted) {
        return {
          success: false,
          status: 400,
          message: insertErr?.message || 'Could not insert registration into Supabase.',
        };
      }

      return {
        success: true,
        status: 201,
        registrationId: inserted.id,
        message: 'Registration created successfully in Supabase (201 Created)',
      };
    } catch (err: any) {
      return {
        success: false,
        status: 500,
        message: err.message || 'Database error in Supabase registration.',
      };
    }
  },

  /**
   * 4. GET /api/me/registrations -> supabase.from('registrations').select('*, events(*)').eq('user_id', userId)
   */
  async getMyRegistrations(userId: string): Promise<EventRegistration[] | null> {
    if (!isSupabaseConfigured()) return null;

    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from('registrations')
        .select(`
          id,
          user_id,
          event_id,
          created_id,
          events (
            id,
            title,
            timestamp,
            capacity
          )
        `)
        .eq('user_id', userId);

      if (error || !data) return null;

      return data.map((row: any) => {
        const ev = row.events || {};
        const dateObj = ev.timestamp ? new Date(ev.timestamp) : new Date();

        return {
          id: row.id,
          eventId: row.event_id,
          eventTitle: ev.title || 'Campus Event',
          eventDate: dateObj.toISOString().split('T')[0],
          eventVenue: 'University Auditorium',
          eventTime: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          eventCategory: 'Technical Events',
          userId: row.user_id,
          userName: 'Registered Student',
          userEmail: '',
          userPhone: '',
          userCollege: 'Bangalore Institute of Technology',
          userDept: 'Computer Science',
          registeredAt: row.created_id || new Date().toISOString(),
          status: 'confirmed',
          checkInStatus: 'registered',
        };
      });
    } catch {
      return null;
    }
  },

  /**
   * 5. GET /api/events/{id}/registrations -> Attendee list, owning organizer only
   */
  async getEventAttendees(eventId: string, organizerId?: string): Promise<{
    status: number;
    data?: any[];
    error?: string;
  }> {
    if (!isSupabaseConfigured()) {
      return { status: 503, error: 'Supabase credentials not configured' };
    }

    try {
      const client = getSupabaseClient();

      // Check event ownership
      const { data: eventData } = await client
        .from('events')
        .select('organiser_id')
        .eq('id', eventId)
        .single();

      if (!eventData) {
        return { status: 404, error: 'Event not found in Supabase' };
      }

      if (organizerId && eventData.organiser_id !== organizerId) {
        return {
          status: 403,
          error: 'Forbidden: Attendee list is accessible to the owning organizer only.',
        };
      }

      const { data: attendees, error } = await client
        .from('registrations')
        .select(`
          id,
          created_id,
          users (
            id,
            email,
            role
          )
        `)
        .eq('event_id', eventId);

      if (error) {
        return { status: 400, error: error.message };
      }

      return { status: 200, data: attendees };
    } catch (err: any) {
      return { status: 500, error: err.message };
    }
  },

  /**
   * 6. Live insertion test: Checks whether data put into the website can be saved into Supabase
   * Attempts to insert a test record into Supabase and verifies whether it persists.
   */
  async insertTestDataToSupabase(customTitle?: string): Promise<{
    success: boolean;
    stage: 'auth_check' | 'user_insert' | 'event_insert' | 'verify_read';
    message: string;
    insertedData?: any;
    error?: string;
    details?: string;
    httpCode?: number;
  }> {
    if (!isSupabaseConfigured()) {
      return {
        success: false,
        stage: 'auth_check',
        message: 'Data cannot reach Supabase: Missing Supabase Anon API Key (HTTP 401 Unauthorized)',
        error: 'UNAUTHORIZED_MISSING_API_KEY',
        details:
          'Supabase strictly requires the project "anon" public API key in the request header. Until this key is provided, all website submissions are safely handled in the local website memory backend and NOT written to Supabase.',
        httpCode: 401,
      };
    }

    const client = getSupabaseClient();
    const testUserId = '00000000-0000-0000-0000-000000000001';
    const testEventId = `e${Date.now().toString(16).padStart(8, '0')}-0000-0000-0000-000000000001`;

    try {
      // Step 1: Ensure organizer user exists in 'users' table
      const { error: userErr } = await client
        .from('users')
        .upsert(
          {
            id: testUserId,
            email: 'live-test@campusconnect.edu',
            role: 'organizer',
          },
          { onConflict: 'id' }
        );

      if (userErr) {
        return {
          success: false,
          stage: 'user_insert',
          message: `Failed to insert user row into Supabase "users" table: ${userErr.message}`,
          error: userErr.message,
          details: userErr.hint || 'Check if "users" table allows INSERT under Row Level Security (RLS).',
        };
      }

      // Step 2: Insert into 'events' table
      const eventPayload = {
        id: testEventId,
        organiser_id: testUserId,
        title: customTitle || `Live Verified Event: ${new Date().toLocaleTimeString()}`,
        capacity: 100,
        timestamp: new Date(Date.now() + 86400000 * 3).toISOString(),
      };

      const { data: insertedEvent, error: eventErr } = await client
        .from('events')
        .insert(eventPayload)
        .select()
        .single();

      if (eventErr) {
        return {
          success: false,
          stage: 'event_insert',
          message: `Failed to insert event row into Supabase "events" table: ${eventErr.message}`,
          error: eventErr.message,
          details: eventErr.hint || 'Check if "events" table allows INSERT under Row Level Security (RLS).',
        };
      }

      // Step 3: Verify read from Supabase
      const { data: verified, error: readErr } = await client
        .from('events')
        .select('*')
        .eq('id', testEventId)
        .single();

      if (readErr || !verified) {
        return {
          success: true,
          stage: 'verify_read',
          message: 'Data was inserted into Supabase events table, but could not be read back (RLS SELECT policy may be restrictive).',
          insertedData: insertedEvent,
          details: 'Run the RLS SQL script to allow public SELECT on events.',
        };
      }

      return {
        success: true,
        stage: 'verify_read',
        message: 'SUCCESS: Data was written to and read back from your Supabase database!',
        insertedData: verified,
        details: `Confirmed in project rerdtoiflkjczoftrbri! Event ID: ${verified.id}, Title: "${verified.title}".`,
        httpCode: 201,
      };
    } catch (err: any) {
      return {
        success: false,
        stage: 'event_insert',
        message: err.message || 'Network exception while putting data into Supabase',
        error: String(err),
      };
    }
  },
};

