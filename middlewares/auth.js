const jwt = require('jsonwebtoken');
const AuthError = require('../errors/401-error');

const JWT_SECRET = 'secret-key';

module.exports = (req, res, next) => {
  const token = req.cookies.jwt;
  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    throw new AuthError('Вы не авторизованы');
  }

  req.user = payload;
  next();
};
