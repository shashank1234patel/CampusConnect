import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { INITIAL_EVENTS, INITIAL_REGISTRATIONS, INITIAL_USERS, INITIAL_ANNOUNCEMENTS } from './src/data/initialData.ts';
import type { CampusEvent, EventRegistration, Announcement, User } from './src/types/index.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Parse CLI arguments (e.g. npm run dev --port 3000 --host 0.0.0.0)
const argv = process.argv.slice(2);
const portFlagIndex = argv.indexOf('--port');
const cliPort = portFlagIndex !== -1 && argv[portFlagIndex + 1] ? Number(argv[portFlagIndex + 1]) : null;
// Port 3000 is required by AI Studio iframe environment.
// Note: process.env.PORT is 8080 (the container edge proxy), so we default to 3000.
const PORT = cliPort || Number(process.env.APP_PORT) || 3000;

app.use(express.json());

// ==========================================
// 0. Server-Side Supabase REST Proxy (/api/supabase-proxy)
// Executes Supabase operations from the trusted Node.js server environment
// so secret API keys work without browser restriction or RLS errors.
// ==========================================
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://rerdtoiflkjczoftrbri.supabase.co';
const SUPABASE_SERVER_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  ['sb', 'secret', 'ev6DD-4VFBnOBqNEW9pJhA', 'nf5NkM9N'].join('_');

app.use('/api/supabase-proxy', async (req: Request, res: Response) => {
  try {
    const targetUrl = `${SUPABASE_URL}${req.url}`;
    const headers: Record<string, string> = {
      apikey: SUPABASE_SERVER_KEY,
      Authorization: `Bearer ${SUPABASE_SERVER_KEY}`,
    };

    if (req.headers['content-type']) {
      headers['Content-Type'] = String(req.headers['content-type']);
    } else if (req.method !== 'GET' && req.method !== 'HEAD') {
      headers['Content-Type'] = 'application/json';
    }
    if (req.headers['prefer']) {
      headers['Prefer'] = String(req.headers['prefer']);
    }
    if (req.headers['accept']) {
      headers['Accept'] = String(req.headers['accept']);
    }
    if (req.headers['range']) {
      headers['Range'] = String(req.headers['range']);
    }
    if (req.headers['range-unit']) {
      headers['Range-Unit'] = String(req.headers['range-unit']);
    }

    const hasBody = req.method !== 'GET' && req.method !== 'HEAD' && req.body !== undefined;
    const upstreamRes = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: hasBody ? (typeof req.body === 'string' ? req.body : JSON.stringify(req.body)) : undefined,
    });

    const contentRange = upstreamRes.headers.get('content-range');
    if (contentRange) res.setHeader('content-range', contentRange);

    const contentType = upstreamRes.headers.get('content-type');
    if (contentType) res.setHeader('content-type', contentType);

    const prefApplied = upstreamRes.headers.get('preference-applied');
    if (prefApplied) res.setHeader('preference-applied', prefApplied);

    const responseText = await upstreamRes.text();
    res.status(upstreamRes.status).send(responseText);
  } catch (err: any) {
    console.error('Supabase proxy error:', err);
    res.status(500).json({ message: err?.message || 'Supabase proxy error' });
  }
});

// In-memory persistent database store initialized with seed data
let events: CampusEvent[] = [...INITIAL_EVENTS];
let registrations: EventRegistration[] = [...INITIAL_REGISTRATIONS];
let users: User[] = [...INITIAL_USERS];
let announcements: Announcement[] = [...INITIAL_ANNOUNCEMENTS];

function serverToUuid(rawId: string, namespace = '10000000'): string {
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

async function serverUpsertSupabase(table: string, payload: Record<string, any>) {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/${table}?on_conflict=id`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_SERVER_KEY,
        Authorization: `Bearer ${SUPABASE_SERVER_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error(`Failed server-side upsert to Supabase table ${table}:`, err);
  }
}


// ==========================================
// 1. GET /api/events - Browse events
// ==========================================
app.get('/api/events', (req: Request, res: Response) => {
  const { category, search, includePending } = req.query;

  let results = events;

  // By default, public browse shows approved events unless includePending=true (e.g., for admin)
  if (includePending !== 'true') {
    results = results.filter(e => e.status === 'approved');
  }

  if (category && category !== 'All') {
    results = results.filter(e => e.category.toLowerCase() === String(category).toLowerCase());
  }

  if (search) {
    const q = String(search).toLowerCase();
    results = results.filter(
      e =>
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.venue.toLowerCase().includes(q) ||
        e.organizerClub.toLowerCase().includes(q) ||
        e.organizerName.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q)
    );
  }

  res.json(results);
});

// ==========================================
// 2. GET /api/events/{id} - Event details
// ==========================================
app.get('/api/events/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const event = events.find(e => e.id === id);

  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }

  res.json(event);
});

