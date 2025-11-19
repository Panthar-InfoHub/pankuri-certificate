"use client"

import { useForm } from "@tanstack/react-form"
import { GalleryVerticalEnd, Loader2 } from 'lucide-react'
import { useTransition } from "react"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup } from "@/components/ui/field"
import { cn } from "@/lib/utils"

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string(),
})


export function LoginForm({ className, ...props }) {
  const [isPending, startTransition] = useTransition()

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onChange: loginSchema,
    },
    onSubmit: async ({ value }) => {
      if (onSubmit) {
        startTransition(async () => {
          // await onSubmit(value)
        })
      }
    },
  })

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
      >
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <a href="#" className="flex flex-col items-center gap-2 font-medium">
              <div className="flex size-8 items-center justify-center rounded-md">
                <GalleryVerticalEnd className="size-6" />
              </div>
              <span className="sr-only">Acadma</span>
            </a>
            <h1 className="text-xl font-bold">Welcome to Acadma</h1>
          </div>

          <form.Field
            name="email"
            children={(field) => (
              <Field>
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  disabled={isPending}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-destructive mt-1">{field.state.meta.errors[0]}</p>
                )}
              </Field>
            )}
          />

          <form.Field
            name="password"
            children={(field) => (
              <Field>
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  disabled={isPending}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-destructive mt-1">{field.state.meta.errors[0]}</p>
                )}
              </Field>
            )}
          />

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <Field>
                <Button
                  variant="gradient"
                  type="submit"
                  disabled={!canSubmit || isSubmitting || isPending}
                  className="w-full"
                >
                  {isSubmitting || isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>
              </Field>
            )}
          />
        </FieldGroup>
      </form>
    </div>
  )
}
