import { QueryClientProvider } from "@tanstack/react-query";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { queryClient } from "@/client/query";
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
    <QueryClientProvider client={queryClient}>
      <SidebarProvider>
        <AppSidebar appName={config("app.name")!} />

        <main className="flex-1 flex flex-col">
          <AppHeader />

          {children}
        </main>
      </SidebarProvider>
    </QueryClientProvider>
  );
}
