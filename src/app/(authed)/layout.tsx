import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { config } from "@/lib/config";
import { getSession } from "@/server/actions/user/getSession";
import { AppHeader } from "./header";
import { AppSidebar } from "./sidebar";

export default async function AuthenticatedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSession(await headers());

  if (!session) {
    return redirect("/");
  }

  return (
    <SidebarProvider>
      <AppSidebar appName={config("app.name")!} />

      <main className="flex-1 flex flex-col">
        <AppHeader />

        {children}
      </main>
    </SidebarProvider>
  );
}
