const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:8081/#pricing', { waitUntil: 'networkidle' });
  
  // wait for animations
  await page.waitForTimeout(2000);

  const rects = await page.evaluate(() => {
    const section = document.querySelector('.pricing-section').getBoundingClientRect();
    const grid = document.querySelector('.pricing-grid').getBoundingClientRect();
    const cards = Array.from(document.querySelectorAll('.pricing-card')).map(el => {
      const rect = el.getBoundingClientRect();
      const button = el.querySelector('.pricing-button').getBoundingClientRect();
      const h3 = el.querySelector('h3').textContent;
      const computed = window.getComputedStyle(el);
      return { 
        h3, 
        cardRect: { top: rect.top, bottom: rect.bottom, height: rect.height },
        buttonRect: { top: button.top, bottom: button.bottom, height: button.height },
        overflow: computed.overflow,
        minHeight: computed.minHeight
      };
    });
    
    const faq = document.querySelector('.faq-section').getBoundingClientRect();
    
    return {
      section: { top: section.top, bottom: section.bottom, height: section.height, padB: window.getComputedStyle(document.querySelector('.pricing-section')).paddingBottom },
      grid: { top: grid.top, bottom: grid.bottom, height: grid.height },
      cards,
      faq: { top: faq.top, bottom: faq.bottom, height: faq.height }
    };
  });
  
  console.log(JSON.stringify(rects, null, 2));
  await browser.close();
})();
