"use client";

import { AppBreadcrumb } from "./breadcrumb";

interface MainContentProps {
  children: React.ReactNode;
}

export function MainContent({ children }: MainContentProps) {
  return (
    <>
      <AppBreadcrumb />
      {children}
    </>
  );
}
