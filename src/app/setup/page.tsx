import { redirect } from "next/navigation";
import { config } from "@/lib/config";
import { shouldSetup } from "@/server/actions/app/shouldSetup";
import { SetupContent } from "./content";

export default async function SetupPage() {
  if (!(await shouldSetup())) {
    return redirect("/");
  }

  return <SetupContent appName={config("app.name")!} />;
}
