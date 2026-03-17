"use client"

import { useForm } from "@tanstack/react-form"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "sonner"
import z from "zod"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { updatePlan } from "@/lib/backend_actions/plans"

export function EditPlanDialog({ plan, children }: { plan: any, children: React.ReactNode }) {
    const [isPending, startTransition] = useTransition()
    const router = useRouter()
    const [open, setOpen] = useState(false)

    const form = useForm({
        defaultValues: {
            name: plan.name,
            slug: plan.slug,
            description: plan.description || "",
        },
        validators: {
            onSubmit: z.object({
                name: z.string().min(3, "Name must be at least 3 characters"),
                slug: z.string().min(1, "Slug is required"),
                description: z.string(),
            }),
        },
        onSubmit: async ({ value }) => {
            startTransition(async () => {
                const result = await updatePlan(plan.id, value)
                if (result.success) {
                    toast.success("Plan updated successfully")
                    setOpen(false)
                    router.refresh()
                } else {
                    toast.warning(result.error || "Failed to update plan")
                }
            })
        }
    })

    return (
        <Dialog open={open} onOpenChange={setOpen} >
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>Edit Plan</DialogTitle>
                    <DialogDescription>Update the name and description for this plan.</DialogDescription>
                </DialogHeader>
                <form onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); form.handleSubmit(); }} className="space-y-4">
                    <form.Field name="name" children={(field) => (
                        <Field>
                            <FieldLabel htmlFor="name">Name *</FieldLabel>
                            <Input 
                                id="name"
                                value={field.state.value} 
                                disabled={isPending}
                                onChange={(e) => {
                                    field.handleChange(e.target.value)
                                    const slug = e.target.value
                                        .toLowerCase()
                                        .replace(/[^a-z0-9\s-]/g, "")
                                        .replace(/\s+/g, "-")
                                        .replace(/-+/g, "-")
                                        .trim()
                                    form.setFieldValue("slug", slug)
                                }} 
                            />
                            {field.state.meta.errors.length > 0 && <FieldError errors={field.state.meta.errors} />}
                        </Field>
                    )} />
                    <form.Field name="slug" children={(field) => (
                        <Field>
                            <FieldLabel htmlFor="slug">Slug *</FieldLabel>
                            <Input 
                                id="slug"
                                value={field.state.value} 
                                disabled={isPending}
                                onChange={(e) => field.handleChange(e.target.value)} 
                            />
                            {field.state.meta.errors.length > 0 && <FieldError errors={field.state.meta.errors} />}
                        </Field>
                    )} />
                    <form.Field name="description" children={(field) => (
                        <Field>
                            <FieldLabel htmlFor="description">Description</FieldLabel>
                            <Textarea 
                                id="description"
                                disabled={isPending}
                                value={field.state.value} 
                                onChange={(e) => field.handleChange(e.target.value)} 
                            />
                            {field.state.meta.errors.length > 0 && <FieldError errors={field.state.meta.errors} />}
                        </Field>
                    )} />
                    <div className="flex gap-2">
                        <DialogClose asChild><Button variant="outline" type="button" disabled={isPending} className="flex-1">Cancel</Button></DialogClose>
                        <Button type="submit" disabled={isPending} className="flex-1">
                            {isPending ? <Loader2 className="animate-spin h-4 w-4" /> : "Save Changes"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
