import express from 'express';
import { authenticate } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';

const router = express.Router();

// Get user profile
router.get('/profile', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    // User is already attached by auth middleware
    res.json({
      success: true,
      data: {
        id: req.user?.id,
        email: req.user?.email,
        firstName: req.user?.firstName,
        lastName: req.user?.lastName,
        role: req.user?.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Update user profile
router.put('/profile', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    // Placeholder for profile update
    res.json({
      success: true,
      message: 'Profile update endpoint (to be implemented)'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router; 