const Category = require('../models/Category');
const AppError = require('../utils/AppError');

exports.list = async (req, res) => {
  const data = await Category.find().sort('name');
  res.json({ success: true, data });
};

exports.create = async (req, res) => {
  const data = await Category.create(req.body);
  res.status(201).json({ success: true, data });
};

exports.get = async (req, res) => {
  const item = await Category.findById(req.params.id);
  if (!item) throw new AppError('Category not found', 404);
  res.json({ success: true, data: item });
};
