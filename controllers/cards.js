const Card = require('../models/card');

module.exports.getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch((err) => res.status(500)
      .send({ message: err.message }));
};

module.exports.createCard = (req, res) => {
  const { name, link } = req.body;

  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.send({ data: card }))
    .catch((err) => res.status(400).send({ message: err.message }));
};

module.exports.deleteCard = (req, res) => {
  Card.findByIdAndRemove(req.params.cardId)
    .orFail(new Error('NotValid'))
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.message === 'NotValid') {
        res.status(404).send({ message: 'Карточка с указанным _id не найдена' });
      } else if (err.name === 'CastError' || err.name === 'ValidationError') {
        res.status(400).send({ message: 'Переданы некорректные данные при создании карточки' });
      } else {
        res.status(500).send({ message: err.message });
      }
    });
};

module.exports.likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } }, // добавить _id
    { new: true }, // обновленный объект
  )
    .orFail(new Error('NotValid'))
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.message === 'NotValid') {
        res.status(404).send({ message: 'Передан несуществующий _id карточки' });
      } else {
        res.status(400).send({ message: 'Переданы некорректные данные для постановки лайка' });
      }
    });
};

module.exports.dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .orFail(new Error('NotValid'))
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.message === 'NotValid') {
        res.status(404).send({ message: 'Передан несуществующий _id карточки' });
      } else {
        res.status(400).send({ message: 'Переданы некорректные данные для постановки лайка' });
      }
    });
};
