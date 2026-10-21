# KRK Case Page Rules v1 (261021)

> Work 상세 페이지와 카드에 적용하는 기준. 신규 업로드부터 모든 케이스에 적용한다.
> 포지션: 하이엔드 · 스타일리시 · 트렌드세터. 덜어내고, 단언하고, 툴은 숨긴다.

## 1. 이미지
- 상세 이미지는 6~8장으로 고른다. 최소 4장부터 공개할 수 있다.
- 리듬: 큰 컷(full) → 2장 페어(pair) → 큰 컷 순서로 완급을 준다. 첫 장은 브랜드를 대표하는 장면이다.
- 넣지 않는 것: 재료컷 3열 그리드, Workflow·Anchor·Ref(AI 제작 과정) 이미지, 같은 구도의 반복 컷, 글자가 큰 이미지, 콜라주.
- 파일: `assets/{slug}/`. 이름은 IMAGE_NAMING.md 슬롯 규칙(Hero, Section_NN 등)을 따른다. 새 브랜드는 Hero 1장 + Section_01~07로 준비한다.
- 압축: 긴 변 2000px 이하, jpg, 장당 약 500KB 이하.

## 2. 텍스트
- 순서: 브랜드명(30px, 크게 쓰지 않는다) → 한 줄 테제(고딕, 14px) → 설명 2~3문장 → 표(Category · Client · Role · Scope).
- Category 행에는 분류와 연도를 함께 적는다(예: Inner Beauty · 2026). 이름 위 라벨과 Work 번호 라벨은 쓰지 않는다.
- 하단 이동은 `← Index` / `Next →` 두 개만, 둘 다 고딕, 위아래 선 없음. Next 옆에 브랜드명을 쓰지 않는다. 표 아래에 선을 겹쳐 두지 않는다.
- Tools(Figma·Notion·Claude·GPT 등) 표기와 Workflow 아코디언은 쓰지 않는다. AI Brand OS 이야기는 Service 페이지에서 한다.
- 콜라보는 Client에 협업사를 적는다(예: "Matchacha with Dior"). 협업사 로고는 승인 없이 쓰지 않는다.
- 카피는 Studio 보이스(단언형, 절제)로 쓰고 금지어를 지킨다. 숫자·성과는 사실인 것만 쓴다.

## 3. 레이아웃
- 데스크톱: 왼쪽 이미지, 오른쪽 고정 텍스트.
- 모바일: 제목 + 테제 + Detail 버튼 → 이미지 세로 스크롤 → Index / Next. Detail을 누르면 설명과 표(Category·Client·Role·Scope)가 열린다.
- 케이스 데이터에 `layout`이 있으면 이 규칙의 레이아웃으로 그려진다(`work/case.js`).

```js
thesis: "Small rituals. Real results.",
lead:   "2~3문장",
client: "UrbanPure", role: "Brand Direction", scope: "Positioning · Package · Campaign Visual",
layout: [
  ["full", "Hero_urbanpure.png"],
  ["pair", "Section_urbanpure_04.png", "Section_urbanpure_05.png"],
  ["full", "Story_urbanpure_02.png"]
]
```

## 4. 카드 (홈 · Work)
- 대표이미지: 3:4 세로, 1200×1600 jpg, `assets/index-{slug}.jpg`. 제품이나 장면 단독 컷 한 장.
- 이미지가 없는 카드는 노출하지 않는다. 파일이 들어오면 자동으로 나타난다.
- 상세 페이지가 없는 카드는 클릭되지 않는다(홈에서는 Work로 이동).

## 5. 진행 순서
미리보기에서 확인 → Hanna 승인 → 브랜치 푸시(Vercel Preview) → main 머지 → krk.team 확인.

## 6. 폰트 크기 (사이트 공통, 261021)
`assets/krk-site.css`의 토큰만 쓴다. 숫자를 직접 쓰지 않는다.

| 토큰 | 데스크톱 / 모바일 | 서체 | 쓰는 곳 |
|---|---|---|---|
| `--t-title` | 25 / 24 | 세리프 | 상세 프로젝트명, 페이지 제목, 햄버거 메뉴 항목 |
| `--t-name` | 18 / 16 | 세리프 | 카드 브랜드명, CTA |
| `--t-body` | 13 / 13 | 고딕 | 모든 본문, 슬로건, 표 값 |
| `--t-small` | 11 / 11 | 고딕 대문자, 자간 `--ls-caps`(.12em) | 상단 메뉴, 라벨, meta, Index/Next, Detail, 푸터 |

- Small은 영문 대문자와 숫자에만 쓴다. 한글 문장은 Body(13) 아래로 내리지 않는다.
- Service·Links 페이지는 아직 별도 체계(다음 단계에서 이전).
