"use client";

import { Trash } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { CardAction } from "@/components/ui/card";
import { deleteJavaInstance } from "@/server/actions/java/deleteJavaInstance";

export const InstanceAction = ({ instanceId }: { instanceId: string }) => {
  const deleteInstance = async () => {
    toast.promise(deleteJavaInstance(instanceId), {
      loading: "Deleting Java instance...",
      success: "Java instance deleted successfully",
      error: "Failed to delete Java instance",
    });
  };

  return (
    <CardAction>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button size="icon-sm" variant="destructive">
            <Trash />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteInstance}
              className="bg-destructive"
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </CardAction>
  );
};
