"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useCurrentEnterprise } from "@/hooks";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Building, BarChart3, Info, FileText, Loader2, LayoutDashboard } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

interface SidebarProps {
  email: string;
}

interface SidebarContentProps extends SidebarProps {
  onNavigate?: () => void;
}

function getInitials(email: string): string {
  const parts = email.split("@")[0].split(/[._-]/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

function SidebarContent({ email, onNavigate }: SidebarContentProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const { enterprise, enterpriseId, loading } = useCurrentEnterprise();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  // Tab actuel (pour la page entreprise)
  const currentTab = searchParams.get("tab") || "informations";

  // Détermine si le score est disponible (statut "valide" ou "analyse")
  const isScoreAvailable = enterprise?.statut === "valide" || enterprise?.statut === "analyse";

  // Liens pour l'entreprise en cours (utilise ?tab= au lieu de pages séparées)
  const enterpriseLinks = enterpriseId
    ? [
        {
          name: "Informations",
          href: `/enterprise/${enterpriseId}`,
          icon: Info,
          tab: "informations",
        },
        {
          name: "Documents",
          href: `/enterprise/${enterpriseId}?tab=documents`,
          icon: FileText,
          tab: "documents",
        },
        {
          name: "Score",
          href: `/enterprise/${enterpriseId}?tab=score`,
          icon: BarChart3,
          tab: "score",
          badge: !isScoreAvailable ? "Indisponible" : null,
          disabled: !isScoreAvailable,
        },
      ]
    : [];

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6">
        <Link href="/dashboard" onClick={onNavigate} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">D</span>
          </div>
          <span className="font-semibold text-lg">Défaillantomètre</span>
        </Link>
      </div>

      <Separator />

      {/* Navigation principale */}
      <div className="p-4">
        <p className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Navigation
        </p>
        <nav className="space-y-1">
          <Link
            href="/dashboard"
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              pathname === "/dashboard"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <LayoutDashboard className="h-4 w-4" />
            Tableau de bord
          </Link>
          <Link
            href="/enterprise"
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              pathname === "/enterprise" || (pathname.startsWith("/enterprise/") && !enterpriseId)
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Building className="h-4 w-4" />
            Entreprises
          </Link>
        </nav>
      </div>

      {/* Section Entreprise en cours */}
      {enterpriseId && (
        <>
          <Separator />
          <div className="p-4 flex-1">
            <p className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Entreprise en cours
            </p>

            {/* Nom de l'entreprise */}
            <div className="px-3 py-2 mb-2">
              {loading ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Chargement...</span>
                </div>
              ) : (
                <p className="text-sm font-medium truncate" title={enterprise?.raison_sociale || "Sans nom"}>
                  {enterprise?.raison_sociale || "Sans nom"}
                </p>
              )}
            </div>

            {/* Liens de l'entreprise */}
            <nav className="space-y-1">
              {enterpriseLinks.map((item) => {
                // Vérifie si on est sur la page entreprise et sur le bon tab
                const isOnEnterprisePage = pathname === `/enterprise/${enterpriseId}`;
                const isActive = isOnEnterprisePage && currentTab === item.tab;
                const Icon = item.icon;

                if (item.disabled) {
                  return (
                    <div
                      key={item.name}
                      className="flex items-center justify-between gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground/50 cursor-not-allowed"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4" />
                        {item.name}
                      </div>
                      {item.badge && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </>
      )}

      <div className="mt-auto">
        <Separator />

        {/* User section */}
        <div className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-muted text-muted-foreground text-sm">
                {getInitials(email)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{email}</p>
            </div>
            <ThemeToggle />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={handleLogout}
          >
            Déconnexion
          </Button>
        </div>
      </div>
    </div>
  );
}

export function Sidebar({ email }: SidebarProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile trigger */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-background border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
                <span className="ml-2">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SheetTitle className="sr-only">Menu de navigation</SheetTitle>
              <SidebarContent email={email} onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
          <span className="font-semibold">Défaillantomètre</span>
          <div className="w-20" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-card border-r">
        <SidebarContent email={email} />
      </aside>
    </>
  );
}
