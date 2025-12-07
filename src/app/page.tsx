import Image from "next/image";
import { redirect } from "next/navigation";
import { config } from "@/lib/config";
import { shouldSetup } from "@/server/actions/app/shouldSetup";
import { LoginContent } from "./content";

export default async function Home() {
  if (await shouldSetup()) {
    return redirect("/setup");
  }

  return <LoginContent appName={config("app.name")!} />;
}
