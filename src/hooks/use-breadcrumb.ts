"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { useCurrentEnterprise } from "./use-current-enterprise";

export interface BreadcrumbItem {
  label: string;
  href: string;
  isCurrentPage: boolean;
}

export function useBreadcrumb(): {
  items: BreadcrumbItem[];
  loading: boolean;
} {
  const pathname = usePathname();
  const { enterprise, enterpriseId, loading } = useCurrentEnterprise();

  const items = useMemo(() => {
    const breadcrumbs: BreadcrumbItem[] = [];

    // /dashboard
    if (pathname === "/dashboard") {
      breadcrumbs.push({
        label: "Tableau de bord",
        href: "/dashboard",
        isCurrentPage: true,
      });
      return breadcrumbs;
    }

    // Pages /enterprise/*
    if (pathname.startsWith("/enterprise")) {
      // Toujours ajouter "Tableau de bord" en premier pour les pages enterprise
      breadcrumbs.push({
        label: "Tableau de bord",
        href: "/dashboard",
        isCurrentPage: false,
      });

      breadcrumbs.push({
        label: "Entreprises",
        href: "/enterprise",
        isCurrentPage: pathname === "/enterprise",
      });

      // /enterprise/new
      if (pathname === "/enterprise/new") {
        breadcrumbs.push({
          label: "Nouvelle entreprise",
          href: "/enterprise/new",
          isCurrentPage: true,
        });
      }

      // /enterprise/[id] - les tabs (informations, documents, score) sont sur la même page
      if (enterpriseId) {
        const enterpriseName = enterprise?.raison_sociale || "Entreprise";

        breadcrumbs.push({
          label: enterpriseName,
          href: `/enterprise/${enterpriseId}`,
          isCurrentPage: true,
        });
      }
    }

    return breadcrumbs;
  }, [pathname, enterpriseId, enterprise?.raison_sociale]);

  return {
    items,
    loading: loading && !!enterpriseId,
  };
}
