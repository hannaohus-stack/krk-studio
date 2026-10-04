# KRK Case Image Naming Convention

> 단일 진실 소스. Cowork·Claude·Hanna 전부 이 문서만 따른다.
> 위반 시 자동 배치 시스템이 깨지므로 예외 없음.

---

## 1. 기본 원칙

- **모든 파일명은 소문자**, 공백 없음
- 브랜드명은 한 단어로 압축: `Balance B` → `balanceb`
- 폴더는 `assets/{brandname}/` 구조
- 확장자: `.png` 기본 (사진은 `.jpg` 허용)
- 번호는 항상 2자리 zero-pad: `01`, `02`, … `10`

---

## 2. 슬롯별 명명 규칙

총 7종 슬롯. 모두 동일한 패턴: `{슬롯}_{브랜드}_{번호}.png`

| 슬롯 | 용도 | 비율/규격 | 파일명 패턴 | 장수 |
|---|---|---|---|---|
| **Hero** | 01 섹션 메인 비주얼 | 자유 (가급적 4:5 또는 1:1) | `Hero_{brand}.png` | 1장 |
| **Section** | 02 섹션 이미지 레이아웃 (2×1/1/2×1) | 1:1 권장 | `Section_{brand}_01.png` ~ `05.png` | 5장 |
| **Story** | 03 캐러셀 슬라이드 | **9:16 세로** | `Story_{brand}_01.png` ~ `06.png` | 6장 |
| **IG** | 04 Instagram Feed 카드 | 1:1 정사각 | `IG_{brand}_01.png` ~ `03.png` | 3장 |
| **Web** | 04 섹션 웹 미리보기 목업 | 자유 (모바일 목업 권장) | `Web_{brand}.png` | 1장 |
| **Anchor** | 05 Workflow 노드 다이어그램 왼쪽 단일 제품 카드 | 4:3 권장 | `Anchor_{brand}.png` | 1장 |
| **Ref** | 05 Workflow 노드 다이어그램 오른쪽 6장 그리드 | 1:1 | `Ref_{brand}_01.png` ~ `06.png` | 6장 |

### 주의
- Hero, Web, Anchor는 **1장이므로 번호 없음**
- 나머지는 **반드시 번호 있음** (`_01` 같은 zero-pad 2자리)
- 슬롯명은 **대문자 시작** (`Hero`, `IG`, `Story` …)
- 브랜드명은 **소문자 한 단어**

---

## 3. 폴더 구조

```
assets/
├── balanceb/
│   ├── Hero_balanceb.png
│   ├── Section_balanceb_01.png ~ Section_balanceb_05.png
│   ├── Story_balanceb_01.png ~ Story_balanceb_06.png
│   ├── IG_balanceb_01.png ~ IG_balanceb_03.png
│   ├── Web_balanceb.png
│   ├── Anchor_balanceb.png
│   └── Ref_balanceb_01.png ~ Ref_balanceb_06.png
└── {다음브랜드}/
    └── ...
```

---

## 4. 브랜드명 변환 규칙

| 원본 브랜드명 | 파일/폴더용 |
|---|---|
| Balance B | `balanceb` |
| KRK Studio | `krkstudio` |
| Re:form | `reform` (특수문자 제거) |
| A&B | `ab` |

**규칙**: 공백·특수문자·구두점 전부 제거 → 전체 소문자

---

## 5. HTML 데이터 객체에서 사용법

```js
{
  id: "balanceb",
  brand: "Balance B",
  heroImage:   "../assets/balanceb/Hero_balanceb.png",
  sectionGrid: [
    "../assets/balanceb/Section_balanceb_01.png",
    "../assets/balanceb/Section_balanceb_02.png",
    "../assets/balanceb/Section_balanceb_03.png",
    "../assets/balanceb/Section_balanceb_04.png",
    "../assets/balanceb/Section_balanceb_05.png"
  ],
  storyCards: [
    "../assets/balanceb/Story_balanceb_01.png",
    "../assets/balanceb/Story_balanceb_02.png",
    "../assets/balanceb/Story_balanceb_03.png",
    "../assets/balanceb/Story_balanceb_04.png",
    "../assets/balanceb/Story_balanceb_05.png",
    "../assets/balanceb/Story_balanceb_06.png"
  ],
  igGrid: [
    "../assets/balanceb/IG_balanceb_01.png",
    "../assets/balanceb/IG_balanceb_02.png",
    "../assets/balanceb/IG_balanceb_03.png"
  ],
  webImage:  "../assets/balanceb/Web_balanceb.png",
  wfAnchor:  "../assets/balanceb/Anchor_balanceb.png",
  wfRefs: [
    "../assets/balanceb/Ref_balanceb_01.png",
    "../assets/balanceb/Ref_balanceb_02.png",
    "../assets/balanceb/Ref_balanceb_03.png",
    "../assets/balanceb/Ref_balanceb_04.png",
    "../assets/balanceb/Ref_balanceb_05.png",
    "../assets/balanceb/Ref_balanceb_06.png"
  ]
}
```

---

## 6. Cowork·Claude 자동 배치 시 강제 규칙

1. 새 브랜드 추가 시 **반드시** `assets/{brandname}/` 폴더 먼저 생성
2. 이미지 파일은 위 7종 슬롯명 중 하나로만 명명. 임의 명명 금지
3. 슬롯별 장수 부족 시 **빈 슬롯 추가 금지** — 부족하다고 보고하고 사용자 확인 받을 것
4. 기존 파일 이름이 규칙과 다르면 **임의 리네이밍 금지** — 사용자 확인 받을 것
5. 슬롯 카운트 (Section 5, Story 6, IG 3, Ref 6)는 기본값. 변경은 사용자 명시 지시만
