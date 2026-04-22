// Visual QA Review Script for Presentation
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:5173/';
const SCREENSHOT_DIR = path.join(
  'C:\\Users\\migmartinez\\OneDrive - Microsoft\\Desktop\\20260422_GHCP',
  'presentation', '2026-04-22T1047-v1-github-copilot-foundations-to-agents',
  'review-screenshots'
);
const EXPECTED_SLIDES = 85;

mkdirSync(SCREENSHOT_DIR, { recursive: true });

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1
  });
  const page = await context.newPage();

  // Collect console errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  // Navigate
  console.log('Navigating to ' + BASE_URL);
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });

  // Wait for fonts
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1000);

  // Clear persisted state
  await page.evaluate(() => {
    localStorage.removeItem('pres-theme');
    localStorage.removeItem('pres-notes');
    localStorage.removeItem('pres-hidden-slides');
    localStorage.removeItem('pres-current-slide');
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1000);

  // Go to slide 1
  await page.keyboard.press('Home');
  await page.waitForTimeout(800);

  // Get slide count from DOM
  const domSlideCount = await page.evaluate(() => document.querySelectorAll('.slide').length);
  console.log(`DOM slide count: ${domSlideCount} (expected: ${EXPECTED_SLIDES})`);

  // Get slide metadata
  const slideMeta = await page.evaluate(() => {
    return [...document.querySelectorAll('.slide')].map(s => ({
      number: s.dataset.number || s.dataset.slide,
      type: s.dataset.type || 'content',
      title: s.querySelector('.slide-title')?.textContent?.trim() || '(no title)'
    }));
  });

  const counter = await page.evaluate(() => document.querySelector('#slide-counter')?.textContent || 'not found');
  console.log(`Initial counter: ${counter}`);

  // Check network failures
  const failedRequests = [];

  const totalSlides = domSlideCount || EXPECTED_SLIDES;
  const results = [];

  // Review each slide
  for (let i = 1; i <= totalSlides; i++) {
    const paddedNum = String(i).padStart(3, '0');
    
    // Take screenshot
    const screenshotPath = path.join(SCREENSHOT_DIR, `slide-${paddedNum}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: false });

    // Run programmatic checks
    const checkResult = await page.evaluate(async () => {
      await document.fonts.ready;
      const slide = document.querySelector('.slide.active');
      if (!slide) return { error: 'No active slide found', slideNumber: 'unknown' };

      const content = slide.querySelector('.slide-content');
      const title = slide.querySelector('.slide-title');
      const slideRect = slide.getBoundingClientRect();
      const slideType = slide.dataset?.type || 'content';
      const r = {
        slideNumber: document.querySelector('#slide-counter')?.textContent || 'unknown',
        slideType: slideType,
        slideTitle: title?.textContent?.trim() || '(no title)',
        overflow: {},
        spacing: {},
        fonts: {},
        issues: []
      };

      // 1. Vertical overflow
      if (content) {
        const overflowY = content.scrollHeight > content.clientHeight + 2;
        r.overflow.vertical = {
          scrollHeight: content.scrollHeight,
          clientHeight: content.clientHeight,
          overflowing: overflowY
        };
        if (overflowY) {
          r.issues.push({
            type: 'vertical-overflow',
            severity: 'critical',
            detail: `Content overflows by ${content.scrollHeight - content.clientHeight}px`
          });
        }
      }

      // 2. Horizontal overflow on code blocks, tables, pre
      const isCodeSlide = slideType === 'code-example';
      slide.querySelectorAll('pre, .code-block, table, .slide-body').forEach((el, idx) => {
        if (el.scrollWidth > el.clientWidth + 2) {
          if (isCodeSlide && (el.matches('pre') || el.matches('.code-block'))) return;
          r.issues.push({
            type: 'horizontal-overflow',
            severity: 'important',
            detail: `${el.tagName}.${(el.className || '').split(' ')[0]} overflows horizontally by ${el.scrollWidth - el.clientWidth}px`
          });
        }
      });

      // 3. Zero dimensions
      ['.slide-title', '.slide-body', '.slide-content'].forEach(sel => {
        const el = slide.querySelector(sel);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) {
            r.issues.push({
              type: 'zero-dimension',
              severity: 'critical',
              detail: `${sel} has zero dimensions (${rect.width}x${rect.height})`
            });
          }
        }
      });

      // 4. Child element clipping
      slide.querySelectorAll('.slide-title, .slide-body, .flow-step, .tool-card, table, pre, .code-block, .tree-container, .tree-branch, .tree-leaf, .ecosystem-container, .ecosystem-item, .tier-stack, .tier-item, .handoff-flow, .handoff-step, .spectrum-container, .spectrum-item, .category-list, .category-item, .file-tree, .tool-grid, .slide-table, .demo-badge, .break-content').forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.height === 0) return;
        if (rect.bottom > slideRect.bottom + 2) {
          r.issues.push({
            type: 'element-clipped-bottom',
            severity: 'critical',
            detail: `${el.tagName}.${(el.className || '').split(' ')[0]} extends ${Math.round(rect.bottom - slideRect.bottom)}px below slide`
          });
        }
        if (rect.right > slideRect.right + 2) {
          r.issues.push({
            type: 'element-clipped-right',
            severity: 'important',
            detail: `${el.tagName}.${(el.className || '').split(' ')[0]} extends ${Math.round(rect.right - slideRect.right)}px beyond right edge`
          });
        }
      });

      // 5. Empty containers
      slide.querySelectorAll('.flow-step, .tool-card, .tree-leaf, .ecosystem-item, .tier-item, .handoff-step, .spectrum-item, .category-item').forEach((el, idx) => {
        const text = el.textContent?.trim();
        const hasMedia = el.querySelector('img, svg');
        if (!text && !hasMedia) {
          r.issues.push({
            type: 'empty-container',
            severity: 'important',
            detail: `${el.className} #${idx} has no visible content`
          });
        }
      });

      // 6. Font checks
      const fontChecks = [
        { sel: '.slide-title', expected: ['Space Grotesk', 'Inter', 'Playfair'], label: 'title' },
        { sel: '.slide-body', expected: ['Inter', 'Space Grotesk', 'Playfair'], label: 'body' },
        { sel: 'code, .code-block, pre code', expected: ['JetBrains Mono', 'monospace'], label: 'code' }
      ];
      fontChecks.forEach(({ sel, expected, label }) => {
        const el = slide.querySelector(sel);
        if (el) {
          const computed = getComputedStyle(el).fontFamily;
          r.fonts[label] = computed;
          if (!expected.some(f => computed.includes(f))) {
            r.issues.push({
              type: 'font-fallback',
              severity: 'minor',
              detail: `${label} element using fallback font: ${computed}`
            });
          }
        }
      });

      // 7. Bottom margin
      if (content) {
        const contentRect = content.getBoundingClientRect();
        const margin = slideRect.bottom - contentRect.bottom;
        r.spacing.bottomMargin = Math.round(margin);
        if (margin < 0) {
          r.issues.push({
            type: 'content-exceeds-canvas',
            severity: 'critical',
            detail: `Content extends ${Math.abs(Math.round(margin))}px beyond slide bottom`
          });
        } else if (margin < 20) {
          r.issues.push({
            type: 'tight-fit',
            severity: 'important',
            detail: `Only ${Math.round(margin)}px margin at bottom`
          });
        } else if (margin < 40) {
          r.issues.push({
            type: 'snug-fit',
            severity: 'minor',
            detail: `${Math.round(margin)}px margin at bottom — snug`
          });
        }
      }

      // 8. Image check
      slide.querySelectorAll('img').forEach((img, idx) => {
        if (!img.complete || img.naturalWidth === 0) {
          r.issues.push({
            type: 'broken-image',
            severity: 'important',
            detail: `Image #${idx} failed to load: ${img.src}`
          });
        }
      });

      // 9. Sibling overlap
      const blocks = slide.querySelectorAll('.flow-step, .tool-card, .tree-branch, .tree-leaf, .tier-item, .handoff-step, .ecosystem-item, .spectrum-item');
      const blockRects = [...blocks].map(el => ({ el, rect: el.getBoundingClientRect() })).filter(b => b.rect.height > 0);
      for (let i = 0; i < blockRects.length; i++) {
        for (let j = i + 1; j < blockRects.length; j++) {
          const a = blockRects[i], b = blockRects[j];
          if (a.el.parentElement !== b.el.parentElement) continue;
          const oY = Math.min(a.rect.bottom, b.rect.bottom) - Math.max(a.rect.top, b.rect.top);
          const oX = Math.min(a.rect.right, b.rect.right) - Math.max(a.rect.left, b.rect.left);
          if (oY > 4 && oX > 4) {
            r.issues.push({
              type: 'sibling-overlap',
              severity: 'important',
              detail: `${(a.el.className || '').split(' ')[0]} and ${(b.el.className || '').split(' ')[0]} overlap by ${Math.round(oY)}px vertically`
            });
            break;
          }
        }
      }

      return r;
    });

    results.push({ slideIndex: i, ...checkResult });

    // Log progress
    const issueCount = checkResult.issues?.length || 0;
    const hasCritical = checkResult.issues?.some(iss => iss.severity === 'critical');
    const marker = hasCritical ? '🔴' : issueCount > 0 ? '⚠️' : '✅';
    console.log(`Slide ${i}/${totalSlides} ${marker} ${checkResult.slideTitle || ''} [${checkResult.slideType}] issues:${issueCount} margin:${checkResult.spacing?.bottomMargin ?? 'n/a'}px`);

    // Navigate to next slide
    if (i < totalSlides) {
      const currentCounter = await page.evaluate(() => document.querySelector('#slide-counter')?.textContent);
      await page.keyboard.press('ArrowRight');
      
      // Wait for transition
      try {
        await page.waitForFunction(
          (prev) => {
            const counter = document.querySelector('#slide-counter')?.textContent;
            const activeSlides = document.querySelectorAll('.slide.active').length;
            return counter !== prev && activeSlides === 1;
          },
          currentCounter,
          { timeout: 5000 }
        );
      } catch (e) {
        console.log(`  ⚠ Transition timeout on slide ${i} -> ${i + 1}`);
      }
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(500);
    }
  }

  // Functional checks
  console.log('\n--- Functional Checks ---');

  // Navigation: Home
  await page.keyboard.press('Home');
  await page.waitForTimeout(800);
  const homeCounter = await page.evaluate(() => document.querySelector('#slide-counter')?.textContent);
  console.log(`Home key -> ${homeCounter}`);

  // Navigation: ArrowRight
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(800);
  const rightCounter = await page.evaluate(() => document.querySelector('#slide-counter')?.textContent);
  console.log(`ArrowRight -> ${rightCounter}`);

  // Navigation: ArrowLeft
  await page.keyboard.press('ArrowLeft');
  await page.waitForTimeout(800);
  const leftCounter = await page.evaluate(() => document.querySelector('#slide-counter')?.textContent);
  console.log(`ArrowLeft -> ${leftCounter}`);

  // Admin panel check
  const adminCheck = await page.evaluate(() => {
    const gearBtn = document.querySelector('#admin-toggle, .admin-toggle, [data-action="admin"]');
    const notesToggle = document.querySelector('#notes-toggle');
    return {
      gearBtnExists: !!gearBtn,
      notesToggleExists: !!notesToggle,
      notesTogglePosition: notesToggle ? getComputedStyle(notesToggle).position : null,
      notesToggleRect: notesToggle ? notesToggle.getBoundingClientRect() : null
    };
  });
  console.log('Admin/Notes toggle check:', JSON.stringify(adminCheck));

  // Try to open admin panel
  const gearSel = '#admin-toggle, .admin-toggle, [data-action="admin"], .gear-icon, button[title*="admin" i], button[title*="settings" i]';
  const gearBtn = await page.$(gearSel);
  if (gearBtn) {
    await gearBtn.click();
    await page.waitForTimeout(500);
    const panelCheck = await page.evaluate(() => {
      const panel = document.querySelector('.admin-panel, #admin-panel, .settings-panel');
      if (!panel) return { open: false };
      const themeSwitch = panel.querySelector('[data-action="theme"], .theme-switcher, select');
      const pdfBtn = panel.querySelector('[data-action="pdf"], .pdf-export, button');
      return {
        open: true,
        themeSwitchExists: !!themeSwitch,
        pdfBtnExists: !!pdfBtn
      };
    });
    console.log('Admin panel:', JSON.stringify(panelCheck));
    // Close it
    if (gearBtn) await gearBtn.click();
    await page.waitForTimeout(300);
  } else {
    console.log('Admin panel: gear button NOT FOUND');
  }

  // Console errors
  console.log(`\nConsole errors collected: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    consoleErrors.slice(0, 10).forEach(e => console.log(`  ERROR: ${e}`));
  }

  // Output full JSON results
  const output = {
    totalSlides: totalSlides,
    domSlideCount,
    expectedSlides: EXPECTED_SLIDES,
    slideMeta,
    results,
    functionalChecks: {
      homeNav: homeCounter,
      rightNav: rightCounter,
      leftNav: leftCounter,
      admin: adminCheck,
      consoleErrors: consoleErrors.slice(0, 20)
    }
  };

  writeFileSync(
    path.join('C:\\Users\\migmartinez\\OneDrive - Microsoft\\Desktop\\20260422_GHCP', 'review-data.json'),
    JSON.stringify(output, null, 2)
  );
  console.log('\nReview data saved to review-data.json');

  await browser.close();
}

run().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
