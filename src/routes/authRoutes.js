const r=require('express').Router();const {body}=require('express-validator');const c=require('../controllers/authController');const a=require('../middleware/auth');const v=require('../middleware/validate');const h=require('../utils/asyncHandler');
r.post('/register',[body('name').trim().notEmpty(),body('email').isEmail().normalizeEmail(),body('password').isLength({min:8})],v,h(c.register));
r.post('/login',[body('email').isEmail().normalizeEmail(),body('password').notEmpty()],v,h(c.login));r.get('/me',a.requireAuth,h(c.me));module.exports=r;
