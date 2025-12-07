"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddLocalJavaInstance } from "./local";

export const AddJavaInstance = () => {
  const [isOpen, setIsOpen] = useState(false);

  const closeDialog = () => setIsOpen(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Add Instance
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Java Instance</DialogTitle>
          <DialogDescription>
            Add installed Java instance from your system, or install it from
            here.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="local">
          <TabsList className="mb-2">
            <TabsTrigger value="adoptium">Adoptium</TabsTrigger>
            <TabsTrigger value="local">Local</TabsTrigger>
          </TabsList>

          <TabsContent value="adoptium">
            <p>Adoptium installation coming soon!</p>
          </TabsContent>

          <TabsContent value="local">
            <AddLocalJavaInstance closeDialog={closeDialog} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
