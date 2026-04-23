// Slide generator — reads ../../presentation-content.md, emits public/slides/slide-NNN.html
// Usage: node build-slides.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTENT = path.resolve(__dirname, '../../presentation-content.md');
const OUT_DIR = path.resolve(__dirname, 'public/slides');

fs.mkdirSync(OUT_DIR, { recursive: true });

const md = fs.readFileSync(CONTENT, 'utf8').replace(/\r\n/g, '\n').replace(/\r/g, '\n');

// Strip YAML frontmatter and intro outline
function stripFrontmatter(src) {
  if (!src.startsWith('---')) return src;
  const end = src.indexOf('\n---', 3);
  if (end === -1) return src;
  return src.slice(end + 4);
}
const body = stripFrontmatter(md);

// Split on slide boundaries. Each slide begins with `<!-- Slide N | Section: S | Type: T -->`
const SLIDE_RE = /<!--\s*Slide\s+(\d+)\s*\|\s*Section:\s*([^|]+?)\s*\|\s*Type:\s*([^\s]+)\s*-->/g;
const slides = [];
let m;
const matches = [];
while ((m = SLIDE_RE.exec(body)) !== null) {
  matches.push({ num: parseInt(m[1], 10), section: m[2].trim(), type: m[3].trim(), start: m.index, hdrEnd: m.index + m[0].length });
}
for (let i = 0; i < matches.length; i++) {
  const cur = matches[i];
  const end = i + 1 < matches.length ? matches[i + 1].start : body.length;
  const chunk = body.slice(cur.hdrEnd, end);
  // Strip trailing --- separator
  const clean = chunk.replace(/\n---\s*$/, '').trim();
  slides.push({ num: cur.num, section: cur.section, type: cur.type, raw: clean });
}

console.log(`Parsed ${slides.length} slides`);

/* ---------- Markdown → HTML ---------- */
function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

