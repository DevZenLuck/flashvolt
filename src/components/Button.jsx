/**
 * Action buttons. Primary = lime on navy (used for CTAs), secondary = outlined
 * navy, ghost = quiet. Anchor/link variants render a real link.
 */
export function Button({ variant = "primary", className = "", as: Comp = "button", children, ...rest }) {
  const base = "inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-lime focus:ring-offset-2";
  const variants = {
    primary: "bg-lime text-navy hover:bg-lime-bright hover:-translate-y-0.5",
    secondary: "border border-navy/25 bg-transparent text-navy hover:border-navy hover:bg-navy/5",
    navyOnLime: "bg-navy text-white hover:bg-navy-deep",
    ghost: "text-navy/70 hover:text-navy hover:bg-navy/5",
    light: "border border-white/30 text-white hover:bg-white/10",
  };
  return (
    <Comp className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </Comp>
  );
}