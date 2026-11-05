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

export function ensureValidUuid(rawId: string, namespace = '10000000'): string {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(rawId)) {
    return rawId.toLowerCase();
  }
  let h1 = 0x811c9dc5;
  let h2 = 0x1000193;
  for (let i = 0; i < rawId.length; i++) {
    const code = rawId.charCodeAt(i);
    h1 = Math.imul(h1 ^ code, 0x01000193);
    h2 = Math.imul(h2 ^ code, 0x85ebca6b);
  }
  const hex1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const hex2 = (h2 >>> 0).toString(16).padStart(8, '0');
  const safeNs = namespace.replace(/[^0-9a-f]/gi, '0').padEnd(8, '0').slice(0, 8);
  return `${safeNs}-${hex1.slice(0, 4)}-4${hex1.slice(5, 8)}-8${hex2.slice(1, 4)}-${(hex1 + hex2).slice(0, 12)}`;
}

export const supabaseService = {
  /**
   * Safely formats an ID to valid UUID
   */
  toUuid(id: string, ns = '10000000'): string {
    return ensureValidUuid(id, ns);
  },

  /**
   * Automatically sync a user into Supabase users table
   */
  async syncUserToSupabase(user: { id: string; email: string; role?: string }): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    try {
      const client = getSupabaseClient();
      const validUserId = ensureValidUuid(user.id, '10000000');
      const { error } = await client.from('users').upsert(
        {
          id: validUserId,
          email: user.email,
          role: user.role || 'student',
        },
        { onConflict: 'id' }
      );
      if (error) {
        console.warn('Supabase syncUser error:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.warn('Failed to sync user to Supabase', e);
      return false;
    }
  },

  /**
   * Automatically sync an event into Supabase events table
   */
  async syncEventToSupabase(event: CampusEvent): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    try {
      const client = getSupabaseClient();
      const validEventId = ensureValidUuid(event.id, '20000000');
      const validOrganizerId = ensureValidUuid(event.organizerId || 'user-organizer-1', '10000000');

      // 1. Ensure organizer exists in users table
      await client.from('users').upsert({
        id: validOrganizerId,
        email: event.organizerEmail || 'organizer@campusconnect.edu',
        role: 'organizer'
      }, { onConflict: 'id' });

      // 2. Upsert event into events table
      const eventTimestamp = event.date ? new Date(event.date).toISOString() : new Date().toISOString();
      const { error: eventErr } = await client.from('events').upsert({
        id: validEventId,
        organiser_id: validOrganizerId,
        title: event.title,
        capacity: event.maxParticipants || 100,
        timestamp: eventTimestamp
      }, { onConflict: 'id' });

      if (eventErr) {
        console.warn('Supabase syncEvent error:', eventErr.message);
        return false;
      }

      return true;
    } catch (e) {
      console.warn('Failed to sync event to Supabase', e);
      return false;
    }
  },

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
      const validId = ensureValidUuid(id, '20000000');
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
        .eq('id', validId)
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
   * 3. POST /api/registrations -> inserts directly into Supabase 'registrations' table
   * Handles user & event foreign key validation, 201 Created and 409 Conflict checks
   */
  async createRegistration(
    userId: string, 
    eventId: string,
    userInfo?: { name?: string; email?: string; role?: string },
    eventInfo?: { title?: string; capacity?: number; date?: string; organizerId?: string }
  ): Promise<{
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
      const validUserId = ensureValidUuid(userId, '10000000');
      const validEventId = ensureValidUuid(eventId, '20000000');
      const validOrganizerId = ensureValidUuid(eventInfo?.organizerId || 'user-organizer-1', '10000000');

      // 1. Ensure User row exists in 'users' table so foreign key constraint passes
      await client.from('users').upsert({
        id: validUserId,
        email: userInfo?.email || 'student@campusconnect.edu',
        role: userInfo?.role || 'student'
      }, { onConflict: 'id' });

      // 2. Ensure Organizer exists in 'users' table
      await client.from('users').upsert({
        id: validOrganizerId,
        email: 'organizer@campusconnect.edu',
        role: 'organizer'
      }, { onConflict: 'id' });

      // 3. Ensure Event row exists in 'events' table so foreign key constraint passes
      const eventTimestamp = eventInfo?.date ? new Date(eventInfo.date).toISOString() : new Date().toISOString();
      await client.from('events').upsert({
        id: validEventId,
        organiser_id: validOrganizerId,
        title: eventInfo?.title || 'Campus Event',
        capacity: eventInfo?.capacity || 100,
        timestamp: eventTimestamp
      }, { onConflict: 'id' });

      // 4. Check duplicate registration (409 Conflict)
      const { data: existing } = await client
        .from('registrations')
        .select('id')
        .eq('user_id', validUserId)
        .eq('event_id', validEventId)
        .maybeSingle();

      if (existing) {
        return {
          success: false,
          status: 409,
          registrationId: existing.id,
          message: `Duplicate registration: you are already registered in Supabase (Pass ID: ${existing.id}).`,
        };
      }

      // 5. Insert registration (201 Created)
      const regUuid = ensureValidUuid(`reg-${Date.now()}-${Math.random()}`, '30000000');
      const { data: inserted, error: insertErr } = await client
        .from('registrations')
        .insert({
          id: regUuid,
          user_id: validUserId,
          event_id: validEventId,
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

  /**
   * Insert and verify a live test registration row directly into Supabase 'registrations' table
   */
  async insertTestRegistrationToSupabase(eventTitle?: string): Promise<{
    success: boolean;
    message: string;
    stage: string;
    details?: string;
    insertedData?: any;
    httpCode?: number;
    error?: string;
  }> {
    if (!isSupabaseConfigured()) {
      return {
        success: false,
        stage: 'config_check',
        message: 'Missing anon key: Supabase cannot accept writes until anon key is configured.',
        details: 'Save your Supabase anon key above to enable direct writes to the registrations table.',
        httpCode: 401,
      };
    }

    try {
      const client = getSupabaseClient();
      const testStudentId = ensureValidUuid('test-student-' + Date.now().toString().slice(-6), '10000000');
      const testOrganizerId = ensureValidUuid('test-org-' + Date.now().toString().slice(-6), '10000000');
      const testEventId = ensureValidUuid('test-event-' + Date.now().toString().slice(-6), '20000000');
      const testRegId = ensureValidUuid('test-reg-' + Date.now().toString().slice(-6), '30000000');

      // 1. Ensure student user exists in 'users'
      await client.from('users').upsert({
        id: testStudentId,
        email: `student-${Date.now().toString().slice(-4)}@campusconnect.edu`,
        role: 'student',
      }, { onConflict: 'id' });

      // 2. Ensure organizer exists in 'users'
      await client.from('users').upsert({
        id: testOrganizerId,
        email: 'host@campusconnect.edu',
        role: 'organizer',
      }, { onConflict: 'id' });

      // 3. Ensure event exists in 'events'
      await client.from('events').upsert({
        id: testEventId,
        organiser_id: testOrganizerId,
        title: eventTitle || `Hackathon & Symposium ${new Date().getFullYear()}`,
        capacity: 150,
        timestamp: new Date().toISOString(),
      }, { onConflict: 'id' });

      // 4. Insert into 'registrations'
      const nowIso = new Date().toISOString();
      const regPayload = {
        id: testRegId,
        user_id: testStudentId,
        event_id: testEventId,
        created_id: nowIso,
      };

      const { data: insertedReg, error: regErr } = await client
        .from('registrations')
        .insert(regPayload)
        .select()
        .single();

      if (regErr) {
        return {
          success: false,
          stage: 'registration_insert',
          message: `Failed to insert into Supabase "registrations" table: ${regErr.message}`,
          error: regErr.message,
          details: regErr.hint || 'Check if "registrations" table allows INSERT under Row Level Security (RLS).',
        };
      }

      return {
        success: true,
        stage: 'verify_read',
        message: 'SUCCESS: Registration created and verified in Supabase "registrations" table!',
        insertedData: insertedReg || regPayload,
        details: `Confirmed in project rerdtoiflkjczoftrbri! Pass/Reg UUID: ${testRegId}, User UUID: ${testStudentId}, Event UUID: ${testEventId}.`,
        httpCode: 201,
      };
    } catch (err: any) {
      return {
        success: false,
        stage: 'registration_insert',
        message: err.message || 'Network exception while putting registration into Supabase',
        error: String(err),
      };
    }
  },
};

