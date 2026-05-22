"use client";

import { useBranding } from "@/hooks/useBranding";

export default function BrandingProvider({ children }) {
  useBranding();
  return children;
}
