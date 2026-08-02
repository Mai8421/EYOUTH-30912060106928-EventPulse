const AppError=require('../utils/AppError');
const notFound=(req,_res,next)=>next(new AppError(`Route ${req.method} ${req.originalUrl} not found`,404));
const errorHandler=(err,_req,res,_next)=>{let status=err.statusCode||500;let message=err.message||'Internal server error';if(err.name==='CastError'){status=404;message='Resource not found'}if(err.code===11000){status=409;message=`Duplicate value for ${Object.keys(err.keyValue||{}).join(', ')}`}res.status(status).json({success:false,message,...(err.details&&{errors:err.details}),...(process.env.NODE_ENV==='development'&&{stack:err.stack})})};
module.exports={notFound,errorHandler};
