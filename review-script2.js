const { chromium } = require('playwright');
const path = require('path');

const SCREENSHOT_DIR = path.join('presentation', '2026-04-22T1047-v1-github-copilot-foundations-to-agents', 'review-screenshots');
// Slide numbers are 1-based in content, but localStorage uses 0-based index
const TARGET_SLIDES = [14, 17, 23, 24, 25, 32, 53, 74, 75, 76, 79, 80, 94, 95, 96];

async function checkSlide(page) {
  return await page.evaluate(async () => {
    await document.fonts.ready;
    const slide = document.querySelector('.slide.active');
    if (!slide) return { error: 'No active slide found' };
    const content = slide.querySelector('.slide-content');
    const title = slide.querySelector('.slide-title');
    const slideRect = slide.getBoundingClientRect();
    const slideType = slide.dataset?.type || 'content';
    const results = {
      slideNumber: document.querySelector('#slide-counter')?.textContent || 'unknown',
      dataNumber: slide.dataset?.number || '?',
      slideType: slideType,
      slideTitle: title?.textContent?.trim() || '(no title)',
      overflow: {},
      spacing: {},
      fonts: {},
      issues: []
    };
    if (content) {
      const overflowY = content.scrollHeight > content.clientHeight + 2;
      results.overflow.vertical = { scrollHeight: content.scrollHeight, clientHeight: content.clientHeight, overflowing: overflowY };
      if (overflowY) {
        results.issues.push({ type: 'vertical-overflow', severity: 'critical', detail: 'Content overflows by ' + (content.scrollHeight - content.clientHeight) + 'px' });
      }
    }
    const isCodeSlide = slideType === 'code-example';
    slide.querySelectorAll('pre, .code-block, table, .slide-body').forEach((el, i) => {
      if (el.scrollWidth > el.clientWidth + 2) {
        if (isCodeSlide && (el.matches('pre') || el.matches('.code-block'))) return;
        results.issues.push({ type: 'horizontal-overflow', severity: 'important', detail: el.tagName + '.' + (el.className?.split(' ')[0] || 'none') + ' overflows horizontally by ' + (el.scrollWidth - el.clientWidth) + 'px' });
      }
    });
    ['.slide-title', '.slide-body', '.slide-content'].forEach(sel => {
      const el = slide.querySelector(sel);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
          results.issues.push({ type: 'zero-dimension', severity: 'critical', detail: sel + ' has zero dimensions' });
        }
      }
    });
    slide.querySelectorAll('.slide-title, .slide-body, .flow-step, .tool-card, table, pre, .code-block, .slide-list, blockquote, .slide-quote').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.height === 0) return;
      if (r.bottom > slideRect.bottom + 2) {
        results.issues.push({ type: 'element-clipped-bottom', severity: 'critical', detail: el.tagName + '.' + (el.className?.split(' ')[0] || '') + ' extends ' + Math.round(r.bottom - slideRect.bottom) + 'px below slide' });
      }
      if (r.right > slideRect.right + 2) {
        results.issues.push({ type: 'element-clipped-right', severity: 'important', detail: el.tagName + '.' + (el.className?.split(' ')[0] || '') + ' extends ' + Math.round(r.right - slideRect.right) + 'px beyond right edge' });
      }
    });
    slide.querySelectorAll('.flow-step, .tool-card, .tree-leaf, .ecosystem-item, .tier-item, .handoff-step').forEach((el, i) => {
      const text = el.textContent?.trim();
      if (!text && !el.querySelector('img, svg')) {
        results.issues.push({ type: 'empty-container', severity: 'important', detail: el.className + ' #' + i + ' has no visible content' });
      }
    });
    if (content) {
      const contentRect = content.getBoundingClientRect();
      const margin = slideRect.bottom - contentRect.bottom;
      results.spacing.bottomMargin = Math.round(margin);
      if (margin < 0) {
        results.issues.push({ type: 'content-exceeds-canvas', severity: 'critical', detail: 'Content extends ' + Math.abs(Math.round(margin)) + 'px beyond slide bottom' });
      } else if (margin < 20) {
        results.issues.push({ type: 'tight-fit', severity: 'important', detail: 'Only ' + Math.round(margin) + 'px margin at bottom' });
      } else if (margin < 40) {
        results.issues.push({ type: 'snug-fit', severity: 'minor', detail: Math.round(margin) + 'px margin at bottom' });
      }
    }
    slide.querySelectorAll('pre, .code-block').forEach((el, i) => {
      const text = el.textContent || '';
      if (/[\u250C\u2510\u2514\u2518\u2502\u2500\u253C\u2554\u2557\u255A\u255D\u2551\u2550]/.test(text)) {
        results.issues.push({ type: 'ascii-box-drawing', severity: (slideType === 'code-example') ? 'info' : 'critical', detail: 'pre/code-block contains box-drawing chars. First 200 chars: ' + text.substring(0, 200).replace(/\n/g, '\\n') });
      }
      if (/\*\*[^*]+\*\*/.test(text) && slideType !== 'code-example') {
        results.issues.push({ type: 'literal-markdown-asterisks', severity: 'important', detail: 'pre/code-block contains literal **bold** markdown asterisks' });
      }
    });
    const fontChecks = [
      { sel: '.slide-title', expected: ['Space Grotesk','Inter','Playfair'], label: 'title' },
      { sel: '.slide-body', expected: ['Inter','Space Grotesk','Playfair'], label: 'body' },
      { sel: 'code, .code-block', expected: ['JetBrains Mono'], label: 'code' }
    ];
    fontChecks.forEach(({ sel, expected, label }) => {
      const el = slide.querySelector(sel);
      if (el) {
        const computed = getComputedStyle(el).fontFamily;
        results.fonts[label] = computed;
        if (!expected.some(f => computed.includes(f))) {
          results.issues.push({ type: 'font-fallback', severity: 'minor', detail: label + ' using fallback: ' + computed });
        }
      }
    });
    const contentBlocks = slide.querySelectorAll('.flow-step, .tool-card, .tree-branch, .tree-leaf, .tier-item, .handoff-step, .ecosystem-item');
    const blockRects = [...contentBlocks].map(el => ({ el, rect: el.getBoundingClientRect() })).filter(b => b.rect.height > 0);
    for (let i = 0; i < blockRects.length; i++) {
      for (let j = i + 1; j < blockRects.length; j++) {
        const a = blockRects[i], b = blockRects[j];
        if (a.el.parentElement !== b.el.parentElement) continue;
        const overlapY = Math.min(a.rect.bottom, b.rect.bottom) - Math.max(a.rect.top, b.rect.top);
        const overlapX = Math.min(a.rect.right, b.rect.right) - Math.max(a.rect.left, b.rect.left);
        if (overlapY > 4 && overlapX > 4) {
          results.issues.push({ type: 'sibling-overlap', severity: 'important', detail: a.el.className.split(' ')[0] + ' and ' + b.el.className.split(' ')[0] + ' overlap by ' + Math.round(overlapY) + 'px' });
          break;
        }
      }
    }
    return results;
  });
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });

  for (const slideNum of TARGET_SLIDES) {
    // Set localStorage to jump to this slide (0-based index)
    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
    await page.evaluate((idx) => {
      localStorage.setItem('pres-current-slide', String(idx));
      localStorage.removeItem('pres-theme');
      localStorage.removeItem('pres-notes');
      localStorage.removeItem('pres-hidden-slides');
    }, slideNum - 1);
    await page.reload({ waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(1200);

    // Verify correct slide is active
    const activeNum = await page.evaluate(() => {
      const active = document.querySelector('.slide.active');
      return active ? active.dataset.number : 'none';
    });
    
    const ssPath = path.join(SCREENSHOT_DIR, 'slide-' + String(slideNum).padStart(3, '0') + '.png');
    await page.screenshot({ path: ssPath, fullPage: false });
    
    const result = await checkSlide(page);
    console.log('--- SLIDE ' + slideNum + ' (data-number=' + activeNum + ') ---');
    console.log('Title: ' + result.slideTitle);
    console.log('Type: ' + result.slideType);
    console.log('Counter: ' + result.slideNumber);
    console.log('Bottom margin: ' + (result.spacing?.bottomMargin ?? 'N/A') + 'px');
    console.log('Overflow: scrollH=' + (result.overflow?.vertical?.scrollHeight ?? '?') + ' clientH=' + (result.overflow?.vertical?.clientHeight ?? '?') + ' overflowing=' + (result.overflow?.vertical?.overflowing ?? '?'));
    console.log('Issues (' + result.issues.length + '):');
    result.issues.forEach(iss => console.log('  [' + iss.severity + '] ' + iss.type + ': ' + iss.detail));
    console.log('Fonts: title=' + (result.fonts?.title ?? 'N/A').substring(0,50) + ' | body=' + (result.fonts?.body ?? 'N/A').substring(0,50) + ' | code=' + (result.fonts?.code ?? 'N/A').substring(0,50));
    console.log('');
  }

  // Final console error check
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  await page.evaluate(() => { localStorage.setItem('pres-current-slide', '0'); });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  console.log('=== Final console errors: ' + errors.length + ' ===');
  errors.forEach(e => console.log('  ERR: ' + e));

  await browser.close();
  console.log('DONE');
})().catch(e => console.error('FATAL: ' + e.message));
