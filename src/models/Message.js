const mongoose=require('mongoose');
const schema=new mongoose.Schema({event:{type:mongoose.Schema.Types.ObjectId,ref:'Event',required:true},sender:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},text:{type:String,required:true,trim:true,maxlength:1000}},{timestamps:true});
schema.set('toJSON',{transform:(_,r)=>{delete r.__v;return r}});
module.exports=mongoose.model('Message',schema);
