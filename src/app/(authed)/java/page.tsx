import { Plus } from "lucide-react";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { getJavaInstances } from "@/server/actions/java/getJavaInstances";
import { syncSystemJava } from "@/server/actions/java/syncSystemJava";

async function JavaInstancesList() {
  await syncSystemJava();
  const instances = await getJavaInstances();

  return (
    <section className="flex flex-col">
      <header className="flex justify-between mb-4 items-center">
        <h3 className="text-muted-foreground">
          <span className="font-semibold">{instances.length}</span> instance
          recorded
        </h3>
        <Button>
          <Plus />
          Add Instance
        </Button>
      </header>

      <section>
        {instances.map((instance) => (
          <Card key={instance.id}>
            <CardHeader>
              <CardTitle className="flex gap-4 items-center">
                {instance.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3">
              <div>
                <p className="text-sm font-medium">Version</p>
                <p className="text-muted-foreground">{instance.version}</p>
              </div>

              <div>
                <p className="text-sm font-medium">Path</p>
                <p className="text-muted-foreground">{instance.path}</p>
              </div>

              <div>
                <p className="text-sm font-medium">Managed</p>
                <p className="text-muted-foreground">
                  by{" "}
                  {instance.isSystem
                    ? "System"
                    : instance.isManaged
                      ? "Minacles"
                      : "User"}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
    </section>
  );
}

export default function ManageJavaPage() {
  return (
    <section className="p-4 flex flex-col grow">
      <Suspense
        fallback={
          <div className="w-full h-full grid place-items-center">
            <Spinner className="size-8" />
          </div>
        }
      >
        <JavaInstancesList />
      </Suspense>
    </section>
  );
}
