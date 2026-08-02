const Registration = require('../models/Registration');
const Event = require('../models/Event');
const AppError = require('../utils/AppError');

exports.create = async (req, res) => {
  const { eventId } = req.params;
  const event = await Event.findOneAndUpdate(
    { _id: eventId, $expr: { $lt: ['$registrationCount', '$capacity'] } },
    { $inc: { registrationCount: 1 } },
    { new: true }
  );

  if (!event) {
    if (!(await Event.exists({ _id: eventId }))) throw new AppError('Event not found', 404);
    throw new AppError('Event is full', 409);
  }

  try {
    const record = await Registration.create({ user: req.user.id, event: event.id });
    const data = await record.populate({ path: 'event', populate: { path: 'category' } });
    res.status(201).json({ success: true, data });
  } catch (e) {
    await Event.findByIdAndUpdate(event.id, { $inc: { registrationCount: -1 } });
    if (e.code === 11000) throw new AppError('Already registered for this event', 409);
    throw e;
  }
};

exports.mine = async (req, res) => {
  const data = await Registration.find({ user: req.user.id }).populate({
    path: 'event',
    populate: { path: 'category' },
  });
  res.json({ success: true, data });
};

exports.cancel = async (req, res) => {
  const record = await Registration.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  if (!record) throw new AppError('Registration not found or not owned by you', 404);
  await Event.findByIdAndUpdate(record.event, { $inc: { registrationCount: -1 } });
  res.status(204).send();
};
