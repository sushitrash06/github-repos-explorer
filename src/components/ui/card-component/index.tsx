import type { ReactNode } from "react";

export function CardContent({ children }: { children: ReactNode }) {
  return <div className="p-4">{children}</div>;
}