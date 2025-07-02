import type { ReactNode } from "react";

export function CardHeader({ children }: { children: ReactNode }) {
  return <div className="p-4 border-b border-gray-100">{children}</div>;
}
