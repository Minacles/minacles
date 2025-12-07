"use client";

import { useForm } from "@tanstack/react-form";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useDebouncedCallback } from "use-debounce";
import z, { set } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { logger } from "@/lib/logger";
import { createUserInstance } from "@/server/actions/java/createUserInstance";
import { queryJavaInstance } from "@/server/actions/java/queryJavaInstance";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  path: z.string().min(1, "Path is required"),
});

export const AddLocalJavaInstance = ({
  closeDialog,
}: {
  closeDialog: () => void;
}) => {
  const [queryResult, setQueryResult] = useState<
    { version?: string } | Error | null
  >(null);

  const form = useForm({
    defaultValues: {
      name: "",
      path: "",
    },
    validators: {
      onSubmit: schema,
    },
    onSubmit: async ({ value }) => {
      const promise = createUserInstance(value.name, value.path);
      toast.promise(promise, {
        loading: "Adding Java instance...",
        success: "Java instance added successfully.",
        error: "Failed to add Java instance.",
      });

      try {
        void (await promise);
        closeDialog();
      } catch (error) {
        logger.error("Failed to add Java instance", error);
      }
    },
  });

  const fetchPathDetail = useDebouncedCallback(async (path: string) => {
    try {
      const result = await queryJavaInstance(path);
      setQueryResult(result);
    } catch {
      setQueryResult(new Error("Command not found or failed to execute."));
    }
  }, 1_500);

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <FieldGroup>
        <form.Field
          name="path"
          validators={{
            onSubmit(v) {
              !v.value.trim() || !queryResult || queryResult instanceof Error
                ? "Path is required and must be valid"
                : undefined;
            },
          }}
        >
          {(field) => (
            <Field>
              <FieldLabel>Local Path</FieldLabel>
              <Input
                placeholder="/usr/bin/java"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => {
                  fetchPathDetail(e.target.value);
                  field.handleChange(e.target.value);
                }}
              />

              {queryResult instanceof Error ? (
                <FieldError>{queryResult.message}</FieldError>
              ) : queryResult ? (
                <p className="text-sm text-muted-foreground">
                  Detected version{" "}
                  <span className="font-semibold">
                    {queryResult.version ?? "Unknown"}
                  </span>
                </p>
              ) : null}
            </Field>
          )}
        </form.Field>

        <form.Field name="name">
          {(field) => (
            <Field>
              <FieldLabel>Instance Name</FieldLabel>
              <Input
                placeholder="My Java Instance"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </Field>
          )}
        </form.Field>
      </FieldGroup>

      <Button
        disabled={
          form.state.isPristine ||
          !form.state.isValid ||
          !queryResult ||
          queryResult instanceof Error
        }
        className="w-full"
        type="submit"
      >
        <Plus /> Add Instance
      </Button>
    </form>
  );
};
