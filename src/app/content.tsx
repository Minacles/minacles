/** biome-ignore-all lint/correctness/noChildrenProp: guide */
"use client";

import { useForm } from "@tanstack/react-form";
import { redirect } from "next/navigation";
import { toast } from "sonner";
import z from "zod";
import { authClient } from "@/client/auth";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { logger } from "@/lib/logger";

const schema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export const LoginContent = ({ appName }: { appName: string }) => {
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onSubmit: schema,
    },
    onSubmit: async ({ value }) => {
      const { error } = await authClient.signIn.email({
        email: value.email,
        password: value.password,
        rememberMe: true,
      });

      if (error) {
        logger.error(error);

        return toast.error(error.statusText);
      }

      toast.success("Successfully signed in!");
      return redirect("/servers");
    },
  });

  return (
    <div className="bg-zinc-200 min-h-screen flex justify-end">
      <main className="w-2/5 bg-secondary p-8 flex flex-col justify-center gap-8">
        <div>
          <h1 className="font-medium text-muted-foreground">{appName}</h1>
          <p className="text-2xl font-semibold">Welcome Back</p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
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
                      autoComplete="email"
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
                      autoComplete="current-password"
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
              <Button type="submit" className="w-full">
                Sign In
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </main>
    </div>
  );
};
