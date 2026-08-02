const { Router } = require('express');
const { body } = require('express-validator');
const c = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');

const router = Router();

router.post(
  '/register',
  [
    body('name').trim().notEmpty(),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
  ],
  validate,
  asyncHandler(c.register)
);

router.post(
  '/login',
  [body('email').isEmail().normalizeEmail(), body('password').notEmpty()],
  validate,
  asyncHandler(c.login)
);

router.get('/me', requireAuth, asyncHandler(c.me));

module.exports = router;
