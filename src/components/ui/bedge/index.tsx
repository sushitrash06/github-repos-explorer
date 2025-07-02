interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "secondary";
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  className = "",
}: BadgeProps) {
  const baseStyle = "px-2 py-0.5 rounded-full text-xs border inline-flex items-center gap-1";
  const variants: Record<string, string> = {
    default: "bg-gray-100 text-gray-800 border-gray-300",
    secondary: "bg-blue-100 text-blue-800 border-blue-300",
  };

  return (
    <span className={`${baseStyle} ${variants[variant] || variants.default} ${className}`}>
      {children}
    </span>
  );
}
