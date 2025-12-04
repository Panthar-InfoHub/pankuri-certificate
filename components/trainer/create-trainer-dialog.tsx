"use client"

import { useState, useTransition } from "react"
import { useForm } from "@tanstack/react-form"
import { z } from "zod"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { X } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { UserCombobox } from "./user-combobox"
import { createTrainer } from "@/lib/backend_actions/trainer"
import { Field, FieldError } from "../ui/field"

const trainerSchema = z.object({
    userId: z.string().min(1, "User is required"),
    bio: z.string().optional(),
    specialization: z.array(z.string()).default([]).optional(),
    experience: z.number().min(0, "Experience must be 0 or greater").optional(),
    socialLinks: z.object({
        linkedin: z.string().optional(),
        instagram: z.string().optional(),
        twitter: z.string().optional(),
        website: z.string().optional(),
    }).optional(),
})

export function CreateTrainerDialog({ children }) {
    const [open, setOpen] = useState(false)
    const [isPending, startTransition] = useTransition()
    const router = useRouter()
    const [specializationInput, setSpecializationInput] = useState("")
    const [specializationTags, setSpecializationTags] = useState([])

    const form = useForm({
        defaultValues: {
            userId: "",
            bio: "",
            specialization: [],
            experience: 0,
            socialLinks: {
                linkedin: "",
                instagram: "",
                twitter: "",
                website: "",
            },
        } as z.infer<typeof trainerSchema>,
        validators: {
            onSubmit: trainerSchema,
        },
        onSubmit: async ({ value }) => {
            startTransition(async () => {
                // Prepare payload with specialization tags
                const payload = {
                    ...value,
                    specialization: specializationTags,
                    experience: value.experience || 0,
                }

                // Remove empty social links
                if (payload.socialLinks) {
                    (Object.keys(payload.socialLinks) as (keyof typeof payload.socialLinks)[]).forEach(key => {
                        if (!payload.socialLinks[key]) {
                            delete payload.socialLinks[key]
                        }
                    })
                    if (Object.keys(payload.socialLinks).length === 0) {
                        delete payload.socialLinks
                    }
                }

                const result = await createTrainer(payload)
                if (result.success) {
                    toast.success("Trainer created successfully")
                    setOpen(false)
                    form.reset()
                    setSpecializationTags([])
                    router.refresh()
                } else {
                    toast.error(result.error || "Failed to create trainer")
                }
            })
        },
    })

    const handleAddSpecialization = () => {
        const tag = specializationInput.trim()
        if (tag && !specializationTags.includes(tag)) {
            setSpecializationTags([...specializationTags, tag])
            setSpecializationInput("")
        }
    }

    const handleRemoveSpecialization = (tagToRemove) => {
        setSpecializationTags(specializationTags.filter(tag => tag !== tagToRemove))
    }

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault()
            handleAddSpecialization()
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-gradient-brand">Create New Trainer</DialogTitle>
                    <DialogDescription>
                        Upgrade a user to trainer by providing their profile details
                    </DialogDescription>
                </DialogHeader>

                <form
                    onSubmit={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        form.handleSubmit()
                    }}
                    className="space-y-6"
                >
                    {/* User Selection */}
                    <form.Field
                        name="userId"
                        validators={{
                            onChange: z.string().min(1, "User is required"),
                        }}
                        children={(field) => (
                            <div className="space-y-2">
                                <label htmlFor={field.name} className="text-sm font-medium">
                                    User <span className="text-destructive">*</span>
                                </label>
                                <UserCombobox
                                    value={field.state.value}
                                    onValueChange={field.handleChange}
                                    disabled={isPending}
                                />
                                {field.state.meta.errors.length > 0 && <FieldError errors={field.state.meta.errors} />}
                            </div>
                        )}
                    />

                    {/* Bio */}
                    <form.Field
                        name="bio"
                        children={(field) => (
                            <div className="space-y-2">
                                <label htmlFor={field.name} className="text-sm font-medium">
                                    Bio
                                </label>
                                <Textarea
                                    id={field.name}
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    disabled={isPending}
                                    placeholder="Brief biography of the trainer..."
                                    rows={4}
                                />
                            </div>
                        )}
                    />

                    {/* Specialization */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Specialization</label>
                        <div className="flex gap-2">
                            <Input
                                value={specializationInput}
                                onChange={(e) => setSpecializationInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="e.g., yoga, meditation, pranayama"
                                disabled={isPending}
                            />
                            <Button
                                type="button"
                                variant="gradient"
                                onClick={handleAddSpecialization}
                                disabled={isPending || !specializationInput.trim()}
                            >
                                Add
                            </Button>
                        </div>
                        {specializationTags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {specializationTags.map((tag) => (
                                    <div
                                        key={tag}
                                        className="flex items-center gap-1 bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm"
                                    >
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveSpecialization(tag)}
                                            disabled={isPending}
                                            className="ml-1 hover:text-destructive"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Experience */}
                    <form.Field
                        name="experience"
                        validators={{
                            onChange: z.number().min(0, "Experience must be 0 or greater"),
                        }}
                        children={(field) => (
                            <div className="space-y-2">
                                <label htmlFor={field.name} className="text-sm font-medium">
                                    Experience (years)
                                </label>
                                <Input
                                    id={field.name}
                                    type="number"
                                    min="0"
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(parseInt(e.target.value) || 0)}
                                    disabled={isPending}
                                />
                                {field.state.meta.errors.length > 0 && <FieldError errors={field.state.meta.errors} />}
                            </div>
                        )}
                    />

                    {/* Social Links */}
                    <div className="space-y-4">
                        <label className="text-sm font-medium">Social Links</label>

                        <form.Field
                            name="socialLinks.linkedin"
                            children={(field) => (
                                <div className="space-y-1">
                                    <label htmlFor={field.name} className="text-xs text-muted-foreground">
                                        LinkedIn
                                    </label>
                                    <Input
                                        id={field.name}
                                        value={field.state.value as string}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        disabled={isPending}
                                        placeholder="https://linkedin.com/in/username"
                                    />
                                </div>
                            )}
                        />

                        <form.Field
                            name="socialLinks.instagram"
                            children={(field) => (
                                <div className="space-y-1">
                                    <label htmlFor={field.name} className="text-xs text-muted-foreground">
                                        Instagram
                                    </label>
                                    <Input
                                        id={field.name}
                                        value={field.state.value as string}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        disabled={isPending}
                                        placeholder="@username"
                                    />
                                </div>
                            )}
                        />

                        <form.Field
                            name="socialLinks.twitter"
                            children={(field) => (
                                <div className="space-y-1">
                                    <label htmlFor={field.name} className="text-xs text-muted-foreground">
                                        Twitter
                                    </label>
                                    <Input
                                        id={field.name}
                                        value={field.state.value as string}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        disabled={isPending}
                                        placeholder="@username"
                                    />
                                </div>
                            )}
                        />

                        <form.Field
                            name="socialLinks.website"
                            children={(field) => (
                                <div className="space-y-1">
                                    <label htmlFor={field.name} className="text-xs text-muted-foreground">
                                        Website
                                    </label>
                                    <Input
                                        id={field.name}
                                        value={field.state.value as string}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        disabled={isPending}
                                        placeholder="https://example.com"
                                    />
                                </div>
                            )}
                        />
                    </div>

                    <Field orientation="horizontal">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={isPending}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" variant="gradient" className="flex-1" disabled={isPending}>
                            {isPending ? "Creating..." : "Create Trainer"}
                        </Button>
                    </Field>
                </form>
            </DialogContent>
        </Dialog>
    )
}
