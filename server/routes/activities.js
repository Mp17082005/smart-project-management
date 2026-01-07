const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getActivity, getProjectActivity, getStats } = require('../controllers/activityController');

router.get('/', auth, getActivity);
router.get('/stats', auth, getStats);
router.get('/project/:projectId', auth, getProjectActivity);

module.exports = router;
