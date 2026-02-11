const express = require('express');
const router = express.Router();
const { getAll, create, remove } = require('../controllers/hariLibur.controller');
const { authMiddleware, adminMiddleware } = require('../middleware/auth.middleware');

router.get('/', authMiddleware, getAll);
router.post('/', authMiddleware, adminMiddleware, create);
router.delete('/:id', authMiddleware, adminMiddleware, remove);

module.exports = router;
