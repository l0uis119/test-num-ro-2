"use client";

/**
 * BLOC mark — two offset blocks locking together, nodding to both a bouldering
 * "bloc" and a city concrete block. Uses currentColor so it inherits text color.
 */
export default function Logo({ size = 26 }: { size?: number }) {
  return (
    <span className="logo" data-cursor="link">
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden="true"
      >
        <rect
          x="3"
          y="3"
          width="18"
          height="18"
          rx="3"
          stroke="currentColor"
          strokeWidth="2.4"
        />
        <rect x="13" y="13" width="16" height="16" rx="3" fill="currentColor" />
      </svg>
      <span className="logo__word">BLOC</span>
    </span>
  );
}
