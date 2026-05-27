/**
 * MoniLogo — moni wordmark with Nunito rounded font.
 * Uses dotless-i (ı) so the font's white tittle doesn't show,
 * then overlays a single accent-colored dot above the "i".
 */
export default function MoniLogo({ size = 40, color = "#fff", dot = "#a78bfa" }) {
  const dotSize = Math.round(size * 0.12);

  return (
    <span style={{
      fontFamily: "'Nunito', 'Inter', system-ui, sans-serif",
      fontSize: size,
      fontWeight: 900,
      letterSpacing: "-0.5px",
      color,
      lineHeight: 1,
      display: "inline-flex",
      alignItems: "flex-end",
      userSelect: "none",
    }}>
      mon
      {/* dotless-i + accent dot */}
      <span style={{ position: "relative", display: "inline-block" }}>
        {/* ı = U+0131 dotless i — same width/shape as i but no white tittle */}
        <span style={{ color, fontFamily: "inherit", fontWeight: "inherit" }}>ı</span>
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            top: Math.round(size * 0.04),
            left: "50%",
            transform: "translateX(-50%)",
            width: dotSize,
            height: dotSize,
            borderRadius: "50%",
            background: dot,
            boxShadow: `0 0 ${dotSize * 2}px ${dot}cc`,
            display: "block",
          }}
        />
      </span>
    </span>
  );
}
