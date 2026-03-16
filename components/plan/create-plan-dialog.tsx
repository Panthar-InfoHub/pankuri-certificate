"use client"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useForm } from "@tanstack/react-form"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { toast } from "sonner"
import z from "zod"
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, CreditCard, Banknote, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createPlan } from "@/lib/backend_actions/plans"
import { Switch } from "../ui/switch"

const planSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    slug: z.string().min(1, "Slug is required"),
    description: z.string().optional(),
    subscriptionType: z.enum(["monthly", "yearly"]),
    planType: z.literal("WHOLE_APP"),
    price: z.number().min(0, "Price must be positive"),
    currency: z.literal("INR"),
    deactivateOthers: z.boolean().optional(),
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
            deactivateOthers: true,
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



                        <div className={`p-4 rounded-xl border transition-all duration-300 ${form.getFieldValue("deactivateOthers") ? "border-amber-400/60 bg-amber-50/40 dark:bg-amber-950/20" : "border-dashed bg-muted/40 hover:bg-muted/60"}`}>
                            <form.Field
                                name="deactivateOthers"
                                children={(field) => (
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="space-y-1">
                                            <FieldLabel
                                                htmlFor={field.name}
                                                className="text-sm font-semibold flex items-center gap-2 cursor-pointer"
                                            >
                                                <AlertTriangle className={`w-4 h-4 transition-colors duration-200 ${field.state.value ? "text-amber-500" : "text-muted-foreground"}`} aria-hidden="true" />
                                                Deactivate other plans
                                            </FieldLabel>
                                            <FieldDescription
                                                id="deactivate-others-description"
                                                className={`text-[11px] font-medium transition-colors duration-200 ${field.state.value ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"}`}
                                            >
                                                {field.state.value
                                                    ? "All other active plans will be deactivated when this plan is created."
                                                    : "Other active plans will remain unchanged."}
                                            </FieldDescription>
                                        </div>
                                        <Switch
                                            id={field.name}
                                            checked={field.state.value}
                                            aria-label="Deactivate other plans when this plan is activated"
                                            aria-describedby="deactivate-others-description"
                                            onCheckedChange={(checked) => field.handleChange(checked)}
                                        />
                                    </div>
                                )}
                            />
                        </div>





                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <form.Field
                                name="subscriptionType"
                                children={(field) => (
                                    <Field className="flex flex-col gap-2">
                                        <FieldLabel htmlFor={field.name} className="text-sm font-medium text-foreground/80 flex items-center gap-2">
                                            <CreditCard className="w-4 h-4 text-muted-foreground" />
                                            Billing Cycle *
                                        </FieldLabel>
                                        <Select disabled={isPending} aria-describedby="cycle-readonly-message" value={field.state.value} onValueChange={(value: "monthly" | "yearly") => field.handleChange(value)}>
                                            <SelectTrigger className="h-10 bg-background shadow-sm transition-shadow focus-visible:ring-1">
                                                <SelectValue placeholder="Select cycle" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="monthly" className="cursor-pointer">Monthly</SelectItem>
                                                <SelectItem value="yearly" className="cursor-pointer">Yearly</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FieldDescription id="cycle-readonly-message" className="text-[10px] text-amber-600 font-medium">
                                            How often the user will be charged.
                                        </FieldDescription>
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
                                            aria-describedby="price-readonly-message"
                                            onChange={(e) => field.handleChange(parseFloat(e.target.value) || 0)}
                                            placeholder="0.00"
                                            className="h-10 bg-background shadow-sm transition-shadow focus-visible:ring-1"
                                        />

                                        <FieldDescription id="price-readonly-message" className="text-[10px] text-amber-600 font-medium">
                                            Enter price in Rupees. It will be stored as Paise.
                                        </FieldDescription>
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
