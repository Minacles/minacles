"use client";

import { usePathname } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Pages } from "./pages";

export const AppHeader = () => {
  const pathname = usePathname();
  const activePage = Pages.find((page) => pathname.startsWith(page.url));

  return (
    <header className="p-4 flex items-center gap-4">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-6!" />
      <h1 className="font-semibold">
        {activePage ? activePage.name : "Dashboard"}
      </h1>
    </header>
  );
};
