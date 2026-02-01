"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { AuthAlert } from "@/components/auth/auth-alert";
import { AuthButton } from "@/components/auth/auth-button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api-client";
import { type MagicLinkResponse } from "@/lib/auth-client";
import { mapAuthError } from "@/lib/auth-utils";

import type { AxiosError } from "axios";


const industrySupervisorLoginSchema = z.object({
  email: z.email("Please enter a valid email address"),
});

type IndustrySupervisorLoginData = z.infer<
  typeof industrySupervisorLoginSchema
>;

export function IndustrySupervisorLoginForm() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loginMutation = useMutation<
    MagicLinkResponse,
    AxiosError | Error,
    IndustrySupervisorLoginData
  >({
    mutationFn: async (data: IndustrySupervisorLoginData) => {
      const response = await apiClient.post<MagicLinkResponse>(
        "/api/auth/sign-in/magic-link",
        {
          email: data.email,
        },
      );

      return response.data;
    },
    onSuccess: () => {
      setErrorMessage(null);
      setSuccessMessage(
        "Magic link sent! Check your email inbox for a secure sign-in link.",
      );
      toast.success("Magic link sent to your email!");
    },
    onError: (error) => {
      const message = mapAuthError(error);
      setErrorMessage(message);
      setSuccessMessage(null);
    },
  });

  const form = useForm({
    defaultValues: {
      email: "",
    },
    validators: {
      onChange: industrySupervisorLoginSchema,
    },
    onSubmit: async ({ value }) => {
      setErrorMessage(null);
      setSuccessMessage(null);
      await loginMutation.mutateAsync(value);
    },
  });

  return (
    <div className="space-y-6">
      {errorMessage && <AuthAlert type="error" message={errorMessage} />}
      {successMessage && <AuthAlert type="success" message={successMessage} />}

      {!successMessage ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <form.Field
            name="email"
            validators={{
              onChange: industrySupervisorLoginSchema.shape.email,
            }}
          >
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Email Address</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="email"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="supervisor@company.com"
                    autoFocus
                    autoComplete="email"
                    aria-invalid={field.state.meta.errors.length > 0}
                    aria-describedby={
                      field.state.meta.errors.length > 0
                        ? `${field.name}-error`
                        : undefined
                    }
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          <AuthButton
            type="submit"
            isLoading={loginMutation.isPending}
            loadingText="Sending magic link..."
            size="lg"
          >
            Send Magic Link
          </AuthButton>

          <p className="text-center text-xs text-muted-foreground">
            Magic links expire after 15 minutes
          </p>
        </form>
      ) : (
        <div className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            Didn&apos;t receive the email? Check your spam folder or{" "}
            <button
              type="button"
              onClick={() => {
                setSuccessMessage(null);
                form.reset();
              }}
              className="text-primary hover:underline"
            >
              try again
            </button>
            .
          </p>
        </div>
      )}
    </div>
  );
}
