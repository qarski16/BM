const authMiddleware = require('../middleware/authMiddleware');
const jwt = require('jsonwebtoken');

let req, res, next;

beforeEach(() => {
  req = { header: jest.fn() };
  res = { 
    status: jest.fn().mockReturnThis(), 
    json: jest.fn() 
  };
  next = jest.fn();
});

describe('Auth Middleware', () => {
  // Test jika token valid
  test('Harus lolos (next) jika token valid', () => {
    const validToken = jwt.sign({ user: { id: '123', role: 'admin' } }, 'rahasia_kurir_123');
    req.header.mockReturnValue(`Bearer ${validToken}`);
    
    authMiddleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  // Test jika tidak ada token
  test('Harus return 401 jika tidak ada token', () => {
    req.header.mockReturnValue(null);
    
    authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });
});