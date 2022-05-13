const Card = require('../models/card');
const NotFoundError = require('../errors/404-error');
const IncorrectDataError = require('../errors/400-error');
const ForbiddenError = require('../errors/403-error');

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch(next);
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
      res.send({
        name: card.name,
        link: card.link,
        owner: card.owner,
        likes: card.likes,
        _id: card._id,
        createdAt: card.createdAt,
      });
    })
    .catch(next);
};

module.exports.deleteCard = (req, res, next) => {
  Card.findById(req.params.cardId)
    .orFail(() => {
      throw new NotFoundError('Карточка не найдена');
    })
    .then((card) => {
      if (req.user._id !== card.owner.toString()) {
        throw new ForbiddenError('Вы не можете удалять чужие карточки');
      }

      Card.findByIdAndRemove(req.params.cardId)
        .then((deletedCard) => {
          res.send({
            name: deletedCard.name,
            link: deletedCard.link,
            owner: deletedCard.owner,
            likes: deletedCard.likes,
            _id: deletedCard._id,
            createdAt: deletedCard.createdAt,
          });
        })
        .catch(next);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new IncorrectDataError('Переданы некорректные данные при удалении карточки'));
      }
      next(err);
    });
};

module.exports.likeCard = (req, res, err, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } }, // добавить _id
    { new: true }, // обновленный объект
  )
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
