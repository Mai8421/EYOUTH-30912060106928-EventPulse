const r=require('express').Router();const {body,param}=require('express-validator');const c=require('../controllers/categoryController');const a=require('../middleware/auth');const v=require('../middleware/validate');const h=require('../utils/asyncHandler');
r.route('/').get(h(c.list)).post(a.requireAuth,a.requireRole('admin'),[body('name').trim().notEmpty(),body('description').optional().trim()],v,h(c.create));
r.route('/:id').get(param('id').isMongoId(),v,h(c.get));
module.exports=r;
