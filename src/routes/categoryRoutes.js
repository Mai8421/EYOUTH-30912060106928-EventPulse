const { Router } = require('express');
const { body, param } = require('express-validator');
const c = require('../controllers/categoryController');
const { requireAuth, requireRole } = require('../middleware/auth');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');

const router = Router();

router
  .route('/')
  .get(asyncHandler(c.list))
  .post(
    requireAuth,
    requireRole('admin'),
    [body('name').trim().notEmpty(), body('description').optional().trim()],
    validate,
    asyncHandler(c.create)
  );

router.route('/:id').get(param('id').isMongoId(), validate, asyncHandler(c.get));

module.exports = router;
