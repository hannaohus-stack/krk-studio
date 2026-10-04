/* KRK Studio — Work detail renderer (v2 · 261005)
   Reads the page's `cases` data object (IMAGE_NAMING.md slots) and renders the split layout.
   Rules: empty slots are skipped, never filled; text still holding a {placeholder} is not shown. */
(function () {
  var ORDER = [
    { id: 'balanceb', name: 'Balance B' },
    { id: 'mium', name: 'Mium' },
    { id: 'urbanpure', name: 'UrbanPure' },
    { id: 'zzl', name: 'ZZL' }
  ];

  var list = (typeof cases !== 'undefined' && cases) || [];
  var params = new URLSearchParams(window.location.search);
  var c = list.find(function (x) { return x.id === params.get('case'); }) || list[0];
  if (!c) return;

  function filled(v) { return typeof v === 'string' && v.trim() !== '' && !/\{[^}]*\}/.test(v); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]; }); }
  function srcs(arr) { return (arr || []).filter(filled); }

  function media(src, ratio, alt, eager) {
    var isVideo = /\.(mp4|webm|mov)$/i.test(src);
    var inner = isVideo
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
  var credits = [['Scope', c.scope], ['Tools', c.tools], ['Direction', c.director]].filter(function (r) { return filled(r[1]); });
  var checks = (c.wfChecks || []).filter(filled);
  var hasWf = filled(c.wfTitle) || filled(c.wfLead) || checks.length;

  var t = '';
  t += '<div class="meta-row label"><span>' + esc(metaLeft) + '</span><span>Work ' + String(pos + 1).padStart(2, '0') + ' / ' + String(ORDER.length).padStart(2, '0') + '</span></div>';
  t += '<div><h1 class="case-title">' + esc(name) + '</h1>' + (sloganLine ? '<p class="case-slogan">' + esc(sloganLine) + '</p>' : '') + '</div>';
  if (filled(c.overviewLead)) t += '<p class="case-lead">' + esc(c.overviewLead) + '</p>';
  if (credits.length) t += '<dl class="credits">' + credits.map(function (r) { return '<div><dt>' + r[0] + '</dt><dd>' + esc(r[1]) + '</dd></div>'; }).join('') + '</dl>';
  if (hasWf) {
    t += '<div class="acc"><button class="acc-btn" type="button" aria-expanded="false" aria-controls="wf-panel"><span class="label" style="color: inherit">Workflow</span><span class="plus" aria-hidden="true">+</span></button>';
    t += '<div class="acc-panel" id="wf-panel" hidden>';
    if (filled(c.wfTitle)) t += '<p class="wf-title">' + esc(c.wfTitle) + '</p>';
    if (filled(c.wfLead)) t += '<p class="wf-lead">' + esc(c.wfLead) + '</p>';
    if (checks.length) t += '<ol>' + checks.map(function (x, i) { return '<li><span>' + String(i + 1).padStart(2, '0') + '</span><span>' + esc(x) + '</span></li>'; }).join('') + '</ol>';
    t += '</div></div>';
  }
  var navHTML = '<a class="label" href="/work/">← Index</a><a class="next" href="/work/case_' + next.id + '.html">Next — ' + esc(next.name) + ' →</a>';
  t += '<nav class="case-nav" aria-label="케이스 이동">' + navHTML + '</nav>';
  document.querySelector('[data-text]').innerHTML = t;

  var btn = document.querySelector('.acc-btn');
  if (btn) btn.addEventListener('click', function () {
    var open = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', open ? 'false' : 'true');
    document.getElementById('wf-panel').hidden = open;
  });

  // ── Image column ────────────────────────────────────────
  var m = '';
  if (filled(c.heroImage)) m += media(c.heroImage, 'r-hero', name + ' 키비주얼', true);

  var sec = srcs(c.sectionGrid);
  if (sec.length) {
    // 2 · 1 · 2 rhythm; leftovers fall back to full width.
    var pattern = [2, 1, 2], k = 0, p = 0;
    while (k < sec.length) {
      var n = Math.min(pattern[p % pattern.length], sec.length - k);
      var chunk = sec.slice(k, k + n);
      m += n === 2 ? '<div class="row-2">' + chunk.map(function (s, i) { return media(s, 'r-sq', name + ' 캠페인 ' + (k + i + 1)); }).join('') + '</div>'
                   : media(chunk[0], 'r-sq', name + ' 캠페인 ' + (k + 1));
      k += n; p++;
    }
  }

  var ig = srcs(c.igGrid).slice(0, 3);
  if (ig.length) m += '<div class="row-3">' + ig.map(function (s, i) { return media(s, 'r-sq', name + ' 피드 ' + (i + 1)); }).join('') + '</div>';

  var story = srcs(c.storyCards);
  if (story.length) {
    m += '<div class="group-label label">Story</div>';
    m += '<div class="row-3 story-scroll">' + story.map(function (s, i) { return media(s, 'r-story', name + ' 스토리 ' + (i + 1)); }).join('') + '</div>';
  }

  var refs = srcs(c.wfRefs).slice(0, 6);
  if (filled(c.wfAnchor) || refs.length) {
    m += '<div class="group-label label">Workflow</div>';
    if (filled(c.wfAnchor)) m += media(c.wfAnchor, 'r-anchor', name + ' 기준 이미지');
    if (refs.length) m += '<div class="row-3">' + refs.map(function (s, i) { return media(s, 'r-sq', name + ' 확장 ' + (i + 1)); }).join('') + '</div>';
  }

  if (filled(c.webImage)) m += media(c.webImage, 'r-free', name + ' 웹 미리보기');

  m += '<nav class="case-nav is-mobile" aria-label="케이스 이동">' + navHTML + '</nav>';
  document.querySelector('[data-media]').insertAdjacentHTML('afterbegin', m);
})();
