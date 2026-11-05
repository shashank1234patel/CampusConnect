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

// In-memory persistent database store initialized with seed data
let events: CampusEvent[] = [...INITIAL_EVENTS];
let registrations: EventRegistration[] = [...INITIAL_REGISTRATIONS];
let users: User[] = [...INITIAL_USERS];
let announcements: Announcement[] = [...INITIAL_ANNOUNCEMENTS];

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
app.post('/api/registrations', (req: Request, res: Response) => {
  const { eventId, userName, userEmail, userPhone, userCollege, userDept, userUsn, userId } = req.body;

  if (!eventId || !userName || !userEmail) {
    return res.status(400).json({ error: 'Missing required registration details (eventId, userName, userEmail)' });
  }

  const targetEvent = events.find(e => e.id === eventId);
  if (!targetEvent) {
    return res.status(404).json({ error: 'Event not found' });
  }

  // Check duplicate registration for the same event and email -> 409 Conflict
  const existingRegistration = registrations.find(
    r =>
      r.eventId === eventId &&
      r.userEmail.toLowerCase() === userEmail.toLowerCase() &&
      r.status === 'confirmed'
  );

  if (existingRegistration) {
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
    userId: userId || `user-${Date.now()}`,
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

  // Increment event registeredCount
  targetEvent.registeredCount += 1;
  if (targetEvent.registeredCount >= targetEvent.maxParticipants) {
    targetEvent.isRegistrationClosed = true;
  }

  // Return 201 Created
  return res.status(201).json({
    message: 'Registration created successfully',
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
app.post('/api/events', (req: Request, res: Response) => {
  const body = req.body;
  const userRole = req.headers['x-user-role'] as string;
  const isAdmin = userRole === 'admin';

  const newEvent: CampusEvent = {
    ...body,
    id: `event-${Date.now()}`,
    registeredCount: 0,
    status: isAdmin ? 'approved' : 'pending',
    createdAt: new Date().toISOString(),
  };

  events.unshift(newEvent);
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
