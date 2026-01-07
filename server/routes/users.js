const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getUsers, getCurrentUser, updateCurrentUser, updateUserRole, getUserStats } = require('../controllers/userController');

router.get('/', auth, getUsers);
router.get('/me', auth, getCurrentUser);
router.patch('/me', auth, updateCurrentUser);
router.get('/stats', auth, getUserStats);
router.patch('/:id/role', auth, updateUserRole);

module.exports = router;
