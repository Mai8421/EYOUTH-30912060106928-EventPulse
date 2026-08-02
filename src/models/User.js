const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const schema = new mongoose.Schema({name:{type:String,required:true,trim:true},email:{type:String,required:true,unique:true,lowercase:true,trim:true},password:{type:String,required:true,minlength:8,select:false},role:{type:String,enum:['admin','attendee'],default:'attendee'}},{timestamps:true});
schema.pre('save',async function(){if(this.isModified('password')) this.password=await bcrypt.hash(this.password,12)});
schema.methods.comparePassword=function(value){return bcrypt.compare(value,this.password)};
schema.set('toJSON',{transform:(_d,r)=>{delete r.password;delete r.__v;return r}});
module.exports=mongoose.model('User',schema);
