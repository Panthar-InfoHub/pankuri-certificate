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
import { updateCourse } from "@/lib/backend_actions/course"
import { useForm } from "@tanstack/react-form"
import { Loader2, UserPlus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "sonner"
import { z } from "zod"
import { TrainerCombobox } from "./trainer-combobox"

const trainerSchema = z.object({
    trainerId: z.string().min(1, "Trainer is required"),
})
interface AddTrainerDialogProps {
    courseId: string
    trainerId?: string
    children: React.ReactNode
}

export default function AddTrainerDialog({ courseId, trainerId, children }: AddTrainerDialogProps) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [isPending, startTransition] = useTransition()

    const form = useForm({
        defaultValues: {
            trainerId: trainerId || "",
        },
        validators: {
            onSubmit: trainerSchema,
        },
        onSubmit: async ({ value }) => {
            startTransition(async () => {
                try {
                    // Update course with new trainerId
                    const payload = {
                        trainerId: value.trainerId, // Add trainer
                        isAdmin: true //Indicate i am a admin to update the course
                    }

                    const result = await updateCourse(courseId, payload)

                    if (result.success) {
                        toast.success("Trainer added successfully!")
                        setOpen(false)
                        form.reset()
                        router.refresh()
                    } else {
                        toast.error(result.error || "Failed to add trainer")
                    }
                } catch (error) {
                    console.error("Add trainer error:", error)
                    toast.error("An unexpected error occurred")
                }
            })
        },
    })

    const handleOpenChange = (newOpen) => {
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
                    <DialogTitle>Add Trainer to Course</DialogTitle>
                    <DialogDescription>
                        Select a trainer to add to this course
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
                    {/* Trainer Selection */}
                    <form.Field
                        name="trainerId"
                        children={(field) => (
                            <Field className="space-y-2">
                                <FieldLabel htmlFor={field.name}>Select Trainer *</FieldLabel>
                                <TrainerCombobox
                                    value={field.state.value}
                                    onValueChange={(value) => field.handleChange(value)}
                                    disabled={isPending}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Choose a trainer to assign to this course
                                </p>
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
                        <Button type="submit" disabled={isPending || !form.state.values.trainerId} variant="gradient" className="flex-1">
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {!isPending && <UserPlus className="mr-2 h-4 w-4" />}
                            Add Trainer
                        </Button>
                    </Field>
                </form>
            </DialogContent>
        </Dialog>
    )
}
