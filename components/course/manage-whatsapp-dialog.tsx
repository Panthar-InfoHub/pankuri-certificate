"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { updateCourse } from "@/lib/backend_actions/course"
import { useForm } from "@tanstack/react-form"
import { Loader2, MessageCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "sonner"
import { z } from "zod"

const whatsappSchema = z.object({
    whatsappCommunityLink: z.string().url("Must be a valid URL").or(z.literal("")),
})

interface ManageWhatsappDialogProps {
    courseId: string
    whatsappLink?: string
    children: React.ReactNode
}

export default function ManageWhatsappDialog({ courseId, whatsappLink, children }: ManageWhatsappDialogProps) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [isPending, startTransition] = useTransition()

    const form = useForm({
        defaultValues: {
            whatsappCommunityLink: whatsappLink || "",
        },
        onSubmit: async ({ value }) => {
            const parsed = whatsappSchema.safeParse(value)
            if (!parsed.success) {
                const errorMsg = parsed.error.flatten().fieldErrors.whatsappCommunityLink?.[0] || "Invalid URL"
                toast.error(errorMsg)
                return
            }

            startTransition(async () => {
                try {
                    const payload = {
                        whatsappCommunityLink: value.whatsappCommunityLink || null, // remove link if empty
                        isAdmin: true 
                    }

                    const result = await updateCourse(courseId, payload)

                    if (result.success) {
                        toast.success("WhatsApp link updated successfully!")
                        setOpen(false)
                        router.refresh()
                    } else {
                        toast.error(result.error || "Failed to update WhatsApp link")
                    }
                } catch (error) {
                    console.error("Manage whatsapp link error:", error)
                    toast.error("An unexpected error occurred")
                }
            })
        },
    })

    const handleOpenChange = (newOpen: boolean) => {
        if (!isPending) {
            setOpen(newOpen)
            if (!newOpen) {
                form.reset()
            }
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Manage WhatsApp Link</DialogTitle>
                    <DialogDescription>
                        Update the WhatsApp community URL for students enrolled in this course
                    </DialogDescription>
                </DialogHeader>

                <form
                    onSubmit={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        form.handleSubmit()
                    }}
                    className="space-y-4"
                >
                    <form.Field
                        name="whatsappCommunityLink"
                        children={(field) => (
                            <Field className="space-y-2">
                                <FieldLabel htmlFor={field.name}>WhatsApp Community Link</FieldLabel>
                                <Input
                                    id={field.name}
                                    type="url"
                                    placeholder="https://chat.whatsapp.com/..."
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    disabled={isPending}
                                />
                                {field.state.meta.errors.length > 0 && <FieldError errors={field.state.meta.errors} />}
                            </Field>
                        )}
                    />

                    <Field orientation="horizontal">
                        <DialogClose asChild>
                            <Button type="button" variant="outline" className="flex-1" disabled={isPending}>
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={isPending} variant="gradient" className="flex-1">
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {!isPending && <MessageCircle className="mr-2 h-4 w-4" />}
                            Update Link
                        </Button>
                    </Field>
                </form>
            </DialogContent>
        </Dialog>
    )
}
