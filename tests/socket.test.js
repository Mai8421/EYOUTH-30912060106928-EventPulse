process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-long-enough';
jest.setTimeout(180000);

const http = require('http');
const { Server } = require('socket.io');
const { io: ioClient } = require('socket.io-client');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const User = require('../src/models/User');
const Category = require('../src/models/Category');
const Event = require('../src/models/Event');
const Message = require('../src/models/Message');

let mongo, httpServer, io, admin, attendee, event, port;

const tokenFor = (u) => jwt.sign({ id: u.id, role: u.role }, process.env.JWT_SECRET);

const connect = (t) =>
  new Promise((resolve, reject) => {
    const s = ioClient(`http://localhost:${port}`, {
      auth: { token: t },
      transports: ['websocket'],
      timeout: 5000,
    });
    s.on('connect', () => resolve(s));
    s.on('connect_error', (e) => {
      s.disconnect();
      reject(e);
    });
  });

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());

  admin = await User.create({ name: 'Admin', email: 'admin@socket.test', password: 'password1', role: 'admin' });
  attendee = await User.create({ name: 'Guest', email: 'guest@socket.test', password: 'password1' });
  const category = await Category.create({ name: 'Tech' });
  event = await Event.create({
    name: 'Socket Event',
    description: 'Event for socket tests',
    date: '2027-09-01',
    city: 'Cairo',
    capacity: 20,
    category: category.id,
    createdBy: admin.id,
  });

  httpServer = http.createServer(app);
  io = new Server(httpServer, { cors: { origin: '*' } });
  app.set('io', io);

  io.use((socket, next) => {
    try {
      socket.user = jwt.verify(socket.handshake.auth?.token, process.env.JWT_SECRET);
      next();
    } catch {
      next(new Error('Authentication required'));
    }
  });

  io.on('connection', (socket) => {
    socket.on('join-event', async (id, ack = () => {}) => {
      try {
        if (!(await Event.exists({ _id: id }))) {
          return ack({ success: false, message: 'Event not found' });
        }
        socket.join(`event:${id}`);
        ack({ success: true, room: `event:${id}` });
      } catch {
        ack({ success: false, message: 'Unable to join event' });
      }
    });

    socket.on('broadcast', async (payload = {}, ack = () => {}) => {
      try {
        if (socket.user.role !== 'admin') return ack({ success: false, message: 'Forbidden' });
        const ev = await Event.findById(payload.eventId);
        if (!ev) return ack({ success: false, message: 'Event not found' });
        const text = String(payload.text || '').trim();
        if (!text || text.length > 1000) return ack({ success: false, message: 'Invalid announcement' });
        const msg = await Message.create({ event: ev.id, sender: socket.user.id, text });
        io.to(`event:${ev.id}`).emit('announcement', msg);
        ack({ success: true, data: msg });
      } catch {
        ack({ success: false, message: 'Unable to broadcast' });
      }
    });
  });

  await new Promise((resolve) => httpServer.listen(0, resolve));
  port = httpServer.address().port;
});

afterAll(async () => {
  io.close();
  await new Promise((resolve) => httpServer.close(resolve));
  if (mongoose.connection.readyState) await mongoose.disconnect();
  if (mongo) await mongo.stop();
});

test('connection without a token is rejected', async () => {
  await expect(connect(undefined)).rejects.toBeDefined();
});

test('connection with a valid token succeeds', async () => {
  const s = await connect(tokenFor(attendee));
  expect(s.connected).toBe(true);
  s.disconnect();
});

test('join-event acknowledges success for an existing event', async () => {
  const s = await connect(tokenFor(attendee));
  const ack = await new Promise((resolve) => s.emit('join-event', event.id, resolve));
  expect(ack.success).toBe(true);
  expect(ack.room).toBe(`event:${event.id}`);
  s.disconnect();
});

test('join-event acknowledges failure for a non-existent event', async () => {
  const s = await connect(tokenFor(attendee));
  const fakeId = new mongoose.Types.ObjectId().toString();
  const ack = await new Promise((resolve) => s.emit('join-event', fakeId, resolve));
  expect(ack.success).toBe(false);
  s.disconnect();
});

test('admin broadcast is received by listeners in the event room', async () => {
  const listener = await connect(tokenFor(attendee));
  await new Promise((resolve) => listener.emit('join-event', event.id, resolve));
  const announcement = new Promise((resolve) => listener.once('announcement', resolve));

  const broadcaster = await connect(tokenFor(admin));
  const ack = await new Promise((resolve) =>
    broadcaster.emit('broadcast', { eventId: event.id, text: 'Test announcement' }, resolve)
  );
  expect(ack.success).toBe(true);

  const msg = await announcement;
  expect(msg.text).toBe('Test announcement');
  listener.disconnect();
  broadcaster.disconnect();
});

test('attendee cannot broadcast an announcement', async () => {
  const s = await connect(tokenFor(attendee));
  const ack = await new Promise((resolve) =>
    s.emit('broadcast', { eventId: event.id, text: 'Unauthorized' }, resolve)
  );
  expect(ack.success).toBe(false);
  s.disconnect();
});
