import type { ReactNode } from "react";

import { SiteHeader } from "@/components/site-header";

export const instant = false;

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      {children}
    </>
  );
}
