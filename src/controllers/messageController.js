const Message = require('../models/Message');
const Event = require('../models/Event');
const AppError = require('../utils/AppError');

exports.create = async (req, res) => {
  const { eventId } = req.params;
  if (!(await Event.exists({ _id: eventId }))) {
    throw new AppError('Event not found', 404);
  }
  const msg = await (
    await Message.create({ event: eventId, sender: req.user.id, text: req.body.text })
  ).populate('sender', 'name role');

  req.app.get('io')?.to(`event:${eventId}`).emit('announcement', msg);
  res.status(201).json({ success: true, data: msg });
};

exports.list = async (req, res) => {
  const data = await Message.find({ event: req.params.eventId })
    .populate('sender', 'name role')
    .sort({ createdAt: 1 });
  res.json({ success: true, data });
};
