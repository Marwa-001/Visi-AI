import express, { Router, Request, Response } from 'express';
import ScanModel from '../models/Scan.js';
import { captureWebsite } from '../services/screenshotService.js';
import { analyzeAccessibility } from '../services/accessibilityService.js';
import { analyzeReadability } from '../services/readabilityService.js';
import { analyzeWithGemini, analyzeLighthouse, generateRecommendations } from '../services/aiServices.js';
import { analyzeWithReimagineWeb } from '../services/reimagineService.js';

const router: Router = express.Router();

// POST /api/scan — Main endpoint with Lighthouse + Gemini
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

    console.log(`\n${'='.repeat(70)}`);
    console.log(`📊 HYBRID ANALYSIS: Lighthouse + Gemini + Readability`);
    console.log(`${'='.repeat(70)}\n`);
    console.log(`🔗 URL: ${url}\n`);

    // Step 1: Capture website
    console.log('⏳ Step 1: Capturing website screenshot...');
    const { screenshot, html, textContent, domElements } = await captureWebsite(url);
    console.log('✅ Website captured\n');

    // Step 2: Run Lighthouse Analysis (most accurate for accessibility)
    console.log('⏳ Step 2: Running Google Lighthouse analysis...');
    const lighthouseResult = await analyzeLighthouse(url);
    console.log('✅ Lighthouse analysis completed\n');

    // Step 3: Analyze Readability
    console.log('⏳ Step 3: Analyzing readability...');
    const readabilityResult = analyzeReadability(textContent);
    console.log(`   Score: ${readabilityResult.score}`);
    console.log('✅ Readability analyzed\n');

    // Step 4: Gemini Visual Analysis
    console.log('⏳ Step 4: Running Gemini visual analysis...');
    const geminiAnalysis = await analyzeWithGemini(screenshot);
    console.log(`   Clarity Score: ${geminiAnalysis.clarityScore}`);
    console.log('✅ Gemini analysis completed\n');

    // Step 5: ReimagineWeb Analysis (optional UX metrics)
    console.log('⏳ Step 5: Running ReimagineWeb analysis...');
    const reimagineResult = await analyzeWithReimagineWeb(url);
    console.log('✅ ReimagineWeb analysis completed\n');

    // Step 6: Calculate Final Scores
    console.log('⏳ Step 6: Computing final scores...');
    
    const visualClarityScore = geminiAnalysis.clarityScore;
    const accessibilityScore = lighthouseResult.accessibilityScore;
    const readabilityScore = readabilityResult.score;
    const performanceScore = lighthouseResult.performanceScore;
    const reimagineScore = reimagineResult.score;

    console.log(`\n📊 Individual Scores:`);
    console.log(`   Visual Clarity (Gemini): ${visualClarityScore}`);
    console.log(`   Accessibility (Lighthouse): ${accessibilityScore}`);
    console.log(`   Readability: ${readabilityScore}`);
    console.log(`   Performance (Lighthouse): ${performanceScore}`);
    console.log(`   Reimagine UX: ${reimagineScore}`);

    // Weighted overall score
    const overallScore = Math.round(
      visualClarityScore * 0.20 +
      accessibilityScore * 0.30 +
      readabilityScore * 0.20 +
      performanceScore * 0.15 +
      reimagineScore * 0.15
    );

    console.log(`\n   📈 OVERALL SCORE: ${overallScore}/100\n`);

    // Step 7: Generate Recommendations
    console.log('⏳ Step 7: Generating recommendations...');
    const recommendations = generateRecommendations(
      accessibilityScore,
      readabilityScore,
      geminiAnalysis.visualIssues,
      lighthouseResult.accessibilityIssues,
      domElements
    );
    console.log(`✅ Generated ${recommendations.length} recommendations\n`);

    // Step 8: Prepare heatmap data
    const heatmapData = {
      zones: geminiAnalysis.attentionZones,
      maxIntensity: 1.0
    };

    // Step 9: Save to MongoDB
    console.log('⏳ Step 9: Saving scan to database...');
    const scan = new ScanModel({
      url,
      screenshot,
      scores: {
        visualClarity: Math.round(visualClarityScore),
        accessibility: Math.round(accessibilityScore),
        readability: Math.round(readabilityScore),
        reimagineUX: Math.round(reimagineScore),
        focusAccuracy: Math.round(performanceScore),
        overall: overallScore
      },
      metrics: {
        colorContrast: {
          passAA: accessibilityScore > 70,
          passAAA: accessibilityScore > 85,
          issues: lighthouseResult.accessibilityIssues
        },
        textReadability: {
          fleschScore: readabilityResult.fleschScore,
          gradeLevel: readabilityResult.gradeLevel,
          issues: readabilityResult.issues
        },
        accessibility: {
          missingAlt: 0,
          ariaIssues: lighthouseResult.accessibilityIssues.length,
          keyboardNav: accessibilityScore > 75,
          issues: lighthouseResult.accessibilityIssues
        },
        reimagineWeb: reimagineResult.metrics,
        lighthouse: {
          performance: lighthouseResult.performanceScore,
          accessibility: lighthouseResult.accessibilityScore,
          bestPractices: lighthouseResult.bestPracticesScore,
          seo: lighthouseResult.seoScore
        }
      },
      aiAnalysis: {
        visualIssues: geminiAnalysis.visualIssues,
        layoutProblems: geminiAnalysis.layoutProblems,
        attentionZones: geminiAnalysis.attentionZones
      },
      recommendations,
      heatmapData
    });

    await scan.save();
    console.log('✅ Scan saved to database');
    console.log(`${'='.repeat(70)}\n`);

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

export default router;