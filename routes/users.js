const router = require('express').Router();
const {
  getUser,
  getUsers,
  updateUser,
  updateAvatar,
  getUserById,
} = require('../controllers/users');

router.get('/', getUsers);
router.get('/me', getUser);
router.get('/:userId', getUserById);
router.patch('/me', updateUser);
router.patch('/me/avatar', updateAvatar);

module.exports = router;
