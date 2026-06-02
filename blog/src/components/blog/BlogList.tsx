// BlogList.tsx — KRK Checker Blog List Page
// Design reference: blog-list.jsx > BlogListA
// Usage: <BlogList device="desktop" />

'use client'; // Next.js App Router
import React, { useState } from 'react';
import { colors, fonts } from './tokens';
import { CATEGORIES, ARTICLES, catLabel } from './data';
import type { BlogListProps, ArticleCardProps } from './types';
import type { Article } from './types';
import Thumb from './Thumb';
import BlogNav from './BlogNav';
import BlogFooter from './BlogFooter';

// ─── Newsletter Strip ─────────────────────────────────────────
function NewsletterStrip({ device }: { device: 'desktop' | 'mobile' }) {
  const isD = device === 'desktop';
  return (
    <div style={{
      background: colors.tint,
      borderTop: `1px solid ${colors.rule}`,
      borderBottom: `1px solid ${colors.rule}`,
      padding: isD ? '14px 40px' : '12px 20px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
      boxSizing: 'border-box',
    }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontFamily: fonts.kr, fontSize: isD ? 13.5 : 12.5, color: colors.ink }}>
        <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: colors.breath }} />
        판매 전 라벨 점검 기준을 메일로 받아보세요
      </div>
      <a href="#newsletter" style={{ fontFamily: fonts.kr, fontSize: isD ? 13 : 12, color: colors.ink, textDecoration: 'none', fontWeight: 600 }}>
        구독하기 →
      </a>
    </div>
  );
}

// ─── Category Tabs ────────────────────────────────────────────
function CategoryTabs({ device, active, onSelect }: {
  device: 'desktop' | 'mobile';
  active: string;
  onSelect: (id: string) => void;
}) {
  const isD = device === 'desktop';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: isD ? 28 : 18,
      overflowX: isD ? 'visible' : 'auto',
      whiteSpace: 'nowrap', WebkitOverflowScrolling: 'touch',
      scrollbarWidth: 'none',
    }}>
      {CATEGORIES.map((c) => {
        const on = c.id === active;
        return (
          <button key={c.id} type="button" onClick={() => onSelect(c.id)} style={{
            background: 'transparent', border: 'none', cursor: 'pointer', padding: '0 0 2px',
            fontFamily: fonts.kr, fontSize: isD ? 15 : 13.5,
            fontWeight: on ? 600 : 400,
            color: on ? colors.ink : colors.ink3,
            borderBottom: `2px solid ${on ? colors.ink : 'transparent'}`,
            letterSpacing: '-0.01em',
          }}>
            {c.ko}
          </button>
        );
      })}
    </div>
  );
}

// ─── Article Card ─────────────────────────────────────────────
export function ArticleCard({ art, device, compact = false }: ArticleCardProps) {
  const isD = device === 'desktop';
  return (
    <a href={`/blog/${art.id}`} style={{ display: 'flex', flexDirection: 'column', gap: isD ? 14 : 12, textDecoration: 'none', color: 'inherit' }}>
      <div style={{ overflow: 'hidden' }}>
        {/* Replace Thumb with Next.js Image in production */}
        <Thumb kind={art.thumb} tone="light" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '4px 0 8px' }}>
        <div style={{ fontFamily: fonts.kr, fontSize: 11.5, fontWeight: 500, color: colors.ink3, display: 'flex', alignItems: 'center', gap: 8 }}>
          {catLabel(art.cat)}
        </div>
        <div style={{ fontFamily: fonts.kr, fontSize: compact ? (isD ? 16 : 15) : (isD ? 17.5 : 16), fontWeight: 600, lineHeight: 1.4, color: colors.ink, letterSpacing: '-0.015em' }}>
          {art.title}
        </div>
        {!compact && (
          <div style={{ fontFamily: fonts.kr, fontSize: isD ? 13.5 : 12.5, color: colors.ink2, lineHeight: 1.55, letterSpacing: '-0.01em', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
            {art.summary}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2, fontFamily: fonts.kr, fontSize: 11.5, color: colors.ink3 }}>
          <span>{art.time}분</span>
          <span style={{ color: colors.ink4 }}>·</span>
          <span>기준 {art.src[0]}</span>
        </div>
      </div>
    </a>
  );
}

