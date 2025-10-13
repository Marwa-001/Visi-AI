import * as cheerio from 'cheerio';

export interface AccessibilityResult {
  score: number;
  missingAlt: number;
  ariaIssues: number;
  contrastIssues: string[];
  issues: string[];
}

export const analyzeAccessibility = (html: string, domElements: any): AccessibilityResult => {
  const $ = cheerio.load(html);
  const issues: string[] = [];
  let score = 100;

  // Check for missing alt text
  const imagesWithoutAlt = domElements.images.filter((img: any) => !img.hasAlt).length;
  if (imagesWithoutAlt > 0) {
    issues.push(`${imagesWithoutAlt} images missing alt text`);
    score -= Math.min(imagesWithoutAlt * 5, 30);
  }

  // Check for aria-labels
  const ariaIssues = $('[role]').filter((i, el) => !$(el).attr('aria-label')).length;
  if (ariaIssues > 0) {
    issues.push(`${ariaIssues} elements with role but no aria-label`);
    score -= Math.min(ariaIssues * 3, 20);
  }

  // Check form labels
  const inputs = $('input[type!="hidden"]').length;
  const labels = $('label').length;
  if (inputs > labels) {
    issues.push(`${inputs - labels} form inputs without labels`);
    score -= Math.min((inputs - labels) * 4, 25);
  }

  // Check heading hierarchy
  const headings = domElements.headings;
  if (headings.length === 0) {
    issues.push('No heading tags found - poor document structure');
    score -= 15;
  }

  // Check for skip links
  const skipLinks = $('a[href^="#"]').filter((i, el) => 
    $(el).text().toLowerCase().includes('skip')
  ).length;
  if (skipLinks === 0) {
    issues.push('No skip navigation links found');
    score -= 5;
  }

  // Check for language attribute
  if (!$('html[lang]').length) {
    issues.push('Missing lang attribute on html element');
    score -= 5;
  }

  // Check for descriptive link text
  const genericLinks = $('a').filter((i, el) => {
    const text = $(el).text().toLowerCase().trim();
    return ['click here', 'read more', 'here', 'more'].includes(text);
  }).length;
  if (genericLinks > 0) {
    issues.push(`${genericLinks} links with non-descriptive text`);
    score -= Math.min(genericLinks * 2, 10);
  }

  return {
    score: Math.max(0, score),
    missingAlt: imagesWithoutAlt,
    ariaIssues,
    contrastIssues: [],
    issues
  };
};

// Calculate color contrast ratio
export const getContrastRatio = (color1: string, color2: string): number => {
  const getLuminance = (color: string): number => {
    // Simplified luminance calculation
    const rgb = color.match(/\d+/g)?.map(Number) || [0, 0, 0];
    const [r, g, b] = rgb.map(val => {
      val = val / 255;
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
};
