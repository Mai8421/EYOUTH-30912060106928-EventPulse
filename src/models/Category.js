const mongoose = require('mongoose');
const schema = new mongoose.Schema({name:{type:String,required:true,trim:true,unique:true},description:{type:String,trim:true}},{timestamps:true});
schema.set('toJSON',{transform:(_,r)=>{delete r.__v;return r}});
module.exports = mongoose.model('Category', schema);