// inline: **bold**, *em*, `code`, links
function inline(s) {
  // First, protect inline code spans
  const codeSpans = [];
  s = s.replace(/`([^`]+)`/g, (_, c) => {
    codeSpans.push(c);
    return `\x00CODE${codeSpans.length - 1}\x00`;
  });
  s = escapeHtml(s);
  // bold
  s = s.replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>');
  // italic (single star, but not leftover)
  s = s.replace(/(^|[^\*])\*([^\*\n]+)\*(?!\*)/g, '$1<em>$2</em>');
  // restore code spans
  s = s.replace(/\x00CODE(\d+)\x00/g, (_, i) => `<code>${escapeHtml(codeSpans[+i])}</code>`);
  return s;
}

// Syntax highlight a code block. Lang-aware light pass.
function highlightCode(code, lang) {
  let s = escapeHtml(code);
  const L = (lang || '').toLowerCase();
  if (L === 'bash' || L === 'sh' || L === 'shell' || L === 'zsh') {
    s = s.replace(/(^|\n)(#[^\n]*)/g, (_, p, c) => `${p}<span class="cmt">${c}</span>`);
    s = s.replace(/\b(export|cd|echo|case|esac|if|then|fi|for|do|done|while|return|exit|function)\b/g,
      '<span class="kw">$1</span>');
    s = s.replace(/(&quot;[^&]*?&quot;|&#x27;[^&]*?&#x27;)/g, '<span class="str">$1</span>');
  } else if (L === 'python' || L === 'py') {
    s = s.replace(/(^|\n)(#[^\n]*)/g, (_, p, c) => `${p}<span class="cmt">${c}</span>`);
    s = s.replace(/\b(def|return|import|from|class|if|else|elif|for|while|None|True|False|in|and|or|not|as|with|try|except)\b/g,
      '<span class="kw">$1</span>');
    s = s.replace(/(&quot;[^&]*?&quot;|&#x27;[^&]*?&#x27;)/g, '<span class="str">$1</span>');
  } else if (L === 'jsonc' || L === 'json') {
    s = s.replace(/(\/\/[^\n]*)/g, '<span class="cmt">$1</span>');
    s = s.replace(/(&quot;[^&]*?&quot;)(\s*:)/g, '<span class="prop">$1</span>$2');
    s = s.replace(/:\s*(&quot;[^&]*?&quot;)/g, ': <span class="str">$1</span>');
    s = s.replace(/\b(true|false|null)\b/g, '<span class="kw">$1</span>');
    s = s.replace(/\b(\d+)\b/g, '<span class="num">$1</span>');
  } else if (L === 'yaml' || L === 'yml') {
    s = s.replace(/(^|\n)(\s*#[^\n]*)/g, (_, p, c) => `${p}<span class="cmt">${c}</span>`);
    s = s.replace(/(^|\n)(\s*)([A-Za-z_][\w-]*)(:)/g,
      (_, nl, ind, k, col) => `${nl}${ind}<span class="prop">${k}</span>${col}`);
    s = s.replace(/(&quot;[^&]*?&quot;|&#x27;[^&]*?&#x27;)/g, '<span class="str">$1</span>');
  } else if (L === 'markdown' || L === 'md') {
    s = s.replace(/(^|\n)(#[^\n]*)/g, (_, p, c) => `${p}<span class="kw">${c}</span>`);
    s = s.replace(/(^|\n)---(\s*\n)/g, '$1<span class="cmt">---</span>$2');
  } else if (L === 'text' || L === '' || L === undefined) {
    // no highlighting
  }
  return s;
}

// Render body markdown to HTML blocks. Handles: headings, lists, paragraphs,
// code fences, blockquotes, tables, images-placeholder.
function renderBody(md) {
  const lines = md.split('\n');
  const out = [];
  let i = 0;
  let title = null;
  let subtitle = null;

  // Pull leading H1 as title and next non-empty line as optional subtitle-ish (## or *italic*)
  while (i < lines.length && lines[i].trim() === '') i++;
  if (i < lines.length && lines[i].startsWith('# ')) {
    title = lines[i].slice(2).trim();
    i++;
    // subtitle = next non-empty line if it starts with ## or is italic-only
    let j = i;
    while (j < lines.length && lines[j].trim() === '') j++;
    if (j < lines.length) {
      const ln = lines[j].trim();
      if (ln.startsWith('## ')) {
        subtitle = ln.slice(3).trim();
        i = j + 1;
      } else if (/^\*[^*].*\*$/.test(ln) && !ln.startsWith('**')) {
        subtitle = ln.slice(1, -1).trim();
        i = j + 1;
      }
    }
  }

  // Separate speaker notes
  let notes = '';
  const bodyLines = [];
  let inNotes = false;
  let sourcesLine = '';
  for (let k = i; k < lines.length; k++) {
    const ln = lines[k];
    if (/^\*\*Speaker Notes:\*\*\s*$/.test(ln.trim())) { inNotes = true; continue; }
    if (/^Sources:/.test(ln.trim())) { sourcesLine = ln.trim(); continue; }
    if (inNotes) notes += ln + '\n';
    else bodyLines.push(ln);
  }

  // Now render bodyLines to HTML
  const html = renderBlocks(bodyLines);

  return { title, subtitle, html, notes: notes.trim(), sourcesLine };
}

function renderBlocks(lines) {
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const ln = lines[i];
    const trimmed = ln.trim();

    // blank
    if (trimmed === '') { i++; continue; }

    // code fence
    const fence = trimmed.match(/^```(\w*)\s*$/);
    if (fence) {
      const lang = fence[1];
      const codeLines = [];
      i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i].trim())) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      const code = codeLines.join('\n');
      out.push(`<div class="code-block"><code>${highlightCode(code, lang)}</code></div>`);
      continue;
    }

    // blockquote (possibly multiline)
    if (trimmed.startsWith('>')) {
      const qLines = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        qLines.push(lines[i].trim().replace(/^>\s?/, ''));
        i++;
      }
      // Detect attribution (last line starting with "— ")
      let attrib = '';
      if (qLines.length > 1 && /^—\s/.test(qLines[qLines.length - 1])) {
        attrib = qLines.pop();
      }
      const bodyHtml = qLines.map(l => inline(l)).join('<br>');
      const attribHtml = attrib ? `<footer>${inline(attrib)}</footer>` : '';
      out.push(`<blockquote class="slide-quote"><p>${bodyHtml}</p>${attribHtml}</blockquote>`);
      continue;
    }

    // table (line with | and next line with separator)
    if (trimmed.includes('|') && i + 1 < lines.length && /^\s*\|?[\s\-:|]+\|?\s*$/.test(lines[i + 1])) {
      const tbl = [];
      while (i < lines.length && lines[i].trim() !== '' && lines[i].includes('|')) {
        tbl.push(lines[i]);
        i++;
      }
      out.push(renderTable(tbl));
      continue;
    }

    // unordered list
    if (/^\s*[-*]\s+/.test(ln)) {
      const items = [];
      while (i < lines.length) {
        if (/^\s*[-*]\s+/.test(lines[i])) {
          items.push(lines[i].replace(/^\s*[-*]\s+/, ''));
          i++;
        } else if (lines[i].trim() === '' && i + 1 < lines.length && /^\s*[-*]\s+/.test(lines[i + 1])) {
          i++; // skip blank line between list items
        } else {
          break;
        }
      }
      out.push('<ul class="slide-list">' + items.map(t => `<li>${inline(t)}</li>`).join('') + '</ul>');
      continue;
    }

    // ordered list
    if (/^\s*\d+\.\s+/.test(ln)) {
      const items = [];
      while (i < lines.length) {
        if (/^\s*\d+\.\s+/.test(lines[i])) {
          items.push(lines[i].replace(/^\s*\d+\.\s+/, ''));
          i++;
        } else if (lines[i].trim() === '' && i + 1 < lines.length && /^\s*\d+\.\s+/.test(lines[i + 1])) {
          i++; // skip blank line between list items
        } else {
          break;
        }
      }
      out.push('<ol class="slide-list ordered">' + items.map(t => `<li>${inline(t)}</li>`).join('') + '</ol>');
      continue;
    }

    // ASCII-art box paragraph (starts with ┌ ├ └ │ │ ─)
    if (/^[┌├└│─┬┴┼]/.test(trimmed)) {
      // collect contiguous block
      const boxLines = [];
      while (i < lines.length && lines[i].trim() !== '' && /^[┌├└│─┬┴┼]|^\s*[│├]/.test(lines[i])) {
        boxLines.push(lines[i]);
        i++;
      }
      out.push(`<div class="code-block"><code>${escapeHtml(boxLines.join('\n'))}</code></div>`);
      continue;
    }

    // Paragraph (accumulate until blank / list / fence / quote / table / heading)
    const pLines = [];
    while (i < lines.length) {
      const l = lines[i];
      const t = l.trim();
      if (t === '') break;
      if (/^```/.test(t)) break;
      if (t.startsWith('>')) break;
      if (/^\s*[-*]\s+/.test(l)) break;
      if (/^\s*\d+\.\s+/.test(l)) break;
      if (/^#{1,6}\s/.test(t)) break;
      if (/^[┌├└│]/.test(t)) break;
      if (t.includes('|') && i + 1 < lines.length && /^\s*\|?[\s\-:|]+\|?\s*$/.test(lines[i + 1])) break;
      pLines.push(l);
      i++;
    }
    if (pLines.length) {
      const text = pLines.join(' ').trim();
      out.push(`<p class="slide-body">${inline(text)}</p>`);
    }
  }
  return out.join('\n');
}

function renderTable(lines) {
  // drop separator row
  const rows = lines
    .map(l => l.trim())
    .filter(l => l.length)
    .filter(l => !/^\|?[\s\-:|]+\|?$/.test(l))
    .map(l => {
      const cells = l.replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim());
      return cells;
    });
  if (rows.length === 0) return '';
  const header = rows[0];
  const body = rows.slice(1);
  const colCount = header.length;
  const dense = colCount >= 4 ? ' dense' : '';
  const thead = `<thead><tr>${header.map(h => `<th>${inline(h)}</th>`).join('')}</tr></thead>`;
  const tbody = `<tbody>${body.map(r => `<tr>${r.map(c => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody>`;
  return `<table class="slide-table${dense}">${thead}${tbody}</table>`;
}

/* ---------- Per-slide rendering ---------- */
function buildSlide(slide) {
  const { num, section, type, raw } = slide;
  const { title, subtitle, html, notes, sourcesLine } = renderBody(raw);

  let content;

  if (type === 'title-slide') {
    content = `
      ${title ? `<h1 class="slide-title">${inline(title)}</h1>` : ''}
      ${subtitle ? `<p class="slide-subtitle">${inline(subtitle)}</p>` : ''}
      ${html}
    `;
  } else if (type === 'demo-placeholder') {
    // Strip the title body since we want a centered layout
    content = `
      ${title ? `<h1 class="slide-title">${inline(title)}</h1>` : ''}
      <div class="demo-badge">🎬 LIVE DEMO</div>
      <p class="demo-note">Presenter fills this in live — see speaker notes for suggestions.</p>
    `;
  } else if (type === 'break') {
    content = `
      ${title ? `<h1 class="slide-title">${inline(title)}</h1>` : ''}
      ${subtitle ? `<p class="slide-subtitle">${inline(subtitle)}</p>` : ''}
      ${html}
    `;
  } else {
    content = `
      ${title ? `<h1 class="slide-title">${inline(title)}</h1>` : ''}
      ${subtitle ? `<p class="slide-subtitle">${inline(subtitle)}</p>` : ''}
      ${html}
    `;
  }

  const notesHtml = notes
    ? `<aside class="speaker-notes" hidden>${inline(notes).replace(/\n{2,}/g, '<br><br>').replace(/\n/g, ' ')}</aside>`
    : '';

  const padded = String(num).padStart(3, '0');

  return `<article class="slide" data-number="${num}" data-type="${type}" data-section="${escapeHtml(section)}">
  <div class="slide-bg"></div>
  <div class="slide-content">
${content.split('\n').filter(l => l.trim()).map(l => '    ' + l).join('\n')}
  </div>
  ${notesHtml}
</article>`;
}

// Emit
let written = 0;
let skipped = 0;
for (const slide of slides) {
  const padded = String(slide.num).padStart(3, '0');
  const outPath = path.join(OUT_DIR, `slide-${padded}.html`);

  // Respect hand-crafted overrides
  if (fs.existsSync(outPath)) {
    const existing = fs.readFileSync(outPath, 'utf8');
    if (existing.startsWith('<!-- HAND-CRAFTED OVERRIDE')) {
      console.log(`Skipping slide ${slide.num} (hand-crafted override)`);
      skipped++;
      continue;
    }
  }

  const html = buildSlide(slide);
  fs.writeFileSync(outPath, html, 'utf8');
  written++;
}
console.log(`Wrote ${written} slide files to ${OUT_DIR} (skipped ${skipped} hand-crafted)`);
