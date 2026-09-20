"use client";

import * as React from "react";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ThemeProvider } from "@/components/theme-provider";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ConvexProvider client={convex}>{children}</ConvexProvider>
    </ThemeProvider>
  );
}