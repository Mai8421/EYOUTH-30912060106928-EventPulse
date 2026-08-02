const { Router } = require('express');
const { param } = require('express-validator');
const c = require('../controllers/registrationController');
const { requireAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');

const router = Router();

router.use(requireAuth);

router.get('/', asyncHandler(c.mine));

router.post(
  '/events/:eventId',
  param('eventId').isMongoId(),
  validate,
  asyncHandler(c.create)
);

router.delete('/:id', param('id').isMongoId(), validate, asyncHandler(c.cancel));

module.exports = router;
