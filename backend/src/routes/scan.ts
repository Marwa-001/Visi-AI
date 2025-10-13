// const express = require('express');
// import type { Request, Response } from 'express';
// const Scan = require('../models/Scan');
// const { captureWebsite } = require('../services/screenshotService');
// const { analyzeAccessibility } = require('../services/accessibilityService');
// const { analyzeReadability } = require('../services/readabilityService');
// const { analyzeWithAI, generateRecommendations } = require('../services/aiService');
// const { analyzeWithReimagineWeb } = require('../services/reimagineService');

// const router = express.Router();

// // Ensure JSON body parsing middleware is used
// router.use(express.json());

// router.post('/', async (req: Request, res: Response) => {
//   try {
//     const { url } = req.body;
//     if (!url) {
//       return res.status(400).json({ error: 'URL is required' });
//     }

//     // Validate URL
//     try {
//       new URL(url);
//     } catch {
//       return res.status(400).json({ error: 'Invalid URL format' });
//     }

//     console.log(`📸 Starting analysis for: ${url}`);

//     // Step 1: Capture screenshot and DOM
//     const { screenshot, html, textContent, domElements } = await captureWebsite(url);
//     console.log('✅ Screenshot captured');

//     // Step 2: Analyze accessibility
//     const accessibilityResult = analyzeAccessibility(html, domElements);
//     console.log('✅ Accessibility analyzed');

//     // Step 3: Analyze readability
//     const readabilityResult = analyzeReadability(textContent);
//     console.log('✅ Readability analyzed');

//     // Step 4: AI visual analysis
//     const aiAnalysis = await analyzeWithAI(screenshot);
//     console.log('✅ AI analysis completed');

//     // Step 5: ReimagineWeb analysis
//     const reimagineResult = await analyzeWithReimagineWeb(url);
//     console.log('✅ ReimagineWeb analysis completed');

//     // Step 6: Calculate overall scores
//     const visualClarityScore = aiAnalysis.clarityScore;
//     const accessibilityScore = accessibilityResult.score;
//     const readabilityScore = readabilityResult.score;
//     const reimagineScore = reimagineResult.score;
//     const focusAccuracy = 70 + Math.random() * 20; // Simulated

//     const overallScore = Math.round(
//       (visualClarityScore * 0.25 +
//         accessibilityScore * 0.25 +
//         readabilityScore * 0.20 +
//         reimagineScore * 0.20 +
//         focusAccuracy * 0.10)
//     );

//     // Step 7: Generate recommendations
//     const recommendations = generateRecommendations(
//       accessibilityScore,
//       readabilityScore,
//       aiAnalysis.visualIssues,
//       domElements
//     );

//     // Step 8: Generate heatmap data
//     const heatmapData = {
//       zones: aiAnalysis.attentionZones,
//       maxIntensity: 1.0
//     };

//     // Step 9: Save to MongoDB
//     const scan = new Scan({
//       url,
//       screenshot,
//       scores: {
//         visualClarity: Math.round(visualClarityScore),
//         accessibility: Math.round(accessibilityScore),
//         readability: Math.round(readabilityScore),
//         reimagineUX: Math.round(reimagineScore),
//         focusAccuracy: Math.round(focusAccuracy),
//         overall: overallScore
//       },
//       metrics: {
//         colorContrast: {
//           passAA: accessibilityScore > 70,
//           passAAA: accessibilityScore > 85,
//           issues: accessibilityResult.contrastIssues
//         },
//         textReadability: {
//           fleschScore: readabilityResult.fleschScore,
//           gradeLevel: readabilityResult.gradeLevel,
//           issues: readabilityResult.issues
//         },
//         accessibility: {
//           missingAlt: accessibilityResult.missingAlt,
//           ariaIssues: accessibilityResult.ariaIssues,
//           keyboardNav: accessibilityScore > 75,
//           issues: accessibilityResult.issues
//         },
//         reimagineWeb: reimagineResult.metrics
//       },
//       aiAnalysis: {
//         visualIssues: aiAnalysis.visualIssues,
//         layoutProblems: aiAnalysis.layoutProblems,
//         attentionZones: aiAnalysis.attentionZones
//       },
//       recommendations,
//       heatmapData
//     });

//     await scan.save();
//     console.log('✅ Scan saved to database');

