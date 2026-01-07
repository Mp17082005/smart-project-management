const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getTasks, createTask, updateTaskStatus, updateTask, deleteTask } = require('../controllers/taskController');

router.get('/:projectId', auth, getTasks);
router.post('/', auth, createTask);
router.patch('/:id/status', auth, updateTaskStatus);
router.put('/:id', auth, updateTask);
router.delete('/:id', auth, deleteTask);

module.exports = router;
