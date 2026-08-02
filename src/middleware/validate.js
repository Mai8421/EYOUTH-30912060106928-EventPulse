const {validationResult}=require('express-validator'); const AppError=require('../utils/AppError');
module.exports=(req,_res,next)=>{const errors=validationResult(req);if(errors.isEmpty())return next();next(new AppError('Validation failed',422,errors.array().map(({path,msg,value})=>({field:path,message:msg,value}))));};
