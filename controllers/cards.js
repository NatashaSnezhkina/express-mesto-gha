const Card = require('../models/card');
const NotFoundError = require('../errors/404-error');
const IncorrectDataError = require('../errors/400-error');

module.exports.getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch((err) => res.status(500)
      .send({ message: err.message }));
};

module.exports.createCard = (req, res, err, next) => {
  const { name, link } = req.body;

  Card.create({ name, link, owner: req.user._id })
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Карточка с указанным _id не найдена');
      } else if (err.name === 'CastError' || err.name === 'ValidationError') {
        throw new IncorrectDataError('Переданы некорректные данные при создании карточки');
      }
      res.send({ data: card });
    })
    .catch(next);
};

module.exports.deleteCard = (req, res, err, next) => {
  Card.findByIdAndRemove(req.params.cardId)
    .orFail(new Error('NotValid'))
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Карточка с указанным _id не найдена');
      } else if (err.name === 'CastError' || err.name === 'ValidationError') {
        throw new IncorrectDataError('Переданы некорректные данные при создании карточки');
      }
      res.send({ data: card });
    })
    .catch(next);
};

module.exports.likeCard = (req, res, err, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } }, // добавить _id
    { new: true }, // обновленный объект
  )
    .orFail(new Error('NotValid'))
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Передан несуществующий _id карточки');
      } else if (err.name === 'CastError' || err.name === 'ValidationError') {
        throw new IncorrectDataError('Переданы некорректные данные для постановки лайка');
      }
      res.send({ data: card });
    })
    .catch(next);
};

module.exports.dislikeCard = (req, res, err, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .orFail(new Error('NotValid'))
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Передан несуществующий _id карточки');
      } else if (err.name === 'CastError' || err.name === 'ValidationError') {
        throw new IncorrectDataError('Переданы некорректные данные для постановки лайка');
      }
      res.send({ data: card });
    })
    .catch(next);
};
