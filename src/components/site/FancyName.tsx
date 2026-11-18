/**
 * Discord-style "fancy text" channel name (𝑹𝒆𝒗𝒆𝒏𝒂𝒏𝒕 </>).
 *
 * The literal mathematical-bold-italic code points are rendered as inline SVG
 * `<text>` so the name looks identical on every device — no dependency on an
 * optional math-alphanumerics font being installed.
 */
export function FancyName({
  height = 13,
  className = "",
  title = "LightCore </>",
}: {
  height?: number;
  className?: string;
  title?: string;
}) {
  const width = height * 5.8;
  return (
    <svg
      role="img"
      aria-label={title}
      viewBox="0 0 146 26"
      height={height * 2}
      width={width}
      className={`inline-block shrink-0 ${className}`}
      fill="currentColor"
    >
      <text
        x="0"
        y="18"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="19"
        fontStyle="italic"
        fontWeight="700"
        letterSpacing="0.2"
        textLength="116"
        lengthAdjust="spacingAndGlyphs"
      >
        LightCore
      </text>
      <text
        x="123"
        y="18"
        fontFamily="ui-monospace, 'JetBrains Mono', monospace"
        fontSize="11"
        fontWeight="500"
        fillOpacity="0.65"
      >
        {"</>"}
      </text>
    </svg>
  );
}
