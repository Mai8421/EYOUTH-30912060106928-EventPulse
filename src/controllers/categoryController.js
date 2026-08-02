const Category=require('../models/Category');const AppError=require('../utils/AppError');
exports.list=async(req,res)=>res.json({success:true,data:await Category.find().sort('name')});
exports.create=async(req,res)=>res.status(201).json({success:true,data:await Category.create(req.body)});
exports.get=async(req,res)=>{const item=await Category.findById(req.params.id);if(!item)throw new AppError('Category not found',404);res.json({success:true,data:item})};
