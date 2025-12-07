/** biome-ignore-all lint/correctness/noChildrenProp: guide */
"use client";

import { useForm } from "@tanstack/react-form";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import z, { set } from "zod";
import { authClient } from "@/client/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { logger } from "@/lib/logger";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export const SetupContent = ({ appName }: { appName: string }) => {
  const [completed, setCompleted] = useState(false);
  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
    validators: {
      onSubmit: schema,
    },
    onSubmit: async ({ value }) => {
      const { error } = await authClient.signUp.email({
        email: value.email,
        password: value.password,
        name: value.name,
      });

      if (error) {
        logger.error(error);

        return toast.error(error.statusText);
      }

      setCompleted(true);
    },
  });

  return (
    <main className="grid place-items-center min-h-screen">
      <Card className="min-w-sm">
        <CardHeader className="gap-0">
          <CardDescription>Welcome to</CardDescription>
          <CardTitle className="text-2xl">{appName}</CardTitle>
        </CardHeader>
        {!completed && (
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit();
              }}
            >
              <FieldGroup>
                <form.Field
                  name="name"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          autoComplete="off"
                          placeholder="Jane Doe"
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                />
                <form.Field
                  name="email"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          autoComplete="off"
                          type="email"
                          placeholder="jane.doe@example.com"
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                />
                <form.Field
                  name="password"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          autoComplete="off"
                          type="password"
                          placeholder="•••••••••"
                          minLength={8}
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                />
                <Field>
                  <Button type="submit" disabled={form.state.isSubmitting}>
                    Create Account
                  </Button>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        )}

        {completed && (
          <CardContent className="flex flex-col gap-6">
            <p className="text-center">Setup completed! You can now log in.</p>
            <Link href="/" className="w-full">
              <Button className="w-full">Back to Login</Button>
            </Link>
          </CardContent>
        )}
      </Card>
    </main>
  );
};
