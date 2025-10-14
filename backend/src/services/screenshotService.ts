import puppeteer from 'puppeteer';

export interface ScreenshotResult {
  screenshot: string;
  html: string;
  textContent: string;
  domElements: any;
}

export const captureWebsite = async (url: string): Promise<ScreenshotResult> => {
  let browser;
  
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--disable-web-resources',
        '--disable-features=TranslateUI'
      ]
    });

    const page = await browser.newPage();
    
    // Set viewport to smaller size to reduce screenshot size
    await page.setViewport({ width: 1280, height: 720 });
    
    // Set user agent
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    console.log(`📸 Navigating to: ${url}`);
    
    // Navigate with relaxed timeout
    await page.goto(url, { 
      waitUntil: 'domcontentloaded',
      timeout: 45000 
    });

    console.log('⏳ Waiting for content to render...');
    
    // Wait for document to be ready
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 30000 }).catch(() => {
      console.warn('⚠️ Network idle timeout, continuing anyway');
    });

    // Extra wait for JS to execute
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('✅ Page loaded');

    // Get page content
    const html = await page.content();
    console.log(`✅ HTML extracted (${html.length} characters)`);

    // Extract text - simple and reliable
    let textContent = await page.evaluate(() => {
      return document.body.innerText || '';
    });

    console.log(`📝 Text content: ${textContent.length} characters`);

    // If no text, try alternative method
    if (textContent.length < 50) {
      console.warn('⚠️ Very little text found, trying alternative extraction...');
      
      textContent = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll('body, body *'));
        const texts: string[] = [];
        
        for (const el of elements) {
          const text = (el as HTMLElement).innerText?.trim();
          if (text && text.length > 0) {
            texts.push(text);
          }
        }
        
        return texts.join(' ');
      });
      
      console.log(`📝 Alternative text: ${textContent.length} characters`);
    }

    // Capture screenshot with JPEG compression for smaller file size
    console.log('📸 Capturing screenshot...');
    
    const screenshotBuffer = await page.screenshot({
      fullPage: false,
      type: 'jpeg',
      quality: 80
    });

    // Convert to base64
    const screenshot = screenshotBuffer.toString('base64');

    console.log(`✅ Screenshot captured (${screenshot.length} bytes as base64)`);

    // Extract DOM elements
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

      return { 
        images, 
        headings, 
        buttons, 
        forms
      };
    });

    console.log(`📊 DOM: ${domElements.images.length} images, ${domElements.headings.length} headings, ${domElements.buttons} buttons`);

    await browser.close();

    return {
      screenshot: `data:image/jpeg;base64,${screenshot}`,
      html,
      textContent: textContent.trim(),
      domElements
    };

  } catch (error) {
    console.error('❌ Error:', error);
    if (browser) {
      await browser.close();
    }
    throw error;
  }
};