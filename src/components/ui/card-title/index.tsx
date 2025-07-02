import type { ReactNode } from "react";

export function CardTitle({ children }: { children: ReactNode }) {
  return <h3 className="text-lg font-semibold text-gray-800">{children}</h3>;
}