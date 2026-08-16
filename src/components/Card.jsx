/**
 * Base card. Keeps the interface restrained: thin border, light shadow,
 * moderate radius. Tones: `white` (default), `navy`, `lime`, `outline`.
 */
export default function Card({ tone = "white", className = "", children, ...rest }) {
  const tones = {
    white: "bg-white border-navy/10 shadow-card",
    navy: "bg-navy border-navy",
    lime: "bg-lime-light border-lime/30",
    outline: "bg-transparent border-navy/10",
  };
  return (
    <div className={`rounded-xl border ${tones[tone]} ${className}`} {...rest}>
      {children}
    </div>
  );
}