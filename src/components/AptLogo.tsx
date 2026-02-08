/**
 * Custom logo inspired by the Addictive Pain Tattoo business card:
 * TATTOO STUDIO / ADDICTIVE PAIN, ornate border, EST 2013.
 * Use variant="light" on dark backgrounds, variant="dark" on light backgrounds.
 */
type AptLogoProps = {
  className?: string;
  /** "light" = white/cream for dark bg, "dark" = dark gray for light bg */
  variant?: "light" | "dark";
  /** Compact for nav, full for hero */
  size?: "compact" | "full";
};

const gold = "#c9a227";
const goldLight = "#e5c547";
const dark = "#1f2937";
const light = "#fafafa";

export default function AptLogo({
  className = "",
  variant = "light",
  size = "full",
}: AptLogoProps) {
  const textFill = variant === "light" ? light : dark;
  const accentFill = gold;
  const accentFillLight = goldLight;

  if (size === "compact") {
    return (
      <svg
        viewBox="0 0 120 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden
      >
        <text
          x="4"
          y="22"
          fill={textFill}
          fontFamily="system-ui, sans-serif"
          fontSize="14"
          fontWeight="700"
          letterSpacing="0.05em"
        >
          TATTOO STUDIO
        </text>
        <text
          x="4"
          y="32"
          fill={accentFill}
          fontFamily="system-ui, sans-serif"
          fontSize="10"
          fontWeight="600"
          letterSpacing="0.15em"
        >
          ADDICTIVE PAIN
        </text>
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 280 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      {/* Ornate corner accents */}
      <path
        d="M20 20 L20 40 L40 20 Z M260 20 L240 20 L260 40 Z M20 120 L40 120 L20 140 Z M260 120 L260 140 L240 120 Z"
        stroke={accentFill}
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M30 30 Q20 30 20 40 M250 30 Q260 30 260 40 M30 110 Q20 110 20 100 M250 110 Q260 110 260 100"
        stroke={accentFill}
        strokeWidth="1.5"
        fill="none"
      />

      {/* Top border */}
      <line x1="50" y1="25" x2="230" y2="25" stroke={accentFill} strokeWidth="2" />
      {/* Bottom border */}
      <line x1="50" y1="115" x2="230" y2="115" stroke={accentFill} strokeWidth="2" />
      {/* Side accents */}
      <line x1="25" y1="50" x2="25" y2="90" stroke={accentFill} strokeWidth="1.5" />
      <line x1="255" y1="50" x2="255" y2="90" stroke={accentFill} strokeWidth="1.5" />

      {/* TATTOO STUDIO — main text */}
      <text
        x="140"
        y="52"
        fill={textFill}
        fontFamily="Georgia, serif"
        fontSize="28"
        fontWeight="700"
        textAnchor="middle"
        letterSpacing="0.08em"
      >
        TATTOO
      </text>
      <text
        x="140"
        y="78"
        fill={textFill}
        fontFamily="Georgia, serif"
        fontSize="28"
        fontWeight="700"
        textAnchor="middle"
        letterSpacing="0.08em"
      >
        STUDIO
      </text>

      {/* ADDICTIVE PAIN — banner */}
      <rect x="60" y="88" width="160" height="22" rx="2" fill={accentFill} opacity="0.25" />
      <line x1="70" y1="99" x2="210" y2="99" stroke={accentFillLight} strokeWidth="0.5" opacity="0.8" />
      <text
        x="140"
        y="105"
        fill={textFill}
        fontFamily="system-ui, sans-serif"
        fontSize="14"
        fontWeight="700"
        textAnchor="middle"
        letterSpacing="0.2em"
      >
        ADDICTIVE PAIN
      </text>

      {/* EST. 2013 */}
      <text
        x="140"
        y="125"
        fill={accentFill}
        fontFamily="system-ui, sans-serif"
        fontSize="11"
        fontWeight="600"
        textAnchor="middle"
        letterSpacing="0.3em"
      >
        EST. 2013
      </text>
    </svg>
  );
}
