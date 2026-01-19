"use client"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useForm } from "@tanstack/react-form"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { toast } from "sonner"
import z from "zod"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, CreditCard, Banknote } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createPlan } from "@/lib/backend_actions/plans"

const planSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    slug: z.string().min(1, "Slug is required"),
    description: z.string().optional(),
    subscriptionType: z.enum(["monthly", "yearly"]),
    planType: z.literal("WHOLE_APP"),
    price: z.number().min(0, "Price must be positive"),
    currency: z.literal("INR"),
})

export function CreatePlanDialog({ children }: { children: React.ReactNode }) {
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const form = useForm({
        defaultValues: {
            name: "",
            slug: "",
            description: "",
            subscriptionType: "monthly",
            planType: "WHOLE_APP",
            price: 0,
            currency: "INR",
        } as z.infer<typeof planSchema>,
        validators: {
            onSubmit: planSchema,
        },
        onSubmit: async ({ value }) => {
            startTransition(async () => {
                try {
                    const payload = {
                        ...value,
                        price: Math.round(value.price * 100), // Convert to paise
                    }

                    const result = await createPlan(payload)

                    if (result.success) {
                        toast.success("Plan created successfully")
                        form.reset()
                        router.refresh()
                    } else {
                        toast.warning(result.error || "Failed to create plan")
                    }
                } catch (error: any) {
                    toast.error(error.message || "An unexpected error occurred")
                }
            })
        },
    })

    const handleTitleChange = (value: string) => {
        const slug = value
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
            .trim()
        form.setFieldValue("slug", slug)
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="text-gradient-brand" >Create App Plan</DialogTitle>
                    <DialogDescription>
                        Add a new plan for the whole application.
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-[500px] w-full pr-4">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            form.handleSubmit()
                        }}
                        className="space-y-6 px-2"
                    >
                        <form.Field
                            name="name"
                            children={(field) => (
                                <Field>
                                    <FieldLabel htmlFor="name" className="text-sm font-medium">
                                        Plan Name *
                                    </FieldLabel>
                                    <Input
                                        id="name"
                                        placeholder="e.g. Pro Plan Monthly"
                                        disabled={isPending}
                                        value={field.state.value}
                                        onChange={(e) => {
                                            field.handleChange(e.target.value)
                                            handleTitleChange(e.target.value)
                                        }}
                                        onBlur={field.handleBlur}
                                    />
                                    {field.state.meta.errors.length > 0 && <FieldError errors={field.state.meta.errors} />}
                                </Field>
                            )}
                        />

                        <form.Field
                            name="slug"
                            children={(field) => (
                                <Field>
                                    <FieldLabel htmlFor="slug" className="text-sm font-medium">
                                        Slug *
                                    </FieldLabel>
                                    <Input
                                        id="slug"
                                        placeholder="plan-slug"
                                        disabled={isPending}
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        onBlur={field.handleBlur}
                                    />
                                    {field.state.meta.errors.length > 0 && <FieldError errors={field.state.meta.errors} />}
                                </Field>
                            )}
                        />

                        <form.Field
                            name="description"
                            children={(field) => (
                                <Field>
                                    <FieldLabel htmlFor="description" className="text-sm font-medium">
                                        Description
                                    </FieldLabel>
                                    <Textarea
                                        id="description"
                                        placeholder="Describe the plan benefits..."
                                        disabled={isPending}
                                        rows={3}
                                        value={field.state.value || ""}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        onBlur={field.handleBlur}
                                    />
                                    {field.state.meta.errors.length > 0 && <FieldError errors={field.state.meta.errors} />}
                                </Field>
                            )}
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <form.Field
                                name="subscriptionType"
                                children={(field) => (
                                    <Field className="flex flex-col gap-2">
                                        <FieldLabel htmlFor={field.name} className="text-sm font-medium text-foreground/80 flex items-center gap-2">
                                            <CreditCard className="w-4 h-4 text-muted-foreground" />
                                            Billing Cycle *
                                        </FieldLabel>
                                        <Select disabled={isPending} value={field.state.value} onValueChange={(value: "monthly" | "yearly") => field.handleChange(value)}>
                                            <SelectTrigger className="h-10 bg-background shadow-sm transition-shadow focus-visible:ring-1">
                                                <SelectValue placeholder="Select cycle" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="monthly" className="cursor-pointer">Monthly</SelectItem>
                                                <SelectItem value="yearly" className="cursor-pointer">Yearly</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {field.state.meta.errors.length > 0 && <FieldError errors={field.state.meta.errors} />}
                                    </Field>
                                )}
                            />

                            <form.Field
                                name="price"
                                children={(field) => (
                                    <Field className="flex flex-col gap-2">
                                        <FieldLabel htmlFor={field.name} className="text-sm font-medium text-foreground/80 flex items-center gap-2">
                                            <Banknote className="w-4 h-4 text-muted-foreground" />
                                            Price (₹) *
                                        </FieldLabel>
                                        <Input
                                            id={field.name}
                                            value={field.state.value}
                                            disabled={isPending}
                                            type="number"
                                            min="0"
                                            onChange={(e) => field.handleChange(parseFloat(e.target.value) || 0)}
                                            placeholder="0.00"
                                            className="h-10 bg-background shadow-sm transition-shadow focus-visible:ring-1"
                                        />
                                        <p className="text-[10px] text-muted-foreground">
                                            Enter price in Rupees. It will be stored as Paise.
                                        </p>
                                        {field.state.meta.errors.length > 0 && <FieldError errors={field.state.meta.errors} />}
                                    </Field>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <form.Field
                                name="planType"
                                children={(field) => (
                                    <Field className="flex flex-col gap-2">
                                        <FieldLabel className="text-sm font-medium text-foreground/80">
                                            Plan Type
                                        </FieldLabel>
                                        <Input
                                            value={field.state.value}
                                            // disabled={true}
                                            readOnly
                                            className="bg-muted"
                                        />
                                    </Field>
                                )}
                            />

                            <form.Field
                                name="currency"
                                children={(field) => (
                                    <Field className="flex flex-col gap-2">
                                        <FieldLabel className="text-sm font-medium text-foreground/80">
                                            Currency
                                        </FieldLabel>
                                        <Input
                                            value={field.state.value}
                                            // disabled={true}
                                            readOnly
                                            className="bg-muted"
                                        />
                                    </Field>
                                )}
                            />
                        </div>


                        <div className="flex gap-2 pt-4">
                            <DialogClose asChild>
                                <Button type="button" variant="outline" disabled={isPending} className="flex-1 bg-transparent">
                                    Cancel
                                </Button>
                            </DialogClose>

                            <Button type="submit" variant="gradient" disabled={isPending || !form.state.isFormValid} className="flex-1">
                                {isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    "Create Plan"
                                )}
                            </Button>
                        </div>
                    </form>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}