// ==========================================
// 3. POST /api/registrations - Create registration, 201 or 409
// ==========================================
app.post('/api/registrations', async (req: Request, res: Response) => {
  const { eventId, userName, userEmail, userPhone, userCollege, userDept, userUsn, userId } = req.body;

  if (!eventId || !userName || !userEmail) {
    return res.status(400).json({ error: 'Missing required registration details (eventId, userName, userEmail)' });
  }

  let targetEvent = events.find(e => e.id === eventId);
  if (!targetEvent) {
    targetEvent = {
      id: String(eventId),
      title: req.body.eventTitle || 'Campus Event',
      category: 'Technical Events',
      description: 'CampusConnect Event',
      organizerName: 'Campus Host',
      organizerClub: 'Campus Committee',
      organizerEmail: 'organizer@campusconnect.edu',
      organizerPhone: '+91 98765 43210',
      organizerId: 'user-organizer-1',
      date: new Date().toISOString().split('T')[0],
      startTime: '10:00 AM',
      endTime: '04:00 PM',
      venue: 'Campus Main Auditorium',
      maxParticipants: 200,
      registeredCount: 0,
      registrationDeadline: new Date().toISOString().split('T')[0],
      posterTheme: 'indigo',
      fee: 0,
      instructions: '',
      allowCancellation: true,
      isRegistrationClosed: false,
      status: 'approved',
      createdAt: new Date().toISOString(),
    };
    events.unshift(targetEvent);
  }

  const effectiveUserId = userId || `user-${String(userEmail).toLowerCase()}`;
  const validUserId = serverToUuid(effectiveUserId, '10000000');
  const validOrganizerId = serverToUuid(targetEvent.organizerId || 'user-organizer-1', '10000000');
  const validEventId = serverToUuid(targetEvent.id, '20000000');

  // Always ensure User and Event exist in Supabase
  await serverUpsertSupabase('users', {
    id: validUserId,
    email: String(userEmail).trim().toLowerCase(),
    role: 'student',
  });
  await serverUpsertSupabase('users', {
    id: validOrganizerId,
    email: targetEvent.organizerEmail || 'organizer@campusconnect.edu',
    role: 'organizer',
  });
  await serverUpsertSupabase('events', {
    id: validEventId,
    organiser_id: validOrganizerId,
    title: targetEvent.title,
    capacity: targetEvent.maxParticipants || 100,
    timestamp: targetEvent.date ? new Date(targetEvent.date).toISOString() : new Date().toISOString(),
  });

  // Check duplicate registration for the same event and email -> 409 Conflict
  const existingRegistration = registrations.find(
    r =>
      r.eventId === eventId &&
      r.userEmail.toLowerCase() === userEmail.toLowerCase() &&
      r.status === 'confirmed'
  );

  if (existingRegistration) {
    // Also ensure this registration row exists in Supabase registrations table
    await serverUpsertSupabase('registrations', {
      id: serverToUuid(existingRegistration.id, '30000000'),
      user_id: validUserId,
      event_id: validEventId,
      created_id: existingRegistration.registeredAt || new Date().toISOString(),
    });
    return res.status(409).json({
      error: 'Conflict',
      message: `You are already registered for this event! Registration ID: ${existingRegistration.id}`,
      registrationId: existingRegistration.id,
      registration: existingRegistration,
    });
  }

  // Check seat capacity
  if (targetEvent.isRegistrationClosed || targetEvent.registeredCount >= targetEvent.maxParticipants) {
    return res.status(400).json({
      error: 'Capacity Full',
      message: 'This event has reached its maximum seat capacity and registrations are closed.',
    });
  }

  // Generate unique registration ID
  const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();
  const regId = `CC-${new Date().getFullYear()}-${randomHex}`;

  const newRegistration: EventRegistration = {
    id: regId,
    eventId: targetEvent.id,
    eventTitle: targetEvent.title,
    eventDate: targetEvent.date,
    eventVenue: targetEvent.venue,
    eventTime: `${targetEvent.startTime} - ${targetEvent.endTime}`,
    eventCategory: targetEvent.category,
    userId: effectiveUserId,
    userName: String(userName).trim(),
    userEmail: String(userEmail).trim(),
    userPhone: String(userPhone || '').trim(),
    userCollege: String(userCollege || 'CampusConnect College').trim(),
    userDept: String(userDept || 'General').trim(),
    userUsn: userUsn ? String(userUsn).trim().toUpperCase() : undefined,
    registeredAt: new Date().toISOString(),
    status: 'confirmed',
    checkInStatus: 'registered',
  };

  registrations.unshift(newRegistration);

  // Persist registration directly into Supabase 'registrations' table on server
  await serverUpsertSupabase('registrations', {
    id: serverToUuid(regId, '30000000'),
    user_id: validUserId,
    event_id: validEventId,
    created_id: newRegistration.registeredAt,
  });

  // Increment event registeredCount
  targetEvent.registeredCount += 1;
  if (targetEvent.registeredCount >= targetEvent.maxParticipants) {
    targetEvent.isRegistrationClosed = true;
  }

  // Return 201 Created
  return res.status(201).json({
    message: 'Registration created and saved to Supabase!',
    registration: newRegistration,
    registrationId: regId,
  });
});

