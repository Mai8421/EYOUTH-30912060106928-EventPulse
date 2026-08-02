const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');

const tokenFor = (u) =>
  jwt.sign({ id: u.id, role: u.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

exports.register = async (req, res) => {
  const user = await User.create({ ...req.body, role: 'attendee' });
  res.status(201).json({ success: true, data: { user, token: tokenFor(user) } });
};

exports.login = async (req, res) => {
  const user = await User.findOne({ email: req.body.email }).select('+password');
  if (!user || !(await user.comparePassword(req.body.password))) {
    throw new AppError('Invalid email or password', 401);
  }
  res.json({ success: true, data: { user, token: tokenFor(user) } });
};

exports.me = async (req, res) => {
  res.json({ success: true, data: req.user });
};
