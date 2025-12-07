import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { config } from "@/lib/config";
import { getSession } from "@/server/actions/user/getSession";
import { Sidebar } from "./sidebar";

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
    <div className="bg-secondary h-screen flex p-2">
      <Sidebar appName={config("app.name")!} />

      {children}
    </div>
  );
}
