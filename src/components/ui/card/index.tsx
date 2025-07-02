import type { ReactNode, HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ children, ...props }: CardProps) {
  return (
    <div
      className="rounded-xl border border-gray-200 bg-white shadow hover:shadow-md transition cursor-pointer"
      {...props}
    >
      {children}
    </div>
  );
}
