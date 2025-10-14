import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface AIAnalysisResult {
  visualIssues: string[];
  layoutProblems: string[];
  attentionZones: any[];
  clarityScore: number;
  aiProvider?: string;
}

export interface LighthouseResult {
  accessibilityScore: number;
  performanceScore: number;
  bestPracticesScore: number;
  seoScore: number;
  accessibilityIssues: string[];
}

// ========================================
// GOOGLE LIGHTHOUSE API ANALYSIS
// ========================================
export const analyzeLighthouse = async (url: string): Promise<LighthouseResult> => {
  try {
    const LIGHTHOUSE_API_KEY = process.env.LIGHTHOUSE_API_KEY;

    if (!LIGHTHOUSE_API_KEY) {
      console.warn('⚠️ Lighthouse API key not found');
      return getDefaultLighthouseResult();
    }

    console.log('🔦 [LIGHTHOUSE] Analyzing with Google Lighthouse API...');

    const response = await axios.get(
      `https://www.googleapis.com/pagespeedonline/v5/runPagespeed`,
      {
        params: {
          url: url,
          key: LIGHTHOUSE_API_KEY,
          category: ['performance', 'accessibility', 'best-practices', 'seo']
        },
        timeout: 60000,
        headers: {
          'Referer': 'http://localhost:5000'
        }
      }
    );

    const lighthouse = response.data.lighthouseResult;
    if (!lighthouse) {
      console.error('❌ [LIGHTHOUSE] No lighthouse result in response');
      return getDefaultLighthouseResult();
    }

    const audits = lighthouse.audits || {};
    const accessibilityIssues: string[] = [];

    if (audits['color-contrast']?.score < 1) {
      accessibilityIssues.push('Low color contrast - fails WCAG standards');
    }
    if (audits['image-alt']?.score < 1) {
      accessibilityIssues.push('Missing alt text on images');
    }
    if (audits['aria-allowed-attr']?.score < 1) {
      accessibilityIssues.push('Invalid ARIA attributes detected');
    }
    if (audits['aria-required-attr']?.score < 1) {
      accessibilityIssues.push('Missing required ARIA attributes');
    }
    if (audits['form-field-multiple-labels']?.score < 1) {
      accessibilityIssues.push('Form fields missing proper labels');
    }
    if (audits['label']?.score < 1) {
      accessibilityIssues.push('Form inputs without associated labels');
    }
    if (audits['link-name']?.score < 1) {
      accessibilityIssues.push('Links without descriptive text');
    }
    if (audits['document-title']?.score < 1) {
      accessibilityIssues.push('Page missing document title');
    }

    const categories = lighthouse.categories || {};

    const result: LighthouseResult = {
      accessibilityScore: Math.round((categories.accessibility?.score || 0) * 100),
      performanceScore: Math.round((categories.performance?.score || 0) * 100),
      bestPracticesScore: Math.round((categories['best-practices']?.score || 0) * 100),
      seoScore: Math.round((categories.seo?.score || 0) * 100),
      accessibilityIssues
    };

    console.log('✅ [LIGHTHOUSE] Analysis completed');
    console.log(`   Accessibility: ${result.accessibilityScore}`);
    console.log(`   Performance: ${result.performanceScore}`);
    console.log(`   Best Practices: ${result.bestPracticesScore}`);
    console.log(`   SEO: ${result.seoScore}`);

    return result;
  } catch (error: any) {
    console.error('❌ [LIGHTHOUSE] Error:', error.response?.status, error.message);
    if (error.response?.data) {
      console.error('   Response:', error.response.data);
    }
    return getDefaultLighthouseResult();
  }
};

