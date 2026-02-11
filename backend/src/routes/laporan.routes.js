const express = require('express');
const router = express.Router();
const { 
  getMonthlyReport, 
  exportCSV, 
  exportPDF, 
  getDashboardStats 
} = require('../controllers/laporan.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

router.get('/monthly', authMiddleware, getMonthlyReport);
router.get('/export/csv', authMiddleware, exportCSV);
router.get('/export/pdf', authMiddleware, exportPDF);
router.get('/dashboard', authMiddleware, getDashboardStats);

module.exports = router;
