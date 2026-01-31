"use client";

import { AuthAlert } from "@/components/auth/auth-alert";
import { AuthButton } from "@/components/auth/auth-button";
import { PasswordInput } from "@/components/auth/password-input";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api-client";
import { type SignInResponse } from "@/lib/auth-client";
import { mapAuthError } from "@/lib/auth-utils";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

const adminLoginSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(16, "Password must not exceed 16 characters"),
});

type AdminLoginData = z.infer<typeof adminLoginSchema>;

export function AdminLoginForm() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loginMutation = useMutation<
    SignInResponse,
    AxiosError | Error,
    AdminLoginData
  >({
    mutationFn: async (data: AdminLoginData) => {
      const response = await apiClient.post<SignInResponse>(
        "/api/auth/sign-in/email",
        {
          email: data.email,
          password: data.password,
        },
      );

      return response.data;
    },
    onSuccess: () => {
      setErrorMessage(null);
      toast.success("Sign in successful! Redirecting to your dashboard...");

      setTimeout(() => {
        router.push("/admin");
      }, 500);
    },
    onError: (error) => {
      const message = mapAuthError(error);

      setErrorMessage(message);
    },
  });

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onChange: adminLoginSchema,
    },
    onSubmit: async ({ value }) => {
      setErrorMessage(null);
      await loginMutation.mutateAsync(value);
    },
  });

  return (
    <div className="space-y-6">
      {errorMessage && <AuthAlert type="error" message={errorMessage} />}

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
            onChange: adminLoginSchema.shape.email,
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
                  placeholder="admin@abu.edu.ng"
                  autoFocus
                  autoComplete="email"
                  aria-invalid={isInvalid}
                  aria-describedby={
                    isInvalid ? `${field.name}-error` : undefined
                  }
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>

        <form.Field
          name="password"
          validators={{
            onChange: adminLoginSchema.shape.password,
          }}
        >
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                <PasswordInput
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  aria-invalid={isInvalid}
                  aria-describedby={
                    isInvalid ? `${field.name}-error` : undefined
                  }
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>

        <div className="flex items-center justify-end">
          <Link
            href="/contact"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Forgot password? Contact SIWES Unit
          </Link>
        </div>

        <AuthButton
          type="submit"
          isLoading={loginMutation.isPending}
          loadingText="Signing in..."
          size="lg"
        >
          Sign In
        </AuthButton>

        <p className="text-center text-xs text-muted-foreground">
          You&apos;ll stay signed in for 7 days
        </p>
      </form>
    </div>
  );
}
