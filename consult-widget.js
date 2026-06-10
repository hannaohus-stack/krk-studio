/* ============================================================
   KRK Consult Widget
   Usage:
     <script src="assets/consult-widget.js" defer></script>

   This script auto-injects:
   - CSS into <head>
   - Floating trigger button + chatbot panel into <body>
   - 3-step flow: Service → Info → Calendly

   Config (edit below):
   - MAKE_WEBHOOK : Make.com webhook URL (silent background submit)
   - CALENDLY_URL : Calendly event type URL
   ============================================================ */

(function () {
  'use strict';

  // Prevent double-injection
  if (window.__KRK_CONSULT_LOADED__) return;
  window.__KRK_CONSULT_LOADED__ = true;

  // ── CONFIG ────────────────────────────────────────────────
  const MAKE_WEBHOOK = 'https://hook.us2.make.com/ivkfkwhkegwoalggl64mxnljhtex8sej';
  const CALENDLY_URL = 'https://calendly.com/chaeumkorea/15min';

  // ── CSS ───────────────────────────────────────────────────
  const css = `
    .krk-c-root, .krk-c-root * { box-sizing: border-box; }

    /* TRIGGER */
    .krk-c-trigger {
      position: fixed;
      right: 28px;
      bottom: 28px;
      z-index: 9900;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      height: 44px;
      padding: 0 20px;
      border-radius: 999px;
      border: 1px solid rgba(26,24,22,.12);
      background: #ffffff;
      color: #1a1816;
      font-family: -apple-system, BlinkMacSystemFont, "Inter", "Helvetica Neue", sans-serif;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: -.01em;
      cursor: pointer;
      box-shadow: 0 8px 32px rgba(26,24,22,.12);
      transition: transform .25s cubic-bezier(.19,1,.22,1), box-shadow .25s ease;
    }
    .krk-c-trigger:hover {
      transform: translateY(-2px);
      box-shadow: 0 16px 40px rgba(26,24,22,.16);
    }
    .krk-c-trigger .dot {
      width: 7px; height: 7px;
      border-radius: 50%;
      background: #3ecf6b;
      flex-shrink: 0;
      box-shadow: 0 0 0 2px rgba(62,207,107,.25);
      animation: krk-dot-pulse 2.4s ease-in-out infinite;
    }
    @keyframes krk-dot-pulse {
      0%, 100% { box-shadow: 0 0 0 2px rgba(62,207,107,.25); }
      50%       { box-shadow: 0 0 0 4px rgba(62,207,107,.12); }
    }
    @keyframes krk-c-shake {
      0%, 100% { transform: translateX(0); }
      20%       { transform: translateX(-5px); }
      40%       { transform: translateX(5px); }
      60%       { transform: translateX(-4px); }
      80%       { transform: translateX(4px); }
    }
    .krk-c-services.is-shake {
      animation: krk-c-shake .35s cubic-bezier(.19,1,.22,1) both;
    }

    /* PANEL */
    .krk-c-panel {
      position: fixed;
      right: 28px;
      bottom: 84px;
      z-index: 9901;
      width: min(400px, calc(100vw - 56px));
      max-height: min(600px, calc(100vh - 120px));
      background: #ffffff;
      border: 1px solid rgba(26,24,22,.12);
      border-radius: 12px;
      box-shadow: 0 24px 80px rgba(26,24,22,.16);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      opacity: 0;
      pointer-events: none;
      transform: translateY(12px) scale(.98);
      transform-origin: bottom right;
      transition: opacity .28s cubic-bezier(.19,1,.22,1),
                  transform .28s cubic-bezier(.19,1,.22,1);
      font-family: "Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont,
                   "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic",
                   system-ui, sans-serif;
      color: #1a1816;
    }
    .krk-c-panel.is-open {
      opacity: 1;
      pointer-events: auto;
      transform: translateY(0) scale(1);
    }

    /* TOP (progress + close) */
    .krk-c-top {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 16px 12px 20px;
      flex-shrink: 0;
    }
    .krk-c-progress {
      display: flex;
      align-items: center;
      gap: 6px;
      flex: 1;
    }
    .krk-c-progress-step {
      flex: 1;
      height: 2px;
      border-radius: 999px;
      background: rgba(26,24,22,.12);
      transition: background .3s ease;
    }
    .krk-c-progress-step.is-done { background: #1a1816; }
    .krk-c-progress-step.is-active { background: rgba(26,24,22,.4); }
    .krk-c-close {
      width: 26px; height: 26px;
      display: grid; place-items: center;
      background: transparent;
      border: 1px solid rgba(26,24,22,.12);
      border-radius: 50%;
      color: #4a443c;
      font-size: 14px; line-height: 1;
      cursor: pointer;
      flex-shrink: 0;
      padding: 0;
      transition: background .18s ease, border-color .18s ease;
    }
    .krk-c-close:hover {
      background: rgba(26,24,22,.06);
      border-color: #4a443c;
    }

    /* BODY */
    .krk-c-body {
      padding: 16px 20px 20px;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
      flex: 1;
      min-height: 0;
    }
    .krk-c-step { display: none; }
    .krk-c-step.is-active {
      display: flex;
      flex-direction: column;
      gap: 12px;
      animation: krk-c-fadein .25s cubic-bezier(.19,1,.22,1) both;
    }
    @keyframes krk-c-fadein {
      from { opacity: 0; transform: translateY(6px); }
      to   { opacity: 1; transform: none; }
    }

    .krk-c-step-label {
      font-family: -apple-system, BlinkMacSystemFont, "Inter", sans-serif;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: .16em;
      text-transform: uppercase;
      color: #8a8275;
      margin-bottom: 4px;
    }
    .krk-c-step-q {
      font-size: 15px;
      font-weight: 600;
      line-height: 1.4;
      letter-spacing: -.02em;
      color: #1a1816;
      margin: 0 0 4px;
    }

    /* SERVICE CARDS */
    .krk-c-services {
      display: grid;
      gap: 7px;
    }
    .krk-c-service {
      display: grid;
      grid-template-columns: 24px 1fr;
      gap: 10px;
      align-items: start;
      padding: 14px 16px;
      background: #faf8f3;
      border: 1px solid rgba(26,24,22,.12);
      border-radius: 8px;
      text-align: left;
      cursor: pointer;
      transition: border-color .18s ease, background .18s ease, transform .25s cubic-bezier(.19,1,.22,1);
      font-family: inherit;
      color: inherit;
    }
    .krk-c-service:hover {
      border-color: #4a443c;
      transform: translateX(2px);
    }
    .krk-c-service.is-selected {
      background: #1a1816;
      border-color: #1a1816;
      color: #faf8f3;
    }
    .krk-c-service .snum {
      font-family: -apple-system, BlinkMacSystemFont, "Inter", sans-serif;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: .1em;
      color: #8a8275;
      padding-top: 2px;
      transition: color .18s ease;
    }
    .krk-c-service.is-selected .snum { color: rgba(250,248,243,.45); }
    .krk-c-service .sbody h4 {
      margin: 0 0 3px;
      font-size: 14px;
      font-weight: 600;
      letter-spacing: -.015em;
      line-height: 1.2;
    }
    .krk-c-service .sbody p {
      margin: 0;
      font-size: 12px;
      line-height: 1.5;
      color: #4a443c;
      transition: color .18s ease;
    }
    .krk-c-service.is-selected .sbody p { color: rgba(250,248,243,.6); }

    /* FORM */
    .krk-c-fields {
      display: grid;
      gap: 12px;
    }
    .krk-c-field {
      display: grid;
      gap: 6px;
    }
    .krk-c-field label {
      font-family: -apple-system, BlinkMacSystemFont, "Inter", sans-serif;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: .15em;
      text-transform: uppercase;
      color: #8a8275;
    }
    .krk-c-field label em {
      font-style: normal;
      color: #b94040;
      margin-left: 2px;
    }
    .krk-c-input, .krk-c-select {
      width: 100%;
      border: 1px solid rgba(26,24,22,.12);
      background: #faf8f3;
      height: 40px;
      padding: 0 12px;
      border-radius: 6px;
      font-family: inherit;
      font-size: 13px;
      color: #1a1816;
      transition: border-color .16s ease, box-shadow .16s ease;
    }
    .krk-c-input::placeholder { color: #8a8275; }
    .krk-c-input:focus, .krk-c-select:focus {
      outline: none;
      border-color: rgba(26,24,22,.4);
      box-shadow: 0 0 0 3px rgba(26,24,22,.06);
    }
    .krk-c-input.is-error, .krk-c-select.is-error {
      border-color: rgba(185,64,64,.5);
      box-shadow: 0 0 0 3px rgba(185,64,64,.07);
    }
    .krk-c-row {
      display: grid;
      grid-template-columns: 1fr;
      gap: 12px;
    }

    /* CALENDLY */
    .krk-c-cal-wrap {
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid rgba(26,24,22,.12);
      background: #faf8f3;
      min-height: 380px;
      position: relative;
    }
    .krk-c-cal-wrap iframe {
      width: 100%;
      height: 480px;
      border: 0;
      display: block;
    }
    .krk-c-cal-loading {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, "Inter", sans-serif;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: .16em;
      text-transform: uppercase;
      color: #8a8275;
      pointer-events: none;
    }

    /* ACTIONS */
    .krk-c-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      margin-top: 4px;
    }
    .krk-c-btn-back {
      font-family: -apple-system, BlinkMacSystemFont, "Inter", sans-serif;
      font-size: 12px;
      font-weight: 500;
      color: #8a8275;
      cursor: pointer;
      padding: 0;
      background: none;
      border: none;
      transition: color .16s ease;
      visibility: hidden;
    }
    .krk-c-btn-back.is-visible { visibility: visible; }
    .krk-c-btn-back:hover { color: #1a1816; }
    .krk-c-btn-next {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      height: 38px;
      padding: 0 20px;
      border-radius: 999px;
      background: #1a1816;
      color: #faf8f3;
      font-family: -apple-system, BlinkMacSystemFont, "Inter", sans-serif;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: -.005em;
      cursor: pointer;
      border: none;
      transition: background .18s ease, transform .25s cubic-bezier(.19,1,.22,1);
      margin-left: auto;
    }
    .krk-c-btn-next:hover { background: #4a443c; transform: translateY(-1px); }
    .krk-c-btn-next:active { transform: scale(.97); }
    .krk-c-btn-next:disabled { opacity: .4; cursor: not-allowed; transform: none; }

    /* MOBILE: ≤450px */
    @media (max-width: 450px) {
      .krk-c-trigger { right: 16px; bottom: 16px; }
      .krk-c-panel {
        right: 0; left: 0; bottom: 0;
        width: 100%;
        max-height: 85vh;
        border-radius: 16px 16px 0 0;
        border-bottom: none;
        transform-origin: bottom center;
        transform: translateY(20px);
      }
      .krk-c-panel.is-open { transform: translateY(0); }
    }

    /* TABLET: 451–900px */
    @media (min-width: 451px) and (max-width: 900px) {
      .krk-c-panel {
        right: 20px;
        bottom: 76px;
        width: min(380px, calc(100vw - 40px));
        max-height: min(580px, calc(100vh - 100px));
      }
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
            <button type="button" class="krk-c-service" data-service="ax" data-label="Brand Team AX">
              <span class="snum">01</span>
              <span class="sbody">
                <h4>Brand Team AX</h4>
                <p>Brand OS 도입, 운영 시스템화.</p>
              </span>
            </button>
            <button type="button" class="krk-c-service" data-service="branding" data-label="Branding">
              <span class="snum">02</span>
              <span class="sbody">
                <h4>Branding</h4>
                <p>패키지·상세·매대·피드 등 브랜드 자산 제작.</p>
              </span>
            </button>
            <button type="button" class="krk-c-service" data-service="campaign" data-label="Campaign">
              <span class="snum">03</span>
              <span class="sbody">
                <h4>Campaign</h4>
                <p>시즌 캠페인·신제품 런칭·리포지셔닝 운영.</p>
              </span>
            </button>
            <button type="button" class="krk-c-service" data-service="funding" data-label="정부자금 브랜딩">
              <span class="snum">04</span>
              <span class="sbody">
                <h4>정부자금 브랜딩</h4>
                <p>확보한 지원사업 예산 매칭 작업.</p>
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
          </div>
          <div class="krk-c-actions">
            <button type="button" class="krk-c-btn-back is-visible" id="krkCBack1">← 이전</button>
            <button type="button" class="krk-c-btn-next" id="krkCNext1">예약하기 →</button>
          </div>
        </div>

        <!-- Step 3 -->
        <div class="krk-c-step" data-step="2">
          <div class="krk-c-step-label">Step 03</div>
          <p class="krk-c-step-q">15분 미팅 시간을 예약해주세요.</p>
          <div class="krk-c-cal-wrap">
            <div class="krk-c-cal-loading" id="krkCCalLoading">불러오는 중</div>
            <div id="krkCCalEmbed"></div>
          </div>
          <div class="krk-c-actions">
            <button type="button" class="krk-c-btn-back is-visible" id="krkCBack2">← 이전</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // ── INJECT ────────────────────────────────────────────────
  function inject() {
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
      if (firstErr) { firstErr.focus(); return; }

      // Webhook
      const payload = {
        ...state,
        submittedAt: new Date().toISOString(),
        source: 'krk.team/widget',
        page: location.pathname,
      };
      fetch(MAKE_WEBHOOK, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch((err) => console.warn('[KRK] webhook failed:', err));

      loadCalendly(state);
      renderStep(2);
    });

    // Step 3
    document.getElementById('krkCBack2').addEventListener('click', () => renderStep(1));

    function loadCalendly(s) {
      const params = new URLSearchParams({
        embed_domain: location.hostname || 'krk.team',
        embed_type: 'Inline',
        hide_gdpr_banner: '1',
      });
      if (s.name)  params.set('name',  s.name);
      if (s.email) params.set('email', s.email);

      const embed = document.getElementById('krkCCalEmbed');
      embed.innerHTML = `<iframe src="${CALENDLY_URL}?${params}" loading="lazy"></iframe>`;

      const iframe = embed.querySelector('iframe');
      const loading = document.getElementById('krkCCalLoading');
      iframe.addEventListener('load', () => {
        if (loading) loading.style.display = 'none';
      });
    }

    renderStep(0);
  }

  // Inject when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
