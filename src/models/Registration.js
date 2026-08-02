const mongoose=require('mongoose');
const schema=new mongoose.Schema({user:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},event:{type:mongoose.Schema.Types.ObjectId,ref:'Event',required:true}},{timestamps:true});
schema.index({user:1,event:1},{unique:true});
schema.set('toJSON',{transform:(_,r)=>{delete r.__v;return r}});
module.exports=mongoose.model('Registration',schema);
