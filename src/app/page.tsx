import { headers } from "next/headers";
import Image from "next/image";
import { redirect } from "next/navigation";
import { config } from "@/lib/config";
import { shouldSetup } from "@/server/actions/app/shouldSetup";
import { getSession } from "@/server/actions/user/getSession";
import { LoginContent } from "./content";

export default async function Home() {
  if (await shouldSetup()) {
    return redirect("/setup");
  }

  const session = await getSession(await headers());
  if (session) {
    return redirect("/servers");
  }

  return <LoginContent appName={config("app.name")!} />;
}
