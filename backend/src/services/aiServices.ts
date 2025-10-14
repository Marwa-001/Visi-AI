import axios from 'axios';

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
        timeout: 60000
      }
    );

    const lighthouse = response.data.lighthouseResult;
    const audits = lighthouse.audits;

    // Extract accessibility issues
    const accessibilityIssues: string[] = [];

    // Check for common accessibility issues
    if (audits['color-contrast'] && audits['color-contrast'].score < 1) {
      accessibilityIssues.push('Low color contrast - fails WCAG standards');
    }
    if (audits['image-alt'] && audits['image-alt'].score < 1) {
      accessibilityIssues.push('Missing alt text on images');
    }
    if (audits['aria-allowed-attr'] && audits['aria-allowed-attr'].score < 1) {
      accessibilityIssues.push('Invalid ARIA attributes detected');
    }
    if (audits['aria-required-attr'] && audits['aria-required-attr'].score < 1) {
      accessibilityIssues.push('Missing required ARIA attributes');
    }
    if (audits['form-field-multiple-labels'] && audits['form-field-multiple-labels'].score < 1) {
      accessibilityIssues.push('Form fields missing proper labels');
    }
    if (audits['label'] && audits['label'].score < 1) {
      accessibilityIssues.push('Form inputs without associated labels');
    }
    if (audits['link-name'] && audits['link-name'].score < 1) {
      accessibilityIssues.push('Links without descriptive text');
    }
    if (audits['document-title'] && audits['document-title'].score < 1) {
      accessibilityIssues.push('Page missing document title');
    }

    const result: LighthouseResult = {
      accessibilityScore: Math.round(lighthouse.categories.accessibility.score * 100),
      performanceScore: Math.round(lighthouse.categories.performance.score * 100),
      bestPracticesScore: Math.round(lighthouse.categories['best-practices'].score * 100),
      seoScore: Math.round(lighthouse.categories.seo.score * 100),
      accessibilityIssues
    };

    console.log('✅ [LIGHTHOUSE] Analysis completed');
    console.log(`   Accessibility: ${result.accessibilityScore}`);
    console.log(`   Performance: ${result.performanceScore}`);
    console.log(`   Best Practices: ${result.bestPracticesScore}`);
    console.log(`   SEO: ${result.seoScore}`);

    return result;
  } catch (error: any) {
    console.error('❌ [LIGHTHOUSE] Error:', error.message);
    return getDefaultLighthouseResult();
  }
};

// ========================================
// GEMINI API VISUAL ANALYSIS
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

    console.log('🤖 [GEMINI] Calling Google Gemini Vision API...');

    const base64Image = screenshot.replace(/^data:image\/\w+;base64,/, '');

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: `You are a web design expert. Analyze this website screenshot and provide:

1. VISUAL ISSUES: List specific visual problems (poor contrast, cluttered layout, hard to read text, inconsistent spacing)
2. LAYOUT PROBLEMS: List layout issues (poor hierarchy, misaligned elements, responsive design issues)
3. CLARITY SCORE: Rate visual clarity 0-100
4. ATTENTION ZONES: Identify 4 key areas where users focus (header, main-content, sidebar, footer) with intensity 0-1

Response format (JSON only):
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
}`
              },
              {
                inlineData: {
                  mimeType: 'image/jpeg',
                  data: base64Image
                }
              }
            ]
          }
        ]
      },
      { timeout: 30000 }
    );

    const responseText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      console.error('❌ [GEMINI] No response from API');
      return getDefaultAIAnalysis();
    }

    let analysisData;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      analysisData = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
    } catch (parseError) {
      console.error('❌ [GEMINI] Failed to parse response');
      return getDefaultAIAnalysis();
    }

    if (analysisData.visualIssues) {
      visualIssues.push(...analysisData.visualIssues.slice(0, 5));
    }
    if (analysisData.layoutProblems) {
      layoutProblems.push(...analysisData.layoutProblems.slice(0, 5));
    }
    if (analysisData.clarityScore) {
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

  // Lighthouse-based accessibility recommendations
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

  // Readability recommendations
  if (readabilityScore < 60) {
    recommendations.push('Simplify complex sentences for better readability');
    recommendations.push('Break long paragraphs into shorter chunks (3-4 sentences)');
    recommendations.push('Use bullet points to improve content scanability');
  }

  if (readabilityScore < 40) {
    recommendations.push('Consider rewriting content for a general audience');
  }

  // Visual clarity recommendations
  if (visualIssues.length > 0) {
    recommendations.push('Increase contrast between text and background');
    recommendations.push('Ensure consistent spacing and alignment throughout');
    recommendations.push('Improve visual hierarchy with clear heading structure');
  }

  // General recommendations
  recommendations.push('Ensure all images have descriptive alt text');
  recommendations.push('Add skip navigation links for keyboard users');
  recommendations.push('Test with keyboard navigation only');
  recommendations.push('Validate HTML and CSS for errors');
  recommendations.push('Optimize images for faster loading');
  recommendations.push('Ensure CTA buttons are 44x44px minimum');

  return recommendations.slice(0, 10);
};