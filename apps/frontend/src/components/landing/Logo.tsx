/** Brand mark — a rounded node graph hinting at a connected franchise network. */
export function Logo({ size = 32 }: { size?: number }) {
  return (
    <span
      className="flex items-center justify-center rounded-[10px] bg-rausch"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg
        width={size * 0.6}
        height={size * 0.6}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="12" cy="4" r="2.4" fill="white" />
        <circle cx="4.5" cy="18" r="2.4" fill="white" />
        <circle cx="19.5" cy="18" r="2.4" fill="white" />
        <path
          d="M12 6.4 5 16M12 6.4 19 16M6.5 18h11"
          stroke="white"
          strokeWidth="1.6"
          strokeLinecap="round"
          opacity="0.9"
        />
      </svg>
    </span>
  );
}
