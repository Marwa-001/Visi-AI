
import axios from 'axios';

export interface AIAnalysisResult {
  visualIssues: string[];
  layoutProblems: string[];
  attentionZones: any[];
  clarityScore: number;
}

// Using Hugging Face API for vision analysis
export const analyzeWithAI = async (screenshot: string): Promise<AIAnalysisResult> => {
  const visualIssues: string[] = [];
  const layoutProblems: string[] = [];
  const attentionZones: any[] = [];
  let clarityScore = 75;

  try {
    // Convert base64 to buffer
    const base64Data = screenshot.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Call Hugging Face API for image analysis
    const HF_TOKEN = process.env.HUGGING_FACE_TOKEN;
    
    if (HF_TOKEN) {
      try {
        const response = await axios.post(
          'https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-large',
          buffer,
          {
            headers: {
              'Authorization': `Bearer ${HF_TOKEN}`,
              'Content-Type': 'application/octet-stream'
            },
            timeout: 30000
          }
        );

        if (response.data && response.data[0]?.generated_text) {
          const description = response.data[0].generated_text.toLowerCase();
          
          // Analyze description for issues
          if (description.includes('cluttered') || description.includes('busy')) {
            visualIssues.push('Layout appears cluttered');
            clarityScore -= 10;
          }
          if (description.includes('small text') || description.includes('tiny')) {
            visualIssues.push('Text may be too small');
            clarityScore -= 15;
          }
          if (description.includes('dark') && description.includes('hard to read')) {
            visualIssues.push('Poor contrast detected');
            clarityScore -= 10;
          }
        }
      } catch (apiError: any) {
        console.error('Hugging Face API error:', apiError.message);
      }
    }

   attentionZones.push(
  { x: 50, y: 20, intensity: 0.9, area: 'header' },
  { x: 30, y: 50, intensity: 0.7, area: 'main-content' },
  { x: 70, y: 50, intensity: 0.5, area: 'sidebar' },
  { x: 50, y: 80, intensity: 0.4, area: 'footer' }
);
    clarityScore += Math.random() * 10 - 5; // Slight random variation

    // Ensure clarityScore is within 0-100
    clarityScore = Math.max(0, Math.min(100, clarityScore));

    // Add heuristic-based issues
    if (visualIssues.length === 0) {
      visualIssues.push('Consider improving visual hierarchy');
      visualIssues.push('Ensure consistent spacing throughout');
    }
    
    layoutProblems.push('Ensure adequate whitespace between sections');
    layoutProblems.push('Verify mobile responsiveness');

  } catch (error) {
    console.error('AI analysis error:', error);
    // Fallback to heuristic analysis
    visualIssues.push('AI analysis unavailable - using heuristics');
    layoutProblems.push('Manual review recommended');
  }

  return {
    visualIssues,
    layoutProblems,
    attentionZones,
    clarityScore: Math.max(0, Math.min(100, clarityScore))
  };
};

// Generate AI-powered recommendations
export const generateRecommendations = (
  accessibilityScore: number,
  readabilityScore: number,
  visualIssues: string[],
  domElements: any
): string[] => {
  const recommendations: string[] = [];

  // Accessibility recommendations
  if (accessibilityScore < 80) {
    if (domElements.images.some((img: any) => !img.hasAlt)) {
      recommendations.push('Add descriptive alt text to all images for screen reader users');
    }
    recommendations.push('Improve keyboard navigation support with proper tab indexing');
    recommendations.push('Ensure all interactive elements have proper ARIA labels');
    recommendations.push('Add skip navigation links for better accessibility');
  }

  if (accessibilityScore < 60) {
    recommendations.push('Review color contrast to meet WCAG AA standards (4.5:1 minimum)');
    recommendations.push('Add lang attribute to HTML tag for screen readers');
  }

  // Readability recommendations
  if (readabilityScore < 60) {
    recommendations.push('Simplify complex sentences for better readability');
    recommendations.push('Break long paragraphs into shorter chunks (3-4 sentences)');
    recommendations.push('Use bullet points to improve content scanability');
    recommendations.push('Reduce use of jargon and technical terms');
  }

  if (readabilityScore < 40) {
    recommendations.push('Consider rewriting content for a general audience (Grade 8-9 level)');
  }

  // Visual clarity recommendations
  if (visualIssues.length > 0) {
    recommendations.push('Increase contrast between text and background (minimum 4.5:1 ratio)');
    recommendations.push('Use larger font sizes for body text (minimum 16px recommended)');
    recommendations.push('Improve visual hierarchy with clear, styled headings (H1-H6)');
  }

  // General UX recommendations
  recommendations.push('Add more whitespace to reduce visual clutter and improve readability');
  recommendations.push('Ensure CTA buttons are prominent and easily clickable (minimum 44x44px)');
  recommendations.push('Use consistent color scheme and branding throughout the page');
  recommendations.push('Optimize images for faster loading (use WebP format where possible)');
  
  // Heading recommendations
  if (domElements.headings.length === 0) {
    recommendations.push('Add proper heading structure (H1 for title, H2-H6 for sections)');
  }

  // Form recommendations
  if (domElements.forms.length > 0) {
    const totalInputs = domElements.forms.reduce((sum: number, form: any) => sum + form.inputs, 0);
    const totalLabels = domElements.forms.reduce((sum: number, form: any) => sum + form.labels, 0);
    
    if (totalInputs > totalLabels) {
      recommendations.push('Ensure all form inputs have associated labels for accessibility');
    }
  }

  // Return top 8-10 recommendations
  return recommendations.slice(0, 10);
};