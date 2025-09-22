const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { searchAll, getFilterOptions } = require('../controllers/searchController');

// All search routes require authentication
router.use(auth);

// Search projects and tasks
router.get('/', searchAll);

// Get filter options
router.get('/filters', getFilterOptions);

module.exports = router;
