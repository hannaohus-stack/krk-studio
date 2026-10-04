// /api/works.js
// KRK Portfolio — Notion DB → JSON 변환 API
// Vercel Serverless Function

const NOTION_API = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";

// Notion property 값에서 텍스트만 안전하게 추출
function richText(prop) {
  if (!prop) return "";
  const arr = prop.rich_text || prop.title || [];
  return arr.map((t) => t.plain_text || "").join("").trim();
}

function selectName(prop) {
  return prop?.select?.name || "";
}

function numberValue(prop) {
  return typeof prop?.number === "number" ? prop.number : null;
}

function dateValue(prop) {
  return prop?.date?.start || null;
}

// Notion 페이지 1건 → 우리 포맷으로 변환
function transformPage(page) {
  const props = page.properties || {};

  const slug = richText(props["Slug"]);
  const enName = richText(props["EN Name"]);
  const krName = richText(props["작품명"]);
  const thumb = richText(props["썸네일"]);
  const gallery = richText(props["갤러리"])
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return {
    id: slug || page.id,
    link: slug ? `${slug}.html` : "#",
    slug,
    name: krName,           // 한글
    en: enName,             // 영문
    cat: selectName(props["카테고리"]) || "Other",
    status: selectName(props["Status"]) || "Draft",
    order: numberValue(props["순서"]),
    publishedAt: dateValue(props["공개일"]),
    summary: richText(props["요약"]),
    description: richText(props["소개글"]),
    thumb: thumb ? `../assets/${thumb}` : "",
    gallery: gallery.map((file) => `../assets/${file}`),
  };
}

export default async function handler(req, res) {
  const token = process.env.NOTION_TOKEN;
  const dbId = process.env.NOTION_PORTFOLIO_DB_ID;

  if (!token || !dbId) {
    return res.status(500).json({
      error: "Missing NOTION_TOKEN or NOTION_PORTFOLIO_DB_ID env",
    });
  }

  try {
    // Notion DB 쿼리: Published 상태만, 순서 오름차순
    const response = await fetch(`${NOTION_API}/databases/${dbId}/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filter: {
          property: "Status",
          select: { equals: "Published" },
        },
        sorts: [{ property: "순서", direction: "ascending" }],
        page_size: 100,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({
        error: "Notion API error",
        detail: text,
      });
    }

    const data = await response.json();
    const works = (data.results || []).map(transformPage);

    // ISR 캐싱: Vercel Edge에서 60초간 캐시, 백그라운드 재검증
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=60, stale-while-revalidate=300"
    );
    return res.status(200).json({ works });
  } catch (err) {
    return res.status(500).json({
      error: "Unexpected error",
      detail: String(err?.message || err),
    });
  }
}