//     res.json({
//       success: true,
//       scanId: scan._id,
//       data: scan
//     });

//   } catch (error: any) {
//     console.error('❌ Scan error:', error);
//     res.status(500).json({
//       error: 'Failed to analyze website',
//       message: error.message
//     });
//   }
// });

// module.exports  = router;

import express, { Router, Request, Response } from 'express';
import ScanModel from '../models/Scan.js';
import { captureWebsite } from '../services/screenshotService.js';
import { analyzeAccessibility } from '../services/accessibilityService.js';
import { analyzeReadability } from '../services/readabilityService.js';
import { analyzeWithAI, generateRecommendations } from '../services/aiServices.js';
import { analyzeWithReimagineWeb } from '../services/reimagineService.js';


const router: Router = express.Router();

// POST /api/scan — Main endpoint
router.post('/', async (req: Request, res: Response) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });

    // Validate URL
    try {
      new URL(url);
    } catch {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    console.log(`📸 Starting analysis for: ${url}`);

    // Step 1: Capture screenshot and DOM
    const { screenshot, html, textContent, domElements } = await captureWebsite(url);
    console.log('✅ Screenshot captured');

    // Step 2: Accessibility Analysis
    const accessibilityResult = analyzeAccessibility(html, domElements);
    console.log('✅ Accessibility analyzed');

    // Step 3: Readability Analysis
    const readabilityResult = analyzeReadability(textContent);
    console.log('✅ Readability analyzed');

    // Step 4: AI Visual Analysis
    const aiAnalysis = await analyzeWithAI(screenshot);
    console.log('✅ AI analysis completed');

    // Step 5: ReimagineWeb Analysis
    const reimagineResult = await analyzeWithReimagineWeb(url);
    console.log('✅ ReimagineWeb analysis completed');

    // Step 6: Compute Scores
    const visualClarityScore = aiAnalysis.clarityScore;
    const accessibilityScore = accessibilityResult.score;
    const readabilityScore = readabilityResult.score;
    const reimagineScore = reimagineResult.score;
    const focusAccuracy = 70 + Math.random() * 20;

    const overallScore = Math.round(
      visualClarityScore * 0.25 +
        accessibilityScore * 0.25 +
        readabilityScore * 0.2 +
        reimagineScore * 0.2 +
        focusAccuracy * 0.1
    );

    // Step 7: Recommendations
    const recommendations = generateRecommendations(
      accessibilityScore,
      readabilityScore,
      aiAnalysis.visualIssues,
      domElements
    );

    // Step 8: Heatmap Data
    const heatmapData = {
      zones: aiAnalysis.attentionZones,
      maxIntensity: 1.0
    };

    // Step 9: Save to MongoDB
    const scan = new ScanModel({
      url,
      screenshot,
      scores: {
        visualClarity: Math.round(visualClarityScore),
        accessibility: Math.round(accessibilityScore),
        readability: Math.round(readabilityScore),
        reimagineUX: Math.round(reimagineScore),
        focusAccuracy: Math.round(focusAccuracy),
        overall: overallScore
      },
      metrics: {
        colorContrast: {
          passAA: accessibilityScore > 70,
          passAAA: accessibilityScore > 85,
          issues: accessibilityResult.contrastIssues
        },
        textReadability: {
          fleschScore: readabilityResult.fleschScore,
          gradeLevel: readabilityResult.gradeLevel,
          issues: readabilityResult.issues
        },
        accessibility: {
          missingAlt: accessibilityResult.missingAlt,
          ariaIssues: accessibilityResult.ariaIssues,
          keyboardNav: accessibilityScore > 75,
          issues: accessibilityResult.issues
        },
        reimagineWeb: reimagineResult.metrics
      },
      aiAnalysis: {
        visualIssues: aiAnalysis.visualIssues,
        layoutProblems: aiAnalysis.layoutProblems,
        attentionZones: aiAnalysis.attentionZones
      },
      recommendations,
      heatmapData
    });

    await scan.save();
    console.log('✅ Scan saved to database');

    res.json({
      success: true,
      scanId: scan._id,
      data: scan
    });
  } catch (error: any) {
    console.error('❌ Scan error:', error);
    res.status(500).json({
      error: 'Failed to analyze website',
      message: error.message
    });
  }
});

// ✅ Default export for ES Modules
export default router;


