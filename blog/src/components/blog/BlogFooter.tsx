// BlogFooter.tsx — KRK Checker Blog Footer
// Dark footer with logo, copyright, and navigation links.
// Design reference: blog-list.jsx > BlogFooter

import React from 'react';
import { colors, fonts } from './tokens';
import type { BlogFooterProps } from './types';

export default function BlogFooter({ device }: BlogFooterProps) {
  const isDesktop = device === 'desktop';

  return (
    <footer
      style={{
        background: '#0F0F12',
        color: 'rgba(255,255,255,0.55)',
        flexShrink: 0,
        padding: isDesktop ? '36px 40px 28px' : '28px 20px 22px',
        fontSize: 12,
        letterSpacing: '-0.005em',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          maxWidth: 1240,
          margin: '0 auto',
          display: 'flex',
          alignItems: isDesktop ? 'center' : 'flex-start',
          justifyContent: 'space-between',
          gap: 16,
          flexDirection: isDesktop ? 'row' : 'column',
        }}
      >
        {/* Brand */}
        <div>
          <img
            src="/krk-checker-logo.png"
            alt="KRK Checker"
            style={{
              height: 16,
              width: 'auto',
              display: 'block',
              marginBottom: 6,
              filter: 'brightness(0) invert(1)',
            }}
          />
          <div style={{ marginTop: 6, fontSize: 11 }}>
            © 2026 krk.team · 서울특별시
          </div>
        </div>

        {/* Nav links */}
        <div
          style={{
            display: 'flex',
            gap: 22,
            flexWrap: 'wrap',
            fontSize: 11.5,
          }}
        >
          {[
            { label: '제품', href: '/' },
            { label: '가격', href: '/#pricing' },
            { label: '블로그', href: '/blog' },
            { label: '이용약관', href: '/terms' },
            { label: '개인정보처리방침', href: '/privacy' },
          ].map(({ label, href }) => (
            <a
              key={label}
              href={href}
              style={{ color: 'rgba(255,255,255,0.55)', textDecoration: 'none' }}
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
