const express = require('express');
const router = express.Router();
const { 
  getAll, 
  getById, 
  create, 
  update, 
  remove, 
  getDepartemen 
} = require('../controllers/pegawai.controller');
const { authMiddleware, adminMiddleware } = require('../middleware/auth.middleware');

router.get('/', authMiddleware, getAll);
router.get('/departemen', authMiddleware, getDepartemen);
router.get('/:id', authMiddleware, getById);
router.post('/', authMiddleware, adminMiddleware, create);
router.put('/:id', authMiddleware, adminMiddleware, update);
router.delete('/:id', authMiddleware, adminMiddleware, remove);

module.exports = router;
