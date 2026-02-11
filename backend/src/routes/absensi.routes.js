const express = require('express');
const router = express.Router();
const { 
  checkIn, 
  checkOut, 
  getTodayStatus, 
  getHistory, 
  getTodayAll,
  updateAbsensi 
} = require('../controllers/absensi.controller');
const { authMiddleware, adminMiddleware } = require('../middleware/auth.middleware');

router.post('/check-in', authMiddleware, checkIn);
router.post('/check-out', authMiddleware, checkOut);
router.get('/today/:pegawaiId', authMiddleware, getTodayStatus);
router.get('/today', authMiddleware, getTodayAll);
router.get('/history', authMiddleware, getHistory);
router.put('/:id', authMiddleware, adminMiddleware, updateAbsensi);

module.exports = router;
