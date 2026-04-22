// Functional checks: navigation, theme smoke test, admin panel
import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1
  });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1000);

  // Clear state
  await page.evaluate(() => {
    localStorage.removeItem('pres-theme');
    localStorage.removeItem('pres-notes');
    localStorage.removeItem('pres-hidden-slides');
    localStorage.removeItem('pres-current-slide');
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1000);

  console.log('=== NAVIGATION TESTS ===');
  
  // Home
  await page.keyboard.press('Home');
  await page.waitForTimeout(800);
  const home1 = await page.evaluate(() => document.querySelector('#slide-counter')?.textContent);
  console.log(`Home -> ${home1}`);

  // ArrowRight x3
  for (let i = 0; i < 3; i++) {
    const before = await page.evaluate(() => document.querySelector('#slide-counter')?.textContent);
    await page.keyboard.press('ArrowRight');
    await page.waitForFunction(
      (prev) => document.querySelector('#slide-counter')?.textContent !== prev,
      before,
      { timeout: 3000 }
    ).catch(() => {});
    await page.waitForTimeout(500);
  }
  const after3Right = await page.evaluate(() => document.querySelector('#slide-counter')?.textContent);
  console.log(`After 3x ArrowRight -> ${after3Right}`);

  // ArrowLeft x2
  for (let i = 0; i < 2; i++) {
    const before = await page.evaluate(() => document.querySelector('#slide-counter')?.textContent);
    await page.keyboard.press('ArrowLeft');
    await page.waitForFunction(
      (prev) => document.querySelector('#slide-counter')?.textContent !== prev,
      before,
      { timeout: 3000 }
    ).catch(() => {});
    await page.waitForTimeout(500);
  }
  const after2Left = await page.evaluate(() => document.querySelector('#slide-counter')?.textContent);
  console.log(`After 2x ArrowLeft -> ${after2Left}`);

  // Home again
  await page.keyboard.press('Home');
  await page.waitForTimeout(800);
  const home2 = await page.evaluate(() => document.querySelector('#slide-counter')?.textContent);
  console.log(`Home again -> ${home2}`);

  // End key
  await page.keyboard.press('End');
  await page.waitForTimeout(800);
  const end1 = await page.evaluate(() => document.querySelector('#slide-counter')?.textContent);
  console.log(`End -> ${end1}`);

  console.log('\n=== ADMIN PANEL TESTS ===');
  await page.keyboard.press('Home');
  await page.waitForTimeout(800);

  // Open admin via clicking the gear
  const gearBtn = await page.$('#admin-toggle');
  if (gearBtn) {
    await gearBtn.click();
    await page.waitForTimeout(500);
    
    const panelInfo = await page.evaluate(() => {
      const panel = document.querySelector('#admin-panel');
      if (!panel) return { exists: false };
      const visible = panel.classList.contains('visible');
      const themeSelect = panel.querySelector('select, .theme-switcher, [data-action="theme"]');
      const pdfBtn = panel.querySelector('.pdf-export, [data-action="pdf"]');
      const goToInput = panel.querySelector('input[type="number"], .goto-input');
      const checklist = panel.querySelectorAll('.slide-checklist-item, .admin-slide-entry');
      
      // Check a few checklist entries for title format
      const checklistTexts = [...checklist].slice(0, 5).map(el => el.textContent?.trim());
      
      return {
        exists: true,
        visible,
        hasThemeSelect: !!themeSelect,
        hasPdfBtn: !!pdfBtn,
        hasGoToInput: !!goToInput,
        checklistCount: checklist.length,
        checklistSamples: checklistTexts
      };
    });
    console.log('Admin panel:', JSON.stringify(panelInfo, null, 2));

    // Close via Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    const closedCheck = await page.evaluate(() => {
      const panel = document.querySelector('#admin-panel');
      return panel ? !panel.classList.contains('visible') : true;
    });
    console.log(`Admin panel closed via Escape: ${closedCheck}`);
  } else {
    console.log('Gear button NOT found');
  }

  console.log('\n=== NOTES TOGGLE TEST ===');
  const notesCheck = await page.evaluate(() => {
    const btn = document.querySelector('#notes-toggle');
    if (!btn) return { exists: false };
    const style = getComputedStyle(btn);
    const rect = btn.getBoundingClientRect();
    return {
      exists: true,
      position: style.position,
      display: style.display,
      right: Math.round(window.innerWidth - rect.right),
      bottom: Math.round(window.innerHeight - rect.bottom),
      width: rect.width,
      height: rect.height
    };
  });
  console.log('Notes toggle:', JSON.stringify(notesCheck));

  // Click notes toggle
  const notesBtn = await page.$('#notes-toggle');
  if (notesBtn) {
    await notesBtn.click();
    await page.waitForTimeout(500);
    const notesVisible = await page.evaluate(() => {
      const overlay = document.querySelector('.speaker-notes-overlay, .notes-overlay, aside.speaker-notes');
      const lsVal = localStorage.getItem('pres-notes');
      return { overlayFound: !!overlay, overlayVisible: overlay ? getComputedStyle(overlay).display !== 'none' : false, localStorage: lsVal };
    });
    console.log('After notes toggle click:', JSON.stringify(notesVisible));
    // Toggle back
    await notesBtn.click();
    await page.waitForTimeout(300);
  }

  console.log('\n=== THEME SMOKE TEST ===');
  // Test on slide 1 (title), slide 7 (diagram), slide 9 (code-example)
  const testSlides = [1, 7, 9];
  const themes = ['github-cosmos', 'github-light', 'high-contrast', 'solarized'];

  for (const slideNum of testSlides) {
    // Navigate to slide
    await page.keyboard.press('Home');
    await page.waitForTimeout(500);
    for (let i = 1; i < slideNum; i++) {
      const before = await page.evaluate(() => document.querySelector('#slide-counter')?.textContent);
      await page.keyboard.press('ArrowRight');
      await page.waitForFunction(
        (prev) => document.querySelector('#slide-counter')?.textContent !== prev,
        before,
        { timeout: 3000 }
      ).catch(() => {});
      await page.waitForTimeout(200);
    }
    
    for (const theme of themes) {
      await page.evaluate((t) => {
        document.documentElement.setAttribute('data-theme', t);
        localStorage.setItem('pres-theme', t);
      }, theme);
      await page.waitForTimeout(300);
      
      const themeCheck = await page.evaluate(() => {
        const slide = document.querySelector('.slide.active');
        if (!slide) return { error: 'no active slide' };
        const title = slide.querySelector('.slide-title');
        const body = slide.querySelector('.slide-body, pre, table');
        const titleStyle = title ? getComputedStyle(title) : null;
        const bodyStyle = body ? getComputedStyle(body) : null;
        return {
          slideCounter: document.querySelector('#slide-counter')?.textContent,
          theme: document.documentElement.getAttribute('data-theme'),
          titleColor: titleStyle?.color || 'n/a',
          titleBg: titleStyle?.backgroundColor || 'n/a',
          bodyColor: bodyStyle?.color || 'n/a',
          hasUnstyledVars: titleStyle?.color === '' || bodyStyle?.color === ''
        };
      });
      console.log(`Slide ${slideNum}, theme ${theme}: title=${themeCheck.titleColor}, body=${themeCheck.bodyColor}, unstyled=${themeCheck.hasUnstyledVars}`);
    }
  }

  // Reset to default theme
  await page.evaluate(() => {
    document.documentElement.setAttribute('data-theme', 'github-cosmos');
    localStorage.setItem('pres-theme', 'github-cosmos');
  });

  console.log('\n=== CONSOLE ERRORS ===');
  console.log(`Total console errors: ${consoleErrors.length}`);
  consoleErrors.slice(0, 10).forEach(e => console.log(`  ERROR: ${e}`));

  console.log('\n=== DONE ===');
  await browser.close();
}

run().catch(err => {
  console.error('FATAL:', err.message);
  process.exit(1);
});
