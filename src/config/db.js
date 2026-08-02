const mongoose = require('mongoose');

async function connectDB(uri = process.env.MONGODB_URI) {
  if (!uri) throw new Error('MONGODB_URI is not configured');
  mongoose.set('strictQuery', true);
  return mongoose.connect(uri);
}

module.exports = connectDB;
