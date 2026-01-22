"use client";

import { Fragment } from "react";
import Link from "next/link";
import { useBreadcrumb } from "@/hooks/use-breadcrumb";
import {
  Breadcrumb as BreadcrumbRoot,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home, Loader2 } from "lucide-react";

export function AppBreadcrumb() {
  const { items, loading } = useBreadcrumb();

  // Ne pas afficher si aucun breadcrumb ou un seul élément (page d'accueil)
  if (items.length === 0) {
    return null;
  }

  return (
    <BreadcrumbRoot className="mb-4">
      <BreadcrumbList>
        {/* Icône Home */}
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/dashboard" className="flex items-center">
              <Home className="h-4 w-4" />
              <span className="sr-only">Accueil</span>
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <Fragment key={item.href}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {item.isCurrentPage || isLast ? (
                  <BreadcrumbPage>
                    {loading && index > 0 ? (
                      <span className="flex items-center gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Chargement...
                      </span>
                    ) : (
                      item.label
                    )}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={item.href}>
                      {loading && index > 0 ? (
                        <span className="flex items-center gap-1">
                          <Loader2 className="h-3 w-3 animate-spin" />
                        </span>
                      ) : (
                        item.label
                      )}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </BreadcrumbRoot>
  );
}
