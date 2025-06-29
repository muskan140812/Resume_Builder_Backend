// import express from 'express';
// import { authenticate } from '../middleware/auth';
// import { AuthenticatedRequest } from '../types';

// const router = express.Router();

// // Analyze resume for ATS compatibility
// router.post('/analyze', authenticate, async (req: AuthenticatedRequest, res) => {
//   try {
//     res.json({
//       success: true,
//       data: {
//         score: 85,
//         analysis: {
//           keywordMatch: 80,
//           formatting: 90,
//           completeness: 85,
//           readability: 88
//         },
//         suggestions: [
//           'Add more relevant keywords',
//           'Improve skills section',
//           'Add quantifiable achievements'
//         ]
//       },
//       message: 'ATS analysis endpoint (to be implemented)'
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Server error'
//     });
//   }
// });

// // Get ATS analysis history
// router.get('/history', authenticate, async (req: AuthenticatedRequest, res) => {
//   try {
//     res.json({
//       success: true,
//       data: [],
//       message: 'ATS history endpoint (to be implemented)'
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Server error'
//     });
//   }
// });

// // Parse job description for keywords
// router.post('/parse-job', authenticate, async (req: AuthenticatedRequest, res) => {
//   try {
//     res.json({
//       success: true,
//       data: {
//         keywords: ['React', 'Node.js', 'JavaScript', 'MongoDB'],
//         requirements: ['3+ years experience', 'Team collaboration', 'Problem solving'],
//         skills: ['React', 'Node.js', 'Database management']
//       },
//       message: 'Job description parsing endpoint (to be implemented)'
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Server error'
//     });
//   }
// });

// export default router; 


import express from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import { authenticate } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';
import { analyzeResumeText } from '../utils/atsAnalyzer';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// ✅ Upload and analyze PDF resume
router.post('/upload', upload.single('resume'), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ success: false, error: 'No file uploaded' });
    return;
  }

  try {
    const data = await pdfParse(req.file.buffer);
    const text = data.text;

    const result = analyzeResumeText(text);

    res.status(200).json({
      success: true,
      atsScore: result.score,
      matchedKeywords: result.matchedKeywords,
      missingKeywords: result.missingKeywords,
      extractedText: text,
    });
    return;
  } catch (error) {
    console.error('ATS analysis failed:', error);
    res.status(500).json({ success: false, error: 'Failed to analyze resume' });
    return;
  }
});

// 🔒 Analyze resume text directly
router.post('/analyze', async (req: AuthenticatedRequest, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      res.status(400).json({ success: false, error: 'Text is required' });
      return;
    }

    const result = analyzeResumeText(text);

    res.json({
      success: true,
      data: {
        atsScore: result.score,
        matchedKeywords: result.matchedKeywords,
        missingKeywords: result.missingKeywords,
        feedback: result,
      },
    });
    return;
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
    return;
  }
});

// 🔒 History placeholder
router.get('/history', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    res.json({
      success: true,
      data: [],
      message: 'ATS history endpoint (to be implemented)',
    });
    return;
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
    return;
  }
});

// 🔒 Job description parser placeholder
router.post('/parse-job', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    res.json({
      success: true,
      data: {
        keywords: ['React', 'Node.js', 'JavaScript', 'MongoDB'],
        requirements: ['3+ years experience', 'Team collaboration', 'Problem solving'],
        skills: ['React', 'Node.js', 'Database management'],
      },
      message: 'Job description parsing endpoint (to be implemented)',
    });
    return;
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
    return;
  }
});

export default router;
