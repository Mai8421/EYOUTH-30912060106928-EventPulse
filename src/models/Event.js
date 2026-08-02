const mongoose=require('mongoose');
const schema=new mongoose.Schema({name:{type:String,required:true,trim:true,index:'text'},description:{type:String,required:true,trim:true,index:'text'},date:{type:Date,required:true},city:{type:String,required:true,trim:true,index:true},capacity:{type:Number,required:true,min:1},registrationCount:{type:Number,default:0,min:0},category:{type:mongoose.Schema.Types.ObjectId,ref:'Category',required:true,index:true},createdBy:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true}},{timestamps:true});
schema.index({name:'text',description:'text'});
module.exports=mongoose.model('Event',schema);
