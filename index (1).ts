import express from 'express';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { createDemoSession, readDemoSession, setDemoSession } from './session';
import {
  createReservation,
  createReservationInputSchema,
  ensureReservationSchema,
  getUserReservations,
} from './reservationStore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
    console.error('[Server] Refusing to start: JWT_SECRET must be set in production.');
    process.exitCode = 1;
    return;
  }

  const app = express();
  const server = createServer(app);
  app.use(express.json({ limit: '32kb' }));

  try {
    await ensureReservationSchema();
  } catch (error) {
    console.error('[Reservations] Schema initialization failed:', error);
  }

  app.post('/api/session/demo', (req, res) => {
    const email = typeof req.body?.email === 'string' ? req.body.email : '';
    const session = createDemoSession(email);
    if (!session) {
      res.status(401).json({ code: 'DEMO_USER_NOT_ALLOWED', message: 'This demo identity is not recognized.' });
      return;
    }
    setDemoSession(res, session.token);
    res.json({ user: session.user });
  });

  app.post('/api/reservations', async (req, res) => {
    const session = readDemoSession(req);
    if (!session) {
      res.status(401).json({ code: 'UNAUTHORIZED', message: 'Start a recognized CurbSense demo session first.' });
      return;
    }
    const parsed = createReservationInputSchema.safeParse({
      ...req.body,
      userId: session.userId,
      userName: session.userName,
      permitStatus: session.permitStatus,
    });
    if (!parsed.success) {
      res.status(400).json({ code: 'VALIDATION_ERROR', message: 'Reservation details are invalid.', issues: parsed.error.flatten() });
      return;
    }

    try {
      const receipt = await createReservation(parsed.data);
      res.status(201).json({ receipt });
    } catch (error) {
      const status = typeof error === 'object' && error && 'status' in error && typeof error.status === 'number' ? error.status : 500;
      const code = typeof error === 'object' && error && 'code' in error && typeof error.code === 'string' ? error.code : 'RESERVATION_FAILED';
      const message = status >= 500 ? 'Reservation could not be completed right now.' : error instanceof Error ? error.message : 'Reservation could not be completed.';
      console.error('[Reservations] Create failed:', { code, status });
      res.status(status).json({ code, message });
    }
  });

  app.delete('/api/reservations/:id', async (req, res) => {
    const session = readDemoSession(req);
    if (!session) {
      res.status(401).json({ code: 'UNAUTHORIZED', message: 'Start a recognized CurbSense demo session first.' });
      return;
    }
    if (!process.env.DATABASE_URL) {
      res.status(503).json({ code: 'DATABASE_UNAVAILABLE', message: 'Reservation database is not configured.' });
      return;
    }
    const db = (await import('mysql2/promise')).default.createConnection({ uri: process.env.DATABASE_URL, timezone: 'Z' });
    const connection = await db;
    try {
      const [result] = await connection.execute<any>(
        `UPDATE curb_reservations SET status = 'cancelled' WHERE id = ? AND user_id = ? AND status = 'held'`,
        [req.params.id, session.userId]
      );
      if (result.affectedRows !== 1) {
        res.status(404).json({ code: 'RESERVATION_NOT_FOUND', message: 'Reservation could not be cancelled.' });
        return;
      }
      res.json({ success: true });
    } finally {
      await connection.end();
    }
  });

  app.get('/api/reservations', async (req, res) => {
    const session = readDemoSession(req);
    if (!session) {
      res.status(401).json({ code: 'UNAUTHORIZED', message: 'Start a recognized CurbSense session first.' });
      return;
    }
    try {
      res.json({ reservations: await getUserReservations(session.role === 'admin' ? undefined : session.userId) });
    } catch (error) {
      console.error('[Reservations] List failed:', error);
      res.status(500).json({ code: 'RESERVATION_LIST_FAILED', message: 'Reservations could not be loaded.' });
    }
  });

  // Serve static files from dist/public in production.
  const staticPath = process.env.NODE_ENV === 'production'
    ? path.resolve(__dirname, 'public')
    : path.resolve(__dirname, '..', 'dist', 'public');
  app.use(express.static(staticPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
  });

  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch((error) => {
  console.error('[Server] Startup failed:', error);
  process.exitCode = 1;
});