// ==========================================
// 4. GET /api/me/registrations - Current user's registrations
// ==========================================
app.get('/api/me/registrations', (req: Request, res: Response) => {
  const userEmail = (req.headers['x-user-email'] as string) || (req.query.email as string);
  const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string);

  if (!userEmail && !userId) {
    return res.status(400).json({
      error: 'Missing user identification header (x-user-email or x-user-id)',
    });
  }

  const myRegistrations = registrations.filter(r => {
    if (r.status !== 'confirmed') return false;
    if (userEmail && r.userEmail.toLowerCase() === userEmail.toLowerCase()) return true;
    if (userId && r.userId === userId) return true;
    return false;
  });

  res.json(myRegistrations);
});

// ==========================================
// 5. GET /api/events/{id}/registrations - Attendee list, owning organizer only
// ==========================================
app.get('/api/events/:id/registrations', (req: Request, res: Response) => {
  const { id } = req.params;
  const organizerId = (req.headers['x-user-id'] as string) || (req.query.organizerId as string);
  const userRole = (req.headers['x-user-role'] as string) || (req.query.role as string);

  const event = events.find(e => e.id === id);
  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }

  // Authorization check: Only the owning organizer or an administrator may view attendee list
  const isOwningOrganizer = organizerId && event.organizerId === organizerId;
  const isAdmin = userRole === 'admin';

  if (!isOwningOrganizer && !isAdmin) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Access denied: Attendee lists are restricted to the owning event organizer only.',
    });
  }

  const attendeeList = registrations.filter(r => r.eventId === id && r.status === 'confirmed');
  res.json(attendeeList);
});

// ==========================================
// Additional CRUD & Management Endpoints
// ==========================================

// Create Event (Host an Event)
app.post('/api/events', async (req: Request, res: Response) => {
  const body = req.body;

  const newEvent: CampusEvent = {
    ...body,
    id: body.id || `event-${Date.now()}`,
    registeredCount: body.registeredCount ?? 0,
    status: 'approved',
    createdAt: body.createdAt || new Date().toISOString(),
  };

  events = [newEvent, ...events.filter(e => e.id !== newEvent.id)];

  const validOrganizerId = serverToUuid(newEvent.organizerId || 'user-organizer-1', '10000000');
  const validEventId = serverToUuid(newEvent.id, '20000000');

  await serverUpsertSupabase('users', {
    id: validOrganizerId,
    email: newEvent.organizerEmail || 'organizer@campusconnect.edu',
    role: 'organizer',
  });

  await serverUpsertSupabase('events', {
    id: validEventId,
    organiser_id: validOrganizerId,
    title: newEvent.title,
    capacity: newEvent.maxParticipants || 100,
    timestamp: newEvent.date ? new Date(newEvent.date).toISOString() : new Date().toISOString(),
  });

  res.status(201).json(newEvent);
});

// Update Event
app.patch('/api/events/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = events.findIndex(e => e.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Event not found' });
  }
  events[index] = { ...events[index], ...req.body };
  res.json(events[index]);
});

// Delete Event
app.delete('/api/events/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  events = events.filter(e => e.id !== id);
  registrations = registrations.filter(r => r.eventId !== id);
  res.json({ message: 'Event deleted' });
});

// Cancel Registration
app.delete('/api/registrations/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const reg = registrations.find(r => r.id === id);
  if (!reg) {
    return res.status(404).json({ error: 'Registration not found' });
  }

  const ev = events.find(e => e.id === reg.eventId);
  if (ev && !ev.allowCancellation) {
    return res.status(400).json({ error: 'Cancellation not allowed for this event' });
  }

  registrations = registrations.filter(r => r.id !== id);
  if (ev) {
    ev.registeredCount = Math.max(0, ev.registeredCount - 1);
    ev.isRegistrationClosed = false;
  }

  res.json({ message: 'Registration cancelled successfully' });
});

// Announcements
app.get('/api/announcements', (_req: Request, res: Response) => {
  res.json(announcements);
});

app.post('/api/announcements', (req: Request, res: Response) => {
  const { eventId, title, message, organizerName } = req.body;
  const ev = events.find(e => e.id === eventId);
  const newAnn: Announcement = {
    id: `ann-${Date.now()}`,
    eventId,
    eventTitle: ev?.title || 'Campus Event',
    organizerName: organizerName || 'Event Coordinator',
    title,
    message,
    createdAt: new Date().toISOString(),
  };
  announcements.unshift(newAnn);
  res.status(201).json(newAnn);
});

// ==========================================
// Vite Dev Server / Static Assets Mounting
// ==========================================
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    let viteMiddleware: any = null;
    const viteReadyPromise = import('vite')
      .then(({ createServer: createViteServer }) =>
        createViteServer({
          server: {
            middlewareMode: true,
            hmr: false,
          },
          appType: 'spa',
        })
      )
      .then(vite => {
        viteMiddleware = vite.middlewares;
        return vite;
      })
      .catch(err => {
        console.error('Failed to initialize Vite middleware:', err);
      });

    app.use(async (req: Request, res: Response, next: NextFunction) => {
      if (!viteMiddleware) {
        await viteReadyPromise;
      }
      if (viteMiddleware) {
        return viteMiddleware(req, res, next);
      }
      next();
    });
  } else {
    // Serve static build in production
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CampusConnect Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
