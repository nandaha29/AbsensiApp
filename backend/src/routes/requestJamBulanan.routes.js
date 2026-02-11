const express = require('express');
const router = express.Router();
const {
  submitJamBulanan,
  getPendingRequests,
  approveRejectRequest,
  getMyRequests,
} = require('../controllers/requestJamBulanan.controller');
const { authMiddleware, adminMiddleware } = require('../middleware/auth.middleware');

router.post('/submit', authMiddleware, submitJamBulanan);
router.get('/my-requests', authMiddleware, getMyRequests);
router.get('/pending', authMiddleware, adminMiddleware, getPendingRequests);
router.put('/:id/approve-reject', authMiddleware, adminMiddleware, approveRejectRequest);

module.exports = router;