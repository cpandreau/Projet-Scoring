import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/sidebar";
import { MainContent } from "@/components/layout/main-content";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar email={user.email || ""} />
      {/* Main content */}
      <main className="lg:pl-64">
        <div className="pt-16 lg:pt-0">
          <div className="container mx-auto py-6 px-4">
            <MainContent>{children}</MainContent>
          </div>
        </div>
      </main>
    </div>
  );
}
