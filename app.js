const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const { celebrate, Joi, errors } = require('celebrate');
const {
  login,
  createUser,
} = require('./controllers/users');
const auth = require('./middlewares/auth');
const error = require('./middlewares/error');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const NotFoundError = require('./errors/404-error');

const { PORT = 3000 } = process.env;

const app = express();
mongoose.connect('mongodb://localhost:27017/mestodb');

app.use(requestLogger);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet());

const allowedCors = [
  'https://praktikum.tk',
  'http://praktikum.tk',
  'localhost:3000/',
  'http://localhost:3000/',
  'https://localhost:3000/',
  'http://51.250.70.197:3000',
  'https://51.250.70.197:3000',
  'http://api.mesto.natasha.snezh.nomoredomains.xyz/',
  'https://api.mesto.natasha.snezh.nomoredomains.xyz/',
  'http://mesto.natasha.snezh.nomoredomains.xyz/',
  'https://mesto.natasha.snezh.nomoredomains.xyz/',
];

app.use((req, res, next) => {
  const { origin } = req.headers;
  if (allowedCors.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }

  const { method } = req;
  const DEFAULT_ALLOWED_METHODS = 'GET,HEAD,PUT,PATCH,POST,DELETE';
  const requestHeaders = req.headers['access-control-request-headers'];
  if (method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', DEFAULT_ALLOWED_METHODS);
    res.header('Access-Control-Allow-Headers', requestHeaders);
    return res.end();
  }

  return next();
});

app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), login);

app.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().pattern(
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\\+~#=]+\.[a-zA-Z0-9()]+([-a-zA-Z0-9()@:%_\\+.~#?&/=#]*)/,
    ),
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), createUser);
app.use('/users', auth, require('./routes/users'));
app.use('/cards', auth, require('./routes/cards'));

app.all('*', auth, () => {
  throw new NotFoundError('Ошибка 404. Страница не найдена');
});

app.use(errorLogger);
app.use(errors());
app.use(error);

app.listen(PORT);
