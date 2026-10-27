import React from 'react';

export const BRAND_LOGO_SRC = '/assets/brand-logo.svg';
export const BRAND_MARK_SRC = '/assets/brand-mark.svg';

interface BrandMarkProps {
  className?: string;
  size?: number;
}

/**
 * Square nav/footer mark. Vector trace of the artwork's ball + lightning cluster,
 * transparent background, crisp at any size.
 */
export const BrandMark: React.FC<BrandMarkProps> = ({ className = '', size = 40 }) => (
  <span
    aria-hidden="true"
    className={`relative inline-flex shrink-0 items-center justify-center ${className}`}
    style={{ width: size, height: size }}
  >
    <img
      src={BRAND_MARK_SRC}
      alt=""
      draggable={false}
      className="h-full w-full object-contain"
    />
  </span>
);

interface BrandWordmarkProps {
  className?: string;
}

export const BrandWordmark: React.FC<BrandWordmarkProps> = ({ className = '' }) => (
  <span className={`font-display leading-none ${className}`}>
    <span className="brand-text-gradient block text-[15px] font-black tracking-[0.16em] uppercase sm:text-base">
      T-KPL
    </span>
    <span className="mt-1 block text-[9px] font-semibold tracking-[0.28em] text-brand-muted uppercase">
      Kadapa Premier League
    </span>
  </span>
);
