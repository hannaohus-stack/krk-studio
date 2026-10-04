# Cowork 작업 지침 — KRK Consult Widget 통합

## 🎯 작업 목표

기존 `consult.html` 페이지를 제거하고, 새로 만든 **`consult-widget.js`**를 모든 페이지에 통합합니다.
이 위젯은 우하단에 떠있는 챗봇 형태로, 어느 페이지에서든 접근 가능합니다.

---

## 📦 사전 준비 — 새 파일 업로드

다음 파일을 `assets/` 폴더에 업로드합니다.

```
프로젝트 루트/
└── assets/
    └── consult-widget.js   ← 새로 추가
```

---

## ✅ 작업 1 — 모든 페이지에 위젯 스크립트 추가

### 대상 파일

다음 HTML 파일 **모두**에 위젯 스크립트를 추가합니다.

```
index.html
service.html
service-v2.html
work/index.html
work/case_balanceb.html
work/case_mium.html
work/case_urbanpure.html
(추가로 생성된 모든 .html 파일)
```

### 추가 방법

각 HTML 파일의 `</body>` 태그 **바로 위**에 다음 한 줄을 추가합니다.

**루트 레벨 파일** (`index.html`, `service.html` 등):
```html
    <script src="assets/consult-widget.js" defer></script>
  </body>
</html>
```

**하위 폴더 파일** (`work/index.html`, `work/case_*.html` 등):
```html
    <script src="../assets/consult-widget.js" defer></script>
  </body>
</html>
```

### ⚠️ 주의사항

- `defer` 속성을 반드시 포함합니다.
- 이미 다른 `<script>` 태그가 있다면, **마지막 script 태그 다음**에 추가합니다.
- 경로 깊이에 따라 `../` 개수를 조정합니다.
  - `index.html` → `assets/consult-widget.js`
  - `work/index.html` → `../assets/consult-widget.js`
  - `work/case_balanceb.html` → `../assets/consult-widget.js`

---

## ✅ 작업 2 — consult.html 파일 제거

### 삭제할 파일

```
consult.html
```

> ⚠️ 삭제 전에 백업하거나 git에 commit 되어 있는지 확인합니다.

---

## ✅ 작업 3 — consult.html로 가는 링크 모두 제거 / 교체

### 검색 대상

모든 HTML 파일에서 다음 패턴을 찾습니다:

```html
href="consult.html"
href="/consult.html"
href="../consult.html"
```

### 처리 방법

#### A. 네비게이션 메뉴 안의 "Consult" / "문의하기" 링크인 경우
→ **링크 자체를 삭제합니다.** (위젯이 모든 페이지에 떠 있으므로 별도 메뉴 불필요)

예시:
```html
<!-- Before -->
<nav class="topbar-nav">
  <a href="service.html">Service</a>
  <a href="work/index.html">Work</a>
  <a href="consult.html">Consult</a>   ← 이 줄 삭제
</nav>

<!-- After -->
<nav class="topbar-nav">
  <a href="service.html">Service</a>
  <a href="work/index.html">Work</a>
</nav>
```

#### B. 본문/Footer/CTA 버튼 안의 링크인 경우
→ **버튼을 위젯 트리거로 교체합니다.**

위젯은 자동으로 우하단에 뜨므로 별도 CTA가 필요한 경우, JS로 위젯을 열 수 있습니다.

예시 (Footer의 "Work with us →" 버튼):
```html
<!-- Before -->
<a class="footer-cta-btn" href="consult.html">Work with us →</a>

<!-- After -->
<button class="footer-cta-btn" type="button" onclick="document.getElementById('krkCTrigger')?.click()">Work with us →</button>
```

> 💡 `onclick` 안의 코드는 페이지에 로드된 위젯의 트리거 버튼을 자동 클릭합니다.

---

## ✅ 작업 4 — 검증

작업 후 다음을 확인합니다.

### 1. 위젯 표시 확인
- 각 페이지를 열었을 때 우하단에 **● 문의하기** 버튼이 보입니다.
- 클릭하면 챗봇 패널이 슬라이드업으로 열립니다.

### 2. 챗봇 작동 확인
- **Step 1**: 서비스 4개 카드 표시되고 선택 가능
- **Step 2**: Name / Brand / Stage / Email 입력 가능
- **Step 3**: Calendly 위젯이 정상 임베드됨

### 3. 링크 제거 확인
브라우저에서 검색 (Ctrl+F / Cmd+F):
- `consult.html` 검색 → 결과 없어야 함
- 네비게이션에 "Consult" 메뉴 없어야 함

### 4. 모바일 확인
- 화면 폭 450px 이하 (또는 모바일 기기) 에서 위젯이 **하단 시트** 형태로 뜸
- 입력칸이 패널 안에 정상적으로 들어감

---

## 🛡️ 안전장치

위젯에는 다음이 이미 적용되어 있어 안전합니다:

- **중복 로드 방지**: 같은 페이지에 스크립트가 2번 들어가도 1번만 실행됨
- **스타일 격리**: 모든 클래스가 `krk-c-` 프리픽스로 분리되어 기존 페이지 CSS와 충돌 없음
- **defer 로딩**: 페이지 렌더링을 지연시키지 않음

---

## 📋 작업 체크리스트

```
□ assets/consult-widget.js 업로드 완료
□ index.html에 스크립트 추가
□ service.html에 스크립트 추가
□ service-v2.html에 스크립트 추가
□ work/index.html에 스크립트 추가 (../ 경로 확인)
□ work/case_balanceb.html에 스크립트 추가
□ work/case_mium.html에 스크립트 추가
□ work/case_urbanpure.html에 스크립트 추가
□ consult.html 파일 삭제
□ 모든 페이지에서 consult.html 링크 제거 / 위젯 트리거로 교체
□ 네비게이션 메뉴에서 "Consult" / "문의하기" 항목 삭제
□ 데스크탑/모바일 양쪽에서 위젯 정상 작동 확인
□ Calendly 위젯 정상 표시 확인
```

---

## ⚠️ 작업 중 발견되면 알려주세요

- consult.html에서만 정의되어 있던 메타 데이터나 SEO 태그
- 위젯 스크립트 추가 후 깨지는 페이지가 있는 경우
- 기존 페이지의 다른 챗봇/팝업과 충돌 발생 시
