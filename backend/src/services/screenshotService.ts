
import puppeteer from 'puppeteer';

export interface ScreenshotResult {
  screenshot: string;
  html: string;
  textContent: string;
  domElements: any;
}

export const captureWebsite = async (url: string): Promise<ScreenshotResult> => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Navigate to URL
    await page.goto(url, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });

    // Capture screenshot
    const screenshot = await page.screenshot({ 
      encoding: 'base64',
      fullPage: true 
    });

    // Extract HTML
    const html = await page.content();

    // Extract text content
    const textContent = await page.evaluate(() => document.body.innerText);

    // Extract DOM elements for analysis
    const domElements = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img')).map(img => ({
        src: img.src,
        alt: img.alt,
        hasAlt: !!img.alt
      }));

      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(h => ({
        tag: h.tagName,
        text: h.textContent?.trim()
      }));

      const buttons = Array.from(document.querySelectorAll('button, a.btn, [role="button"]')).length;

      const forms = Array.from(document.querySelectorAll('form')).map(form => ({
        inputs: form.querySelectorAll('input').length,
        labels: form.querySelectorAll('label').length
      }));

      return { images, headings, buttons, forms };
    });

    await browser.close();

    return {
      screenshot: `data:image/png;base64,${screenshot}`,
      html,
      textContent,
      domElements
    };
  } catch (error) {
    await browser.close();
    throw error;
  }
};