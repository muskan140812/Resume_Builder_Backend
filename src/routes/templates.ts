import express from 'express';
import { authenticate, optionalAuth } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';

const router = express.Router();

// Get all templates (public endpoint with optional auth)
router.get('/', optionalAuth, async (req: AuthenticatedRequest, res) => {
  try {
    res.json({
      success: true,
      data: [
        {
          id: '1',
          name: 'Modern Professional',
          category: 'modern',
          description: 'Clean and modern template for professionals',
          preview: '/templates/modern-preview.png'
        },
        {
          id: '2',
          name: 'Classic Traditional',
          category: 'classic',
          description: 'Traditional format suitable for conservative industries',
          preview: '/templates/classic-preview.png'
        },
        {
          id: '3',
          name: 'ATS-Friendly',
          category: 'ats',
          description: 'Optimized for Applicant Tracking Systems',
          preview: '/templates/ats-preview.png'
        }
      ],
      message: 'Templates retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get template by ID
router.get('/:id', optionalAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    res.json({
      success: true,
      data: {
        id,
        name: 'Template ' + id,
        structure: {}
      },
      message: 'Template details endpoint (to be implemented)'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router; 