// ─── Featured Article Card ────────────────────────────────────
function FeaturedCard({ art, device }: { art: Article; device: 'desktop' | 'mobile' }) {
  const isD = device === 'desktop';
  if (!isD) {
    return (
      <a href={`/blog/${art.id}`} style={{ display: 'flex', flexDirection: 'column', gap: 14, textDecoration: 'none', color: 'inherit' }}>
        <Thumb kind={art.thumb} tone="light" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '0 0 4px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 11.5, fontFamily: fonts.kr, color: colors.ink3 }}>
            <span style={{ padding: '3px 8px', background: colors.tint, color: colors.heritage, fontWeight: 600 }}>Featured</span>
            <span>{catLabel(art.cat)}</span>
          </div>
          <div style={{ fontFamily: fonts.kr, fontSize: 19, fontWeight: 700, lineHeight: 1.35, letterSpacing: '-0.02em', color: colors.ink }}>{art.title}</div>
          <div style={{ fontFamily: fonts.kr, fontSize: 13, color: colors.ink2, lineHeight: 1.55 }}>{art.summary}</div>
        </div>
      </a>
    );
  }
  return (
    <a href={`/blog/${art.id}`} style={{ display: 'grid', gridTemplateColumns: '1.05fr 1fr', gap: 0, textDecoration: 'none', color: 'inherit', border: `1px solid ${colors.rule}` }}>
      <div style={{ borderRight: `1px solid ${colors.rule}` }}>
        <Thumb kind={art.thumb} tone="light" />
      </div>
      <div style={{ padding: '40px 44px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontFamily: fonts.kr, fontSize: 11.5, color: colors.ink3 }}>
            <span style={{ padding: '4px 10px', background: colors.heritage, color: '#fff', fontWeight: 600, fontFamily: fonts.en, fontSize: 10.5, letterSpacing: '0.04em', textTransform: 'uppercase' as const }}>FEATURED</span>
            <span>{catLabel(art.cat)}</span>
          </div>
          <div style={{ fontFamily: fonts.kr, fontSize: 32, fontWeight: 700, lineHeight: 1.28, letterSpacing: '-0.025em', color: colors.ink }}>{art.title}</div>
          <div style={{ fontFamily: fonts.kr, fontSize: 15, color: colors.ink2, lineHeight: 1.65, letterSpacing: '-0.01em' }}>{art.summary}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingTop: 18, borderTop: `1px solid ${colors.rule}`, fontFamily: fonts.kr, fontSize: 12, color: colors.ink3 }}>
          <span>{art.date}</span>
          <span style={{ color: colors.ink4 }}>·</span>
          <span>{art.time}분</span>
          <span style={{ marginLeft: 'auto', color: colors.ink, fontWeight: 600 }}>읽어보기 →</span>
        </div>
      </div>
    </a>
  );
}

// ─── Main Component ───────────────────────────────────────────
/**
 * Blog list page component.
 * Place at: app/blog/page.tsx → <BlogList device="desktop" />
 * Use CSS media queries or server-side UA detection for `device` prop.
 */
export default function BlogList({ device }: BlogListProps) {
  const isD = device === 'desktop';
  const [active, setActive] = useState('all');
  const featured = ARTICLES[0];
  const rest = ARTICLES.slice(1).filter((a) => active === 'all' || a.cat === active);

  return (
    <div style={{ background: '#fff', minHeight: '100%', display: 'flex', flexDirection: 'column', fontFamily: fonts.kr }}>
      <BlogNav device={device} scope="blog" />
      <NewsletterStrip device={device} />

      {/* Page Header */}
      <div style={{ maxWidth: 1240, margin: '0 auto', width: '100%', boxSizing: 'border-box', padding: isD ? '64px 40px 28px' : '32px 20px 20px' }}>
        <div style={{ fontFamily: fonts.en, fontSize: isD ? 40 : 28, fontWeight: 700, letterSpacing: '-0.028em', textTransform: 'uppercase' as const, color: colors.ink, lineHeight: 1.1 }}>BLOG</div>
      </div>

      {/* Featured */}
      <div style={{ maxWidth: 1240, margin: '0 auto', width: '100%', boxSizing: 'border-box', padding: isD ? '20px 40px 56px' : '8px 20px 36px' }}>
        <FeaturedCard art={featured} device={device} />
      </div>

      {/* Category Bar (sticky) */}
      <div style={{ borderTop: `1px solid ${colors.rule}`, borderBottom: `1px solid ${colors.rule}`, background: '#fff', position: 'sticky', top: 0, zIndex: 5 }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', width: '100%', boxSizing: 'border-box', padding: isD ? '18px 40px' : '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <CategoryTabs device={device} active={active} onSelect={setActive} />
        </div>
      </div>

      {/* Article Grid */}
      <div style={{
        maxWidth: 1240, margin: '0 auto', width: '100%', boxSizing: 'border-box',
        padding: isD ? '56px 40px 96px' : '32px 20px 56px',
        display: 'grid',
        gridTemplateColumns: isD ? 'repeat(3, 1fr)' : '1fr',
        gap: isD ? '56px 32px' : '36px',
      }}>
        {rest.map((art) => <ArticleCard key={art.id} art={art} device={device} compact />)}
      </div>

      <BlogFooter device={device} />
    </div>
  );
}
