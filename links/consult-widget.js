/* ============================================================
   KRK Consult Widget
   Usage:
     <script src="assets/consult-widget.js" defer></script>

   This script auto-injects:
   - CSS into <head>
   - Floating trigger button + chatbot panel into <body>
   - 3-step flow: Service → Info (+ privacy consent) → Done (담당자 메일 안내)

   Config (edit below):
   - MAKE_WEBHOOK : Make.com webhook URL (silent background submit)
   ============================================================ */

(function () {
  'use strict';

  // Prevent double-injection
  if (window.__KRK_CONSULT_LOADED__) return;
  window.__KRK_CONSULT_LOADED__ = true;

  // ── CONFIG ────────────────────────────────────────────────
  const MAKE_WEBHOOK = 'https://hook.us2.make.com/ivkfkwhkegwoalggl64mxnljhtex8sej';

  // ── CSS ───────────────────────────────────────────────────
  const css = `
    /* KRK Studio system: white ground · ink #161311 · radius 0 · fills instead of rules · Noto Sans KR */
    .krk-c-root, .krk-c-root * { box-sizing: border-box; }
    .krk-c-root { --ink: #161311; --muted: #4a4f52; --mist: #f1f2f0; --mist-2: #e8eae7; --hair: rgba(22,19,17,.16); --signal: #eb5328; --signal-ink: #a8330c;
      font-family: 'Noto Sans KR', system-ui, -apple-system, 'Apple SD Gothic Neo', sans-serif; color: var(--ink); -webkit-font-smoothing: antialiased; }

    /* TRIGGER */
    .krk-c-trigger {
      position: fixed; right: 28px; bottom: 28px; z-index: 9900;
      display: inline-flex; align-items: center; gap: 10px; height: 44px; padding: 0 18px 0 16px;
      border: 1px solid var(--ink); border-radius: 0; background: #fff; color: var(--ink);
      font-family: inherit; font-size: 13px; font-weight: 500; letter-spacing: 0.02em; cursor: pointer;
      transition: background .18s ease, color .18s ease;
    }
    .krk-c-trigger:hover { background: var(--mist); color: var(--ink); }
    .krk-c-trigger .dot { width: 6px; height: 6px; border-radius: 50%; background: #22a06b; animation: krk-dot-pulse 2s ease-in-out infinite; }
    @keyframes krk-dot-pulse { 0%,100% { opacity: 1; } 50% { opacity: .35; } }
    @keyframes krk-c-shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }
    .krk-c-services.is-shake { animation: krk-c-shake .3s ease; }

    /* PANEL */
    .krk-c-panel {
      position: fixed; right: 28px; bottom: 84px; z-index: 9901; width: 400px; max-height: calc(100vh - 112px);
      display: flex; flex-direction: column; background: #fff; border: 1px solid var(--ink); border-radius: 0;
      box-shadow: 0 24px 64px rgba(22,19,17,.14);
      opacity: 0; visibility: hidden; transform: translateY(12px); transition: opacity .22s ease, transform .22s ease, visibility 0s linear .22s;
    }
    .krk-c-panel.is-open { opacity: 1; visibility: visible; transform: translateY(0); transition: opacity .22s ease, transform .22s ease; }

    .krk-c-top { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 18px 20px 0; }
    .krk-c-progress { display: flex; gap: 6px; flex: 1; max-width: 160px; }
    .krk-c-progress-step { height: 2px; flex: 1; background: var(--mist-2); transition: background .2s ease; }
    .krk-c-progress-step.is-done { background: var(--ink); }
    .krk-c-progress-step.is-active { background: var(--ink); }
    .krk-c-close {
      width: 32px; height: 32px; border: 0; border-radius: 0; background: transparent; color: var(--muted);
      font-family: 'Libre Caslon Text', Georgia, serif; font-size: 22px; line-height: 1; cursor: pointer; transition: color .15s ease;
    }
    .krk-c-close:hover { color: var(--ink); }

    .krk-c-body { padding: 20px 20px 22px; overflow: auto; }
    .krk-c-step { display: none; }
    .krk-c-step.is-active { display: block; animation: krk-c-fadein .22s ease; }
    @keyframes krk-c-fadein { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }

    .krk-c-step-label { font-size: 10px; font-weight: 500; letter-spacing: .14em; text-transform: uppercase; color: var(--muted); margin-bottom: 10px; }
    .krk-c-step-q { margin: 0 0 18px; font-size: 18px; font-weight: 500; line-height: 1.35; letter-spacing: -.01em; }

    /* SERVICES — filled cards, no borders */
    .krk-c-services { display: flex; flex-direction: column; gap: 6px; }
    .krk-c-service {
      display: grid; grid-template-columns: 28px 1fr; gap: 10px; align-items: start; width: 100%; padding: 14px 16px;
      border: 0; border-radius: 0; background: var(--mist); color: var(--ink); text-align: left; font-family: inherit; cursor: pointer;
      transition: background .15s ease, color .15s ease;
    }
    .krk-c-service:hover { background: var(--mist-2); }
    .krk-c-service.is-selected { background: var(--ink); color: #fff; }
    .krk-c-service .snum { font-family: 'Libre Caslon Text', Georgia, serif; font-size: 12px; color: var(--muted); padding-top: 2px; }
    .krk-c-service.is-selected .snum { color: rgba(255,255,255,.55); }
    .krk-c-service .sbody h4 { margin: 0 0 3px; font-size: 14px; font-weight: 500; letter-spacing: -.005em; }
    .krk-c-service .sbody p { margin: 0; font-size: 12px; line-height: 1.55; color: var(--muted); }
    .krk-c-service.is-selected .sbody p { color: rgba(255,255,255,.7); }

    /* FIELDS — bottom hairline only */
    .krk-c-fields { display: flex; flex-direction: column; gap: 18px; }
    .krk-c-field { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
    .krk-c-field label { font-size: 10px; font-weight: 500; letter-spacing: .14em; text-transform: uppercase; color: var(--muted); }
    .krk-c-field label em { font-style: normal; color: var(--signal-ink); margin-left: 2px; }
    .krk-c-input, .krk-c-select {
      width: 100%; padding: 11px 0; border: 0; border-bottom: 1px solid var(--hair); border-radius: 0; background: transparent;
      font-family: inherit; font-size: 14px; color: var(--ink); outline: none; appearance: none; -webkit-appearance: none; transition: border-color .15s ease;
    }
    .krk-c-select { background-image: linear-gradient(45deg, transparent 50%, var(--muted) 50%), linear-gradient(135deg, var(--muted) 50%, transparent 50%);
      background-position: calc(100% - 9px) 55%, calc(100% - 4px) 55%; background-size: 5px 5px; background-repeat: no-repeat; padding-right: 20px; cursor: pointer; }
    .krk-c-input::placeholder { color: rgba(22,19,17,.32); }
    .krk-c-input:focus, .krk-c-select:focus { border-bottom-color: var(--ink); }
    .krk-c-input.is-error, .krk-c-select.is-error { border-bottom-color: var(--signal-ink); }
    .krk-c-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

    /* CONSENT */
    .krk-c-consent { display: flex; align-items: flex-start; gap: 10px; margin-top: 4px; font-size: 12px; line-height: 1.6; color: var(--muted); cursor: pointer; }
    .krk-c-consent input { appearance: none; -webkit-appearance: none; flex: 0 0 auto; width: 14px; height: 14px; margin: 3px 0 0; border: 1px solid var(--ink); border-radius: 0; background: #fff; cursor: pointer; }
    .krk-c-consent input:checked { background: var(--ink); box-shadow: inset 0 0 0 3px #fff; }
    .krk-c-consent input:focus-visible { outline: 2px solid var(--ink); outline-offset: 3px; }
    .krk-c-consent em { font-style: normal; color: var(--signal-ink); margin-right: 2px; }
    .krk-c-consent.is-error { color: var(--signal-ink); }
    .krk-c-consent.is-error input { border-color: var(--signal-ink); }
    .krk-c-consent details { display: inline; }
    .krk-c-consent summary { display: inline; cursor: pointer; list-style: none; color: var(--ink); text-decoration: underline; text-underline-offset: 3px; }
    .krk-c-consent summary::-webkit-details-marker { display: none; }
    .krk-c-consent-body { display: none; }
    .krk-c-consent details[open] .krk-c-consent-body { display: block; margin-top: 8px; padding: 10px 12px; background: var(--mist); font-size: 11.5px; line-height: 1.65; }

    /* DONE */
    .krk-c-done { padding: 18px 16px 20px; background: var(--mist); }
    .krk-c-done-main { margin: 0 0 10px; font-size: 15px; font-weight: 500; line-height: 1.5; color: var(--ink); }
    .krk-c-done-sub { margin: 0 0 12px; font-size: 12.5px; line-height: 1.6; color: var(--muted); }
    .krk-c-done-sub:empty { display: none; }
    a.krk-c-btn-back { text-decoration: none; display: inline-block; }

    /* ACTIONS */
    .krk-c-actions { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-top: 20px; }
    .krk-c-btn-back { visibility: hidden; padding: 10px 0; border: 0; background: transparent; font-family: inherit; font-size: 12px; letter-spacing: .04em; color: var(--muted); cursor: pointer; transition: color .15s ease; }
    .krk-c-btn-back.is-visible { visibility: visible; }
    .krk-c-btn-back:hover { color: var(--ink); }
    .krk-c-btn-next {
      padding: 12px 18px; border: 1px solid var(--ink); border-radius: 0; background: var(--ink); color: #fff;
      font-family: inherit; font-size: 13px; font-weight: 500; letter-spacing: .02em; cursor: pointer; transition: background .15s ease, color .15s ease;
    }
    .krk-c-btn-next:hover { background: #fff; color: var(--ink); }
    .krk-c-btn-next:disabled { opacity: .35; cursor: not-allowed; background: var(--ink); color: #fff; }

    /* MOBILE */
    @media (max-width: 450px) {
      .krk-c-trigger { right: 16px; bottom: 16px; }
      .krk-c-panel {
        right: 0; left: 0; bottom: 0; width: 100%; max-height: 88vh; border-left: 0; border-right: 0; border-bottom: 0;
        transform: translateY(100%); box-shadow: 0 -16px 48px rgba(22,19,17,.12);
      }
      .krk-c-panel.is-open { transform: translateY(0); }
      .krk-c-row { grid-template-columns: 1fr; }
    }
    @media (min-width: 451px) and (max-width: 900px) {
      .krk-c-panel { right: 16px; bottom: 76px; width: min(400px, calc(100vw - 32px)); }
    }
  `;

  // ── HTML ──────────────────────────────────────────────────
  const html = `
    <button class="krk-c-trigger" id="krkCTrigger" type="button">
      <span class="dot"></span>
      문의하기
    </button>

    <div class="krk-c-panel" id="krkCPanel" role="dialog" aria-modal="true" aria-label="KRK 문의하기">
      <div class="krk-c-top">
        <div class="krk-c-progress" aria-hidden="true">
          <div class="krk-c-progress-step is-active" data-prog="0"></div>
          <div class="krk-c-progress-step" data-prog="1"></div>
          <div class="krk-c-progress-step" data-prog="2"></div>
        </div>
        <button class="krk-c-close" id="krkCClose" type="button" aria-label="닫기">×</button>
      </div>

      <div class="krk-c-body">
        <!-- Step 1 -->
        <div class="krk-c-step is-active" data-step="0">
          <div class="krk-c-step-label">Step 01</div>
          <p class="krk-c-step-q">어떤 서비스가 필요하세요?</p>
          <div class="krk-c-services">
            <button type="button" class="krk-c-service" data-service="branding" data-label="Branding">
              <span class="snum">01</span>
              <span class="sbody">
                <h4>Branding</h4>
                <p>제품은 있고 브랜드가 없을 때. 전략 · 아이덴티티 · 패키지 · AI Brand OS까지 한 번에.</p>
              </span>
            </button>
            <button type="button" class="krk-c-service" data-service="campaign" data-label="Campaign">
              <span class="snum">02</span>
              <span class="sbody">
                <h4>Campaign</h4>
                <p>브랜드가 있을 때. 신제품 · 시즌 비주얼 세트 — 컨셉 1개 · 이미지 15컷 · 숏폼 2편.</p>
              </span>
            </button>
            <button type="button" class="krk-c-service" data-service="visualclub" data-label="Visual Club">
              <span class="snum">03</span>
              <span class="sbody">
                <h4>Visual Club</h4>
                <p>월 구독. 매달 같은 톤의 이미지 20컷 · 숏폼 2편.</p>
              </span>
            </button>
            <button type="button" class="krk-c-service" data-service="funding" data-label="정부자금 브랜딩">
              <span class="snum">04</span>
              <span class="sbody">
                <h4>정부자금 브랜딩</h4>
                <p>확보한 지원사업 예산에 맞춰 범위를 설계합니다.</p>
              </span>
            </button>
          </div>
          <div class="krk-c-actions">
            <button type="button" class="krk-c-btn-back" id="krkCBack0">← 이전</button>
            <button type="button" class="krk-c-btn-next" id="krkCNext0" disabled>다음 →</button>
          </div>
        </div>

        <!-- Step 2 -->
        <div class="krk-c-step" data-step="1">
          <div class="krk-c-step-label">Step 02</div>
          <p class="krk-c-step-q">기본 정보를 알려주세요.</p>
          <div class="krk-c-fields">
            <div class="krk-c-row">
              <div class="krk-c-field">
                <label for="krkCName">Name <em>*</em></label>
                <input class="krk-c-input" id="krkCName" type="text" placeholder="성함" />
              </div>
              <div class="krk-c-field">
                <label for="krkCBrand">Brand <em>*</em></label>
                <input class="krk-c-input" id="krkCBrand" type="text" placeholder="브랜드명" />
              </div>
            </div>
            <div class="krk-c-field">
              <label for="krkCStage">Stage <em>*</em></label>
              <select class="krk-c-select" id="krkCStage">
                <option value="">현재 단계 선택</option>
                <option>런칭 전 / 준비 단계</option>
                <option>운영 중 - 기준 정리 필요</option>
                <option>운영 중 - 확장 검토</option>
                <option>리브랜딩 / 시스템 점검</option>
              </select>
            </div>
            <div class="krk-c-field">
              <label for="krkCEmail">Email <em>*</em></label>
              <input class="krk-c-input" id="krkCEmail" type="email" placeholder="메일 주소" />
            </div>
            <label class="krk-c-consent" id="krkCConsentWrap">
              <input type="checkbox" id="krkCConsent" />
              <span><em>*</em>개인정보 수집 · 이용에 동의합니다.
                <details><summary>내용 보기</summary><span class="krk-c-consent-body">수집 항목: 성함 · 브랜드명 · 현재 단계 · 메일 주소 / 목적: 상담 예약 안내 및 제안 / 보관: 문의일로부터 1년, 요청 시 즉시 삭제 / 처리: 채움코리아(KRK Studio). 동의하지 않으면 신청이 접수되지 않습니다.</span></details>
              </span>
            </label>
          </div>
          <div class="krk-c-actions">
            <button type="button" class="krk-c-btn-back is-visible" id="krkCBack1">← 이전</button>
            <button type="button" class="krk-c-btn-next" id="krkCNext1">신청하기 →</button>
          </div>
        </div>

        <!-- Step 3 -->
        <div class="krk-c-step" data-step="2">
          <div class="krk-c-step-label">Step 03</div>
          <p class="krk-c-step-q">신청이 접수되었습니다.</p>
          <div class="krk-c-done">
            <p class="krk-c-done-main">1~2 영업일 내 담당자가 상담 예약을 위해<br>메일을 보내드립니다.</p>
            <p class="krk-c-done-sub" id="krkCDoneSub"></p>
          </div>
          <div class="krk-c-actions">
            <a class="krk-c-btn-back is-visible" href="/work/">Work 보기 →</a>
            <button type="button" class="krk-c-btn-next" id="krkCDone">닫기</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // ── INJECT ────────────────────────────────────────────────
  function inject() {
    // Font (skip if the page already loads Noto Sans KR)
    if (!document.querySelector('link[href*="Noto+Sans+KR"]')) {
      const l = document.createElement('link'); l.rel = 'stylesheet';
      l.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500&family=Libre+Caslon+Text&display=swap';
      document.head.appendChild(l);
    }
    // CSS
    const styleEl = document.createElement('style');
    styleEl.setAttribute('data-krk-consult', '');
    styleEl.textContent = css;
    document.head.appendChild(styleEl);

    // HTML
    const wrap = document.createElement('div');
    wrap.className = 'krk-c-root';
    wrap.innerHTML = html;
    document.body.appendChild(wrap);

    init();
  }

  // ── INIT ──────────────────────────────────────────────────
  function init() {
    let step = 0;
    const state = { service: '', serviceLabel: '', name: '', brand: '', stage: '', email: '' };

    const trigger  = document.getElementById('krkCTrigger');
    const panel    = document.getElementById('krkCPanel');
    const closeBtn = document.getElementById('krkCClose');
    const steps    = document.querySelectorAll('.krk-c-step');
    const progSteps = document.querySelectorAll('.krk-c-progress-step');

    // Open / close
    const resetState = () => {
      state.service = ''; state.serviceLabel = '';
      state.name = ''; state.brand = ''; state.stage = ''; state.email = '';
      document.querySelectorAll('.krk-c-service').forEach((c) => c.classList.remove('is-selected'));
      [fName, fBrand, fStage, fEmail].forEach((el) => {
        if (!el) return;
        el.value = '';
        el.classList.remove('is-error');
      });
      if (fConsent) { fConsent.checked = false; consentWrap.classList.remove('is-error'); }
      next0.disabled = true;
      renderStep(0);
    };
    const openPanel = () => {
      resetState();
      panel.classList.add('is-open');
    };
    const closePanel = () => {
      panel.classList.remove('is-open');
    };
    trigger.addEventListener('click', openPanel);
    closeBtn.addEventListener('click', closePanel);
    // Any <a href="#consult"> / [data-consult-open] on the page opens the panel (header Contact, CTAs).
    document.addEventListener('click', (e) => {
      const el = e.target.closest('[data-consult-open], a[href="#consult"]');
      if (!el) return;
      e.preventDefault();
      const menu = document.querySelector('[data-menu].is-open');
      if (menu) { const c = menu.querySelector('[data-menu-close]'); if (c) c.click(); }
      openPanel();
    });
    window.KRKConsult = { open: openPanel, close: closePanel };
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && panel.classList.contains('is-open')) closePanel();
    });

    // Render
    const renderStep = (s) => {
      step = s;
      steps.forEach((el) => el.classList.toggle('is-active', Number(el.dataset.step) === s));
      progSteps.forEach((el, i) => {
        el.classList.toggle('is-done', i < s);
        el.classList.toggle('is-active', i === s);
      });
    };

    // Step 1: service select
    const next0 = document.getElementById('krkCNext0');
    document.querySelectorAll('.krk-c-service').forEach((card) => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.krk-c-service').forEach((c) => c.classList.remove('is-selected'));
        card.classList.add('is-selected');
        state.service = card.dataset.service;
        state.serviceLabel = card.dataset.label;
        next0.disabled = false;
      });
    });
    const serviceGrid = document.querySelector('.krk-c-services');
    next0.addEventListener('click', () => {
      if (!state.service) {
        serviceGrid.classList.remove('is-shake');
        void serviceGrid.offsetWidth; // reflow to restart animation
        serviceGrid.classList.add('is-shake');
        return;
      }
      renderStep(1);
    });

    // Step 2: info input
    const fName  = document.getElementById('krkCName');
    const fBrand = document.getElementById('krkCBrand');
    const fStage = document.getElementById('krkCStage');
    const fEmail = document.getElementById('krkCEmail');
    const fConsent = document.getElementById('krkCConsent');
    const consentWrap = document.getElementById('krkCConsentWrap');
    fConsent.addEventListener('change', () => consentWrap.classList.remove('is-error'));
    consentWrap.querySelector('summary').addEventListener('click', (e) => e.stopPropagation());
    const clearError = (el) => el.classList.remove('is-error');
    [fName, fBrand, fEmail].forEach((el) => el.addEventListener('input', () => clearError(el)));
    fStage.addEventListener('change', () => clearError(fStage));

    document.getElementById('krkCBack1').addEventListener('click', () => renderStep(0));
    document.getElementById('krkCNext1').addEventListener('click', () => {
      state.name  = fName.value.trim();
      state.brand = fBrand.value.trim();
      state.stage = fStage.value;
      state.email = fEmail.value.trim();

      let firstErr = null;
      const check = (el, val) => {
        const ok = Boolean(val);
        el.classList.toggle('is-error', !ok);
        if (!ok && !firstErr) firstErr = el;
      };
      check(fName,  state.name);
      check(fBrand, state.brand);
      check(fStage, state.stage);
      check(fEmail, state.email && /\S+@\S+\.\S+/.test(state.email));
      consentWrap.classList.toggle('is-error', !fConsent.checked);
      if (!firstErr && !fConsent.checked) firstErr = fConsent;
      if (firstErr) { firstErr.focus(); return; }

      // Webhook
      const payload = {
        ...state,
        privacyConsent: true,
        submittedAt: new Date().toISOString(),
        source: 'www.krk-studio.kr/widget',
        page: location.pathname,
      };
      fetch(MAKE_WEBHOOK, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch((err) => console.warn('[KRK] webhook failed:', err));

      document.getElementById('krkCDoneSub').textContent = 'marketing@chaeum.cloud 로 안내드립니다.';
      renderStep(2);
    });

    // Step 3
    document.getElementById('krkCDone').addEventListener('click', closePanel);

    renderStep(0);
    if (location.hash === '#consult') { openPanel(); history.replaceState(null, '', location.pathname + location.search); }
  }

  // Inject when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
