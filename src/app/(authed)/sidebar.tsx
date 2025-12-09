"use client";

import { ChevronUp, User2 } from "lucide-react";
import Link from "next/link";
import { redirect, usePathname } from "next/navigation";
import { authClient } from "@/client/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Spinner } from "@/components/ui/spinner";
import { Pages } from "./pages";

export const AppSidebar = ({ appName }: { appName: string }) => {
  const pathname = usePathname();
  const { data, isPending } = authClient.useSession();

  return (
    <Sidebar>
      <SidebarHeader>
        <h3 className="font-semibold p-2">{appName}</h3>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {Pages.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith(item.url)}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  {isPending ? (
                    <Spinner />
                  ) : (
                    <>
                      {data?.user.image ? (
                        <img
                          src={data?.user.image}
                          alt="User"
                          className="w-6 h-6 rounded-full"
                        />
                      ) : (
                        <User2 />
                      )}{" "}
                      {data?.user.name}
                    </>
                  )}
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-(--radix-popper-anchor-width)"
                sideOffset={8}
              >
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => authClient.signOut().then(() => redirect("/"))}
                >
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};