// ========================================
// GEMINI API VISUAL ANALYSIS (Using SDK)
// ========================================
export const analyzeWithGemini = async (screenshot: string): Promise<AIAnalysisResult> => {
  const visualIssues: string[] = [];
  const layoutProblems: string[] = [];
  const attentionZones: any[] = [];
  let clarityScore = 75;

  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
      console.warn('⚠️ Gemini API key not found');
      return getDefaultAIAnalysis();
    }

    console.log('🤖 [GEMINI] Calling Google Gemini Vision API with SDK...');

    // Initialize with Google Generative AI SDK
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    // Use gemini-2.5-flash - the latest model available with vision support
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Remove data URI prefix
    let base64Image = screenshot;
    if (screenshot.includes('base64,')) {
      base64Image = screenshot.split('base64,')[1];
    }

    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: 'image/jpeg',
      },
    };

    const textPart = `You are a web design expert analyzing a website screenshot. Provide ONLY a JSON response with no additional text.

{
  "visualIssues": ["issue1", "issue2", "issue3"],
  "layoutProblems": ["problem1", "problem2"],
  "clarityScore": 75,
  "attentionZones": [
    {"area": "header", "intensity": 0.9, "x": 50, "y": 20},
    {"area": "main-content", "intensity": 0.7, "x": 50, "y": 50},
    {"area": "sidebar", "intensity": 0.5, "x": 80, "y": 50},
    {"area": "footer", "intensity": 0.3, "x": 50, "y": 80}
  ]
}`;

    const result = await model.generateContent([imagePart, textPart]);
    const response = await result.response;
    const responseText = response.text();

    if (!responseText) {
      console.error('❌ [GEMINI] No response from API');
      return getDefaultAIAnalysis();
    }

    let analysisData;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      analysisData = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('❌ [GEMINI] Failed to parse response:', parseError);
      console.error('   Raw response:', responseText.substring(0, 300));
      return getDefaultAIAnalysis();
    }

    if (analysisData.visualIssues && Array.isArray(analysisData.visualIssues)) {
      visualIssues.push(...analysisData.visualIssues.slice(0, 5));
    }
    if (analysisData.layoutProblems && Array.isArray(analysisData.layoutProblems)) {
      layoutProblems.push(...analysisData.layoutProblems.slice(0, 5));
    }
    if (typeof analysisData.clarityScore === 'number') {
      clarityScore = Math.min(100, Math.max(0, analysisData.clarityScore));
    }
    if (analysisData.attentionZones && Array.isArray(analysisData.attentionZones)) {
      attentionZones.push(
        ...analysisData.attentionZones.map((zone: any) => ({
          area: zone.area || 'unknown',
          intensity: Math.min(1, Math.max(0, zone.intensity || 0.5)),
          x: zone.x || 50,
          y: zone.y || 50
        }))
      );
    }

    console.log('✅ [GEMINI] Analysis completed');
    return {
      visualIssues: visualIssues.length > 0 ? visualIssues : ['Consider improving visual hierarchy'],
      layoutProblems: layoutProblems.length > 0 ? layoutProblems : ['Ensure adequate whitespace'],
      attentionZones: attentionZones.length > 0 ? attentionZones : getDefaultZones(),
      clarityScore,
      aiProvider: 'Gemini'
    };
  } catch (error: any) {
    console.error('❌ [GEMINI] Error:', error.message);
    return getDefaultAIAnalysis();
  }
};

// ========================================
// HELPER FUNCTIONS
// ========================================
const getDefaultZones = () => [
  { x: 50, y: 20, intensity: 0.9, area: 'header' },
  { x: 50, y: 50, intensity: 0.7, area: 'main-content' },
  { x: 80, y: 50, intensity: 0.5, area: 'sidebar' },
  { x: 50, y: 80, intensity: 0.3, area: 'footer' }
];

const getDefaultAIAnalysis = (): AIAnalysisResult => ({
  visualIssues: ['Visual analysis unavailable - using defaults'],
  layoutProblems: ['Layout analysis unavailable - using defaults'],
  attentionZones: getDefaultZones(),
  clarityScore: 70,
  aiProvider: 'Fallback'
});

const getDefaultLighthouseResult = (): LighthouseResult => ({
  accessibilityScore: 70,
  performanceScore: 70,
  bestPracticesScore: 70,
  seoScore: 70,
  accessibilityIssues: []
});

// ========================================
// GENERATE RECOMMENDATIONS
// ========================================
export const generateRecommendations = (
  lighthouseAccessibility: number,
  readabilityScore: number,
  visualIssues: string[],
  lighthouseIssues: string[],
  domElements: any
): string[] => {
  const recommendations: string[] = [];

  if (lighthouseAccessibility < 80) {
    if (lighthouseIssues.length > 0) {
      recommendations.push(...lighthouseIssues.slice(0, 3));
    }
    recommendations.push('Review WCAG 2.1 accessibility guidelines');
  }

  if (lighthouseAccessibility < 60) {
    recommendations.push('Conduct full accessibility audit with axe DevTools');
    recommendations.push('Test with screen readers (NVDA, JAWS)');
  }

  if (readabilityScore < 60) {
    recommendations.push('Simplify complex sentences for better readability');
    recommendations.push('Break long paragraphs into shorter chunks (3-4 sentences)');
    recommendations.push('Use bullet points to improve content scanability');
  }

  if (readabilityScore < 40) {
    recommendations.push('Consider rewriting content for a general audience');
  }

  if (visualIssues.length > 0) {
    recommendations.push('Increase contrast between text and background');
    recommendations.push('Ensure consistent spacing and alignment throughout');
    recommendations.push('Improve visual hierarchy with clear heading structure');
  }

  recommendations.push('Ensure all images have descriptive alt text');
  recommendations.push('Add skip navigation links for keyboard users');
  recommendations.push('Test with keyboard navigation only');
  recommendations.push('Validate HTML and CSS for errors');
  recommendations.push('Optimize images for faster loading');
  recommendations.push('Ensure CTA buttons are 44x44px minimum');

  return recommendations.slice(0, 10);
};