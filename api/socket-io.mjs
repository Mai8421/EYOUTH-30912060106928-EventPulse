import 'dotenv/config';
import http from 'http';
import jwt from 'jsonwebtoken';
import { Server } from 'socket.io';
import connectDB from '../src/config/db.js';
import User from '../src/models/User.js';
import Event from '../src/models/Event.js';
import Message from '../src/models/Message.js';

const server = http.createServer();

const io = new Server(server, {
  path: '/api/socket-io',
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
      await message.populate('sender', 'name role');
      io.to(`event:${event.id}`).emit('announcement', message);
      acknowledge({ success: true, data: message });
    } catch (_error) {
      acknowledge({ success: false, message: 'Unable to broadcast announcement' });
    }
  });
});

export default server;
