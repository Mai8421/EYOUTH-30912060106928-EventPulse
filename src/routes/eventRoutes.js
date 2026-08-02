const { Router } = require('express');
const { body, param, query } = require('express-validator');
const c = require('../controllers/eventController');
const m = require('../controllers/messageController');
const { requireAuth, requireRole } = require('../middleware/auth');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');

const router = Router();

const createFields = [
  body('name').trim().notEmpty(),
  body('description').trim().notEmpty(),
  body('date').isISO8601(),
  body('city').trim().notEmpty(),
  body('capacity').isInt({ min: 1 }),
  body('category').isMongoId(),
];

const updateFields = [
  body('name').optional().trim().notEmpty(),
  body('description').optional().trim().notEmpty(),
  body('date').optional().isISO8601(),
  body('city').optional().trim().notEmpty(),
  body('capacity').optional().isInt({ min: 1 }),
  body('category').optional().isMongoId(),
];

const listFields = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('category').optional().isMongoId(),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('sort').optional().isIn(['date', '-date', 'popular']),
];

router
  .route('/')
  .get(listFields, validate, asyncHandler(c.list))
  .post(requireAuth, requireRole('admin'), createFields, validate, asyncHandler(c.create));

router
  .route('/:id')
  .get(param('id').isMongoId(), validate, asyncHandler(c.get))
  .patch(
    requireAuth,
    requireRole('admin'),
    param('id').isMongoId(),
    updateFields,
    validate,
    asyncHandler(c.update)
  )
  .delete(
    requireAuth,
    requireRole('admin'),
    param('id').isMongoId(),
    validate,
    asyncHandler(c.remove)
  );

router
  .route('/:eventId/messages')
  .get(param('eventId').isMongoId(), validate, asyncHandler(m.list))
  .post(
    requireAuth,
    requireRole('admin'),
    param('eventId').isMongoId(),
    body('text').trim().notEmpty().isLength({ max: 1000 }),
    validate,
    asyncHandler(m.create)
  );

module.exports = router;
