/* KRK Studio — Work detail renderer (v2.1 · 261005)
   Reads the page's `cases` data object (IMAGE_NAMING.md slots) and renders the split layout.

   Images (PC): one continuous stream, no labels, in slot order
     heroImage → sectionGrid → igGrid → storyCards → wfAnchor → wfRefs → webImage
   To split the stream into labelled sections, add to the case object:
     sections: [
       { label: 'Campaign', slots: ['heroImage', 'sectionGrid'] },
       { label: 'Story',    slots: ['storyCards'] },
       { label: 'Workflow', slots: ['wfAnchor', 'wfRefs'] }
     ]
   Slots not listed are skipped. Without `sections`, everything is shown unlabelled.

   Mobile: the same images as a 4:3 swipe slider above the text.
   Rules: empty slots are skipped, never filled; text still holding a {placeholder} is not shown. */
(function () {
  var ORDER = [
    { id: 'balanceb', name: 'Balance B' },
    { id: 'mium', name: 'Mium' },
    { id: 'urbanpure', name: 'UrbanPure' },
    { id: 'zzl', name: 'ZZL' }
  ];
  var SLOT_ORDER = ['heroImage', 'sectionGrid', 'igGrid', 'storyCards', 'wfAnchor', 'wfRefs', 'webImage'];

  var list = (typeof cases !== 'undefined' && cases) || [];
  var params = new URLSearchParams(window.location.search);
  var c = list.find(function (x) { return x.id === params.get('case'); }) || list[0];
  if (!c) return;

  function filled(v) { return typeof v === 'string' && v.trim() !== '' && !/\{[^}]*\}/.test(v); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]; }); }
  function srcs(v) { return (Array.isArray(v) ? v : [v]).filter(filled); }
  function isVideo(src) { return /\.(mp4|webm|mov)$/i.test(src); }

  function media(src, ratio, alt, eager) {
    var inner = isVideo(src)
      ? '<video src="' + esc(src) + '" autoplay muted loop playsinline preload="metadata" aria-label="' + esc(alt) + '"></video>'
      : '<img src="' + esc(src) + '" alt="' + esc(alt) + '"' + (eager ? '' : ' loading="lazy"') + ' />';
    return '<figure class="' + ratio + '">' + inner + '</figure>';
  }

  var name = c.en || c.name;
  var pos = ORDER.findIndex(function (o) { return o.id === c.id; });
  var next = ORDER[(pos + 1) % ORDER.length];
  var sloganLine = filled(c.slogan) ? c.slogan.split(/<br\s*\/?>/i)[0].trim() : '';

  document.title = name + ' — KRK Studio Work';

  // ── Text column ─────────────────────────────────────────
  var metaLeft = [c.category, c.period].filter(filled).join(' · ');
  var credits = [['Scope', c.scope], ['Tools', c.tools]].filter(function (r) { return filled(r[1]); });
  var checks = (c.wfChecks || []).filter(filled);
  var hasWf = filled(c.wfTitle) || filled(c.wfLead) || checks.length;
  var navHTML = '<a class="label" href="/work/">← Index</a><a class="next" href="/work/case_' + next.id + '.html">Next — ' + esc(next.name) + ' →</a>';

  var t = '';
  t += '<div class="meta-row label"><span>' + esc(metaLeft) + '</span><span>Work ' + String(pos + 1).padStart(2, '0') + ' / ' + String(ORDER.length).padStart(2, '0') + '</span></div>';
  t += '<div><h1 class="case-title">' + esc(name) + '</h1>' + (sloganLine ? '<p class="case-slogan">' + esc(sloganLine) + '</p>' : '') + '</div>';
  if (filled(c.overviewLead)) t += '<p class="case-lead">' + esc(c.overviewLead) + '</p>';
  if (credits.length || hasWf) {
    t += '<div class="credits">';
    credits.forEach(function (r) { t += '<div class="credit"><span class="k">' + r[0] + '</span><span>' + esc(r[1]) + '</span></div>'; });
    if (hasWf) {
      t += '<button class="acc-btn" type="button" aria-expanded="false" aria-controls="wf-panel"><span class="k">Workflow</span><span class="plus" aria-hidden="true">+</span></button>';
      t += '<div class="acc-panel" id="wf-panel" hidden>';
      if (filled(c.wfTitle)) t += '<p class="wf-title">' + esc(c.wfTitle) + '</p>';
      if (filled(c.wfLead)) t += '<p class="wf-lead">' + esc(c.wfLead) + '</p>';
      if (checks.length) t += '<ol>' + checks.map(function (x, i) { return '<li><span>' + String(i + 1).padStart(2, '0') + '</span><span>' + esc(x) + '</span></li>'; }).join('') + '</ol>';
      t += '</div>';
    }
    t += '</div>';
  }
  t += '<nav class="case-nav" aria-label="케이스 이동">' + navHTML + '</nav>';
  document.querySelector('[data-text]').innerHTML = t;

  var btn = document.querySelector('.acc-btn');
  if (btn) btn.addEventListener('click', function () {
    var open = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', open ? 'false' : 'true');
    document.getElementById('wf-panel').hidden = open;
  });

  // ── Image column (PC) ───────────────────────────────────
  function renderSlot(slot) {
    var items = srcs(c[slot]);
    if (!items.length) return '';
    var out = '';
    if (slot === 'heroImage') return media(items[0], 'r-hero', name + ' 키비주얼', true);
    if (slot === 'sectionGrid') {
      var pattern = [2, 1, 2], k = 0, p = 0;
      while (k < items.length) {
        var n = Math.min(pattern[p % pattern.length], items.length - k), chunk = items.slice(k, k + n), base = k;
        out += n === 2 ? '<div class="row-2">' + chunk.map(function (s, i) { return media(s, 'r-sq', name + ' 캠페인 ' + (base + i + 1)); }).join('') + '</div>'
                       : media(chunk[0], 'r-sq', name + ' 캠페인 ' + (base + 1));
        k += n; p++;
      }
      return out;
    }
    if (slot === 'igGrid') return '<div class="row-3">' + items.slice(0, 3).map(function (s, i) { return media(s, 'r-sq', name + ' 피드 ' + (i + 1)); }).join('') + '</div>';
    if (slot === 'storyCards') return '<div class="row-3">' + items.map(function (s, i) { return media(s, 'r-story', name + ' 스토리 ' + (i + 1)); }).join('') + '</div>';
    if (slot === 'wfAnchor') return media(items[0], 'r-anchor', name + ' 기준 이미지');
    if (slot === 'wfRefs') return '<div class="row-3">' + items.slice(0, 6).map(function (s, i) { return media(s, 'r-sq', name + ' 확장 ' + (i + 1)); }).join('') + '</div>';
    if (slot === 'webImage') return media(items[0], 'r-free', name + ' 웹 미리보기');
    return '';
  }

  var m = '';
  if (Array.isArray(c.sections) && c.sections.length) {
    c.sections.forEach(function (sec) {
      var body = (sec.slots || []).map(renderSlot).join('');
      if (!body) return;
      if (filled(sec.label)) m += '<div class="group-label label">' + esc(sec.label) + '</div>';
      m += body;
    });
  } else {
    m += SLOT_ORDER.map(renderSlot).join('');
  }
  document.querySelector('[data-media]').insertAdjacentHTML('afterbegin', m);

  // ── Mobile sticky "Detail +" ────────────────────────────
  var md = document.querySelector('[data-mdetail]');
  if (md) {
    document.querySelector('[data-mname]').textContent = name;
    var panel = document.querySelector('[data-mpanel]');
    var pt = '';
    pt += '<div class="meta-row label"><span>' + esc(metaLeft) + '</span><span>Work ' + String(pos + 1).padStart(2, '0') + ' / ' + String(ORDER.length).padStart(2, '0') + '</span></div>';
    if (sloganLine) pt += '<p class="case-slogan">' + esc(sloganLine) + '</p>';
    if (filled(c.overviewLead)) pt += '<p class="case-lead">' + esc(c.overviewLead) + '</p>';
    if (credits.length || hasWf) {
      pt += '<div class="credits">';
      credits.forEach(function (r) { pt += '<div class="credit"><span class="k">' + r[0] + '</span><span>' + esc(r[1]) + '</span></div>'; });
      if (hasWf) {
        pt += '<div class="credit"><span class="k">Workflow</span><div>';
        if (filled(c.wfTitle)) pt += '<p class="wf-title" style="margin: 0 0 6px">' + esc(c.wfTitle) + '</p>';
        if (filled(c.wfLead)) pt += '<p class="wf-lead" style="margin: 0 0 8px">' + esc(c.wfLead) + '</p>';
        if (checks.length) pt += '<ol class="wf-list">' + checks.map(function (x, i) { return '<li><span>' + String(i + 1).padStart(2, '0') + '</span><span>' + esc(x) + '</span></li>'; }).join('') + '</ol>';
        pt += '</div></div>';
      }
      pt += '</div>';
    }
    panel.innerHTML = pt;
    var bar = md.querySelector('.m-detail-bar');
    bar.addEventListener('click', function () {
      var open = bar.getAttribute('aria-expanded') === 'true';
      bar.setAttribute('aria-expanded', open ? 'false' : 'true');
      panel.hidden = open;
      md.classList.toggle('is-open', !open);
    });
  }

  // ── Mobile slider (4:3, manual swipe) ───────────────────
  var all = [];
  SLOT_ORDER.forEach(function (slot) { srcs(c[slot]).forEach(function (s) { all.push(s); }); });
  var slider = document.querySelector('[data-slider]');
  if (slider && all.length) {
    var track = slider.querySelector('.m-track');
    track.innerHTML = all.map(function (s, i) {
      var alt = name + ' ' + String(i + 1).padStart(2, '0');
      return '<figure class="m-slide">' + (isVideo(s)
        ? '<video src="' + esc(s) + '" autoplay muted loop playsinline preload="metadata" aria-label="' + esc(alt) + '"></video>'
        : '<img src="' + esc(s) + '" alt="' + esc(alt) + '"' + (i > 1 ? ' loading="lazy"' : '') + ' />') + '</figure>';
    }).join('');
    var count = slider.querySelector('.m-count'), total = String(all.length).padStart(2, '0');
    function upd() {
      var i = Math.round(track.scrollLeft / Math.max(track.clientWidth, 1));
      count.textContent = String(Math.min(i, all.length - 1) + 1).padStart(2, '0') + ' / ' + total;
    }
    upd();
    track.addEventListener('scroll', function () { window.requestAnimationFrame(upd); }, { passive: true });
  }
})();
