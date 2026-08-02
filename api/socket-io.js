require('dotenv').config();
const http = require('http');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');
const connectDB = require('../src/config/db');
const User = require('../src/models/User');
const Event = require('../src/models/Event');
const Message = require('../src/models/Message');

const server = http.createServer((_req, res) => {
  res.writeHead(200, { 'content-type': 'application/json' });
  res.end(JSON.stringify({ service: 'EventPulse Socket.io', status: 'ok' }));
});

const io = new Server(server, {
  cors: { origin: process.env.CLIENT_ORIGIN || '*' },
  transports: ['websocket']
});

io.use(async (socket, next) => {
  try {
    await connectDB();
    const payload = jwt.verify(socket.handshake.auth?.token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id);
    if (!user) return next(new Error('Authentication required'));
    socket.user = user;
    next();
  } catch (_error) {
    next(new Error('Authentication required'));
  }
});

io.on('connection', (socket) => {
  socket.on('join-event', async (eventId, acknowledge = () => {}) => {
    try {
      if (!await Event.exists({ _id: eventId })) return acknowledge({ success: false, message: 'Event not found' });
      socket.join(`event:${eventId}`);
      acknowledge({ success: true, room: `event:${eventId}` });
    } catch (_error) {
      acknowledge({ success: false, message: 'Unable to join event' });
    }
  });

  socket.on('broadcast', async (payload = {}, acknowledge = () => {}) => {
    try {
      if (socket.user.role !== 'admin') return acknowledge({ success: false, message: 'Forbidden' });
      const event = await Event.findById(payload.eventId);
      if (!event) return acknowledge({ success: false, message: 'Event not found' });
      const text = String(payload.text || '').trim();
      if (!text || text.length > 1000) return acknowledge({ success: false, message: 'Invalid announcement' });
      const message = await Message.create({ event: event.id, sender: socket.user.id, text });
      io.to(`event:${event.id}`).emit('announcement', message);
      acknowledge({ success: true, data: message });
    } catch (_error) {
      acknowledge({ success: false, message: 'Unable to broadcast announcement' });
    }
  });
});

module.exports = server;
