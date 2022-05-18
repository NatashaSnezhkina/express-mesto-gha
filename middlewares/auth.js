const jwt = require('jsonwebtoken');
const AuthError = require('../errors/401-error');

const { NODE_ENV, JWT_SECRET } = process.env;

// const JWT_SECRET = 'secret-key';

module.exports = (req, res, next) => {
  const token = req.cookies.jwt;
  let payload;
  try {
    payload = jwt.verify(token, `${NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret'}`);
  } catch (err) {
    throw new AuthError('Вы не авторизованы');
  }

  req.user = payload;
  next();
};
