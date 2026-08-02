const Event = require('../models/Event');
require('../models/Category');
const Registration = require('../models/Registration');
const Message = require('../models/Message');
const AppError = require('../utils/AppError');

exports.create = async (req, res) => {
  const data = await (
    await Event.create({ ...req.body, createdBy: req.user.id })
  ).populate('category');
  res.status(201).json({ success: true, data });
};

exports.list = async (req, res) => {
  const { category, city, startDate, endDate, search, sort = 'date', page = 1, limit = 10 } =
    req.query;

  const q = {};
  if (category) q.category = category;
  if (city) q.city = new RegExp(`^${city.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
  if (startDate || endDate) {
    q.date = {
      ...(startDate && { $gte: new Date(startDate) }),
      ...(endDate && { $lte: new Date(endDate) }),
    };
  }
  if (search) q.$text = { $search: search };

  const pageNo = Math.max(Number(page) || 1, 1);
  const size = Math.min(Math.max(Number(limit) || 10, 1), 100);
  const sortBy =
    sort === 'popular'
      ? { registrationCount: -1, date: 1 }
      : sort === '-date'
      ? { date: -1 }
      : { date: 1 };

  const [items, total] = await Promise.all([
    Event.find(q).populate('category').sort(sortBy).skip((pageNo - 1) * size).limit(size),
    Event.countDocuments(q),
  ]);

  res.json({
    success: true,
    data: items,
    meta: { total, page: pageNo, limit: size, pages: Math.ceil(total / size) },
  });
};

exports.get = async (req, res) => {
  const item = await Event.findById(req.params.id).populate('category');
  if (!item) throw new AppError('Event not found', 404);
  res.json({ success: true, data: item });
};

exports.update = async (req, res) => {
  const item = await Event.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate('category');
  if (!item) throw new AppError('Event not found', 404);
  res.json({ success: true, data: item });
};

exports.remove = async (req, res) => {
  const item = await Event.findByIdAndDelete(req.params.id);
  if (!item) throw new AppError('Event not found', 404);
  await Promise.all([
    Registration.deleteMany({ event: req.params.id }),
    Message.deleteMany({ event: req.params.id }),
  ]);
  res.status(204).send();
};
