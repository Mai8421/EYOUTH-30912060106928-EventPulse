const AppError = require('../src/utils/AppError');
const asyncHandler = require('../src/utils/asyncHandler');

test('AppError keeps status and details', () => {
  const e = new AppError('Bad', 422, [{ field: 'name' }]);
  expect(e.message).toBe('Bad');
  expect(e.statusCode).toBe(422);
  expect(e.isOperational).toBe(true);
});

test('asyncHandler forwards rejection', async () => {
  const next = jest.fn();
  await asyncHandler(async () => {
    throw new Error('boom');
  })({}, {}, next);
  expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'boom' }));
});

test('asyncHandler supports success', async () => {
  const next = jest.fn();
  await asyncHandler(async (_q, res) => res.send('ok'))({}, { send: jest.fn() }, next);
  expect(next).not.toHaveBeenCalled();
});
