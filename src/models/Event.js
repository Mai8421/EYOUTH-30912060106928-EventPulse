const mongoose=require('mongoose');
const schema=new mongoose.Schema({name:{type:String,required:true,trim:true},description:{type:String,required:true,trim:true},date:{type:Date,required:true},city:{type:String,required:true,trim:true,index:true},capacity:{type:Number,required:true,min:1},registrationCount:{type:Number,default:0,min:0},category:{type:mongoose.Schema.Types.ObjectId,ref:'Category',required:true,index:true},createdBy:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true}},{timestamps:true});
schema.index({name:'text',description:'text'});
schema.set('toJSON',{transform:(_,r)=>{delete r.__v;return r}});
module.exports=mongoose.model('Event',schema);
