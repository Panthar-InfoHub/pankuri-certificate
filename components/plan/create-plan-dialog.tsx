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
import { getAllCourses } from "@/lib/backend_actions/course"
import { getFlatCategories } from "@/lib/backend_actions/category"
import { useEffect, useState } from "react"
import { createPlan } from "@/lib/backend_actions/plans"
import { Switch } from "../ui/switch"

const planSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    slug: z.string().min(1, "Slug is required"),
    description: z.string().optional(),
    subscriptionType: z.enum(["monthly", "yearly"]),
    planType: z.enum(["WHOLE_APP", "CATEGORY", "COURSE"]),
    price: z.number().min(0, "Price must be positive"),
    currency: z.literal("INR"),
    deactivateOthers: z.boolean().optional(),
    targetId: z.string().optional(),
    hasTrial: z.boolean().optional(),
    trialDays: z.number().min(0).optional(),
    trialFee: z.number().min(0).optional(),
}).refine(data => {
    if (data.planType !== "WHOLE_APP" && (!data.targetId || data.targetId.trim() === "")) {
        return false;
    }
    return true;
}, {
    message: "Target is required for this plan type",
    path: ["targetId"]
})

export function CreatePlanDialog({ children, initialPlanType = "WHOLE_APP" }: { children: React.ReactNode, initialPlanType?: "WHOLE_APP" | "CATEGORY" | "COURSE" }) {
    const [isPending, startTransition] = useTransition()
    const router = useRouter()
    const [targets, setTargets] = useState<{ id: string, name: string }[]>([])
    const [loadingTargets, setLoadingTargets] = useState(false)
    const [open, setOpen] = useState(false)
    const [isConfirmOpen, setConfirmOpen] = useState(false)
    const [payloadValue, setPayloadValue] = useState<any>(null)

    const form = useForm({
        defaultValues: {
            name: "",
            slug: "",
            description: "",
            subscriptionType: "monthly",
            planType: initialPlanType,
            price: 0,
            currency: "INR",
            deactivateOthers: true,
            targetId: "",
            hasTrial: false,
            trialDays: 0,
            trialFee: 0,
        } as z.infer<typeof planSchema>,
        validators: {
            onSubmit: planSchema,
        },
        onSubmit: async ({ value }) => {
            setPayloadValue(value)
            setConfirmOpen(true)
        },
    })

    const handleConfirmCreate = async () => {
        if (!payloadValue) return;
        setConfirmOpen(false);

        startTransition(async () => {
            try {
                const payload: any = {
                    ...payloadValue,
                    price: Math.round(payloadValue.price * 100), // Convert to paise
                }

                if (payloadValue.hasTrial) {
                    payload.trialDays = Number(payloadValue.trialDays || 0);
                    payload.trialFee = Math.round((payloadValue.trialFee || 0) * 100);
                } else {
                    payload.trialDays = 0;
                    payload.trialFee = 0;
                }

                delete payload.hasTrial; // Remove UI helper before submitting

                const result = await createPlan(payload)

                if (result.success) {
                    toast.success("Plan created successfully")
                    setOpen(false)
                    form.reset()
                    router.refresh()
                } else {
                    toast.warning(result.error || "Failed to create plan")
                }
            } catch (error: any) {
                toast.error(error.message || "An unexpected error occurred")
            }
        })
    };

    useEffect(() => {
        if (!open) {
            form.reset()
        }
    }, [open, form])
    const handleTitleChange = (value: string) => {
        const slug = value
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
            .trim()
        form.setFieldValue("slug", slug)
    }

    const [currentPlanType, setCurrentPlanType] = useState(initialPlanType)

    useEffect(() => {
        const fetchTargets = async () => {
            if (currentPlanType === "WHOLE_APP") {
                setTargets([])
                form.setFieldValue("targetId", "")
                return
            }

            setLoadingTargets(true)
            try {
                if (currentPlanType === "CATEGORY") {
                    const result = await getFlatCategories({ limit: 100 })
                    if (result.success) {
                        setTargets(result.data.data.map((cat: any) => ({ id: cat.id, name: cat.name })))
                    }
                } else if (currentPlanType === "COURSE") {
                    const result = await getAllCourses({ limit: 100 })
                    if (result.success) {
                        setTargets(result.data.map((course: any) => ({ id: course.id, name: course.title })))
                    }
                }
            } catch (err) {
                console.error("Failed to load targets", err)
            } finally {
                setLoadingTargets(false)
            }
        }

        fetchTargets()
    }, [currentPlanType])

    return (
        <Dialog open={open} onOpenChange={setOpen}>
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
                                        <FieldLabel htmlFor="create-plan-price" className="text-sm font-medium text-foreground/80 flex items-center gap-2">
                                            <Banknote className="w-4 h-4 text-muted-foreground" />
                                            Amount (₹) *
                                        </FieldLabel>
                                        <Input
                                            id="create-plan-price"
                                            value={field.state.value}
                                            disabled={isPending}
                                            type="number"
                                            min="0"
                                            aria-describedby="price-readonly-message"
                                            onChange={(e) => {
                                                console.log("[CreatePlan] Input Price:", e.target.value);
                                                field.handleChange(parseFloat(e.target.value) || 0);
                                            }}
                                            placeholder="0.00"
                                            className="h-10 bg-background shadow-sm transition-shadow focus-visible:ring-1"
                                        />

                                        <FieldDescription id="price-readonly-message" className="text-[10px] text-amber-600 font-medium">
                                            Enter price in Rupees.
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
                                            Plan Type *
                                        </FieldLabel>
                                        <Select
                                            disabled={isPending}
                                            value={field.state.value}
                                            onValueChange={(value: "WHOLE_APP" | "CATEGORY" | "COURSE") => {
                                                field.handleChange(value)
                                                setCurrentPlanType(value)
                                            }}
                                        >
                                            <SelectTrigger className="h-10 bg-background shadow-sm transition-shadow focus-visible:ring-1">
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="WHOLE_APP">Whole App</SelectItem>
                                                <SelectItem value="CATEGORY">Category</SelectItem>
                                                <SelectItem value="COURSE">Course</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {field.state.meta.errors.length > 0 && <FieldError errors={field.state.meta.errors} />}
                                    </Field>
                                )}
                            />

                            {currentPlanType !== "WHOLE_APP" && (
                                <form.Field
                                    name="targetId"
                                    children={(field) => (
                                        <Field className="flex flex-col gap-2">
                                            <FieldLabel className="text-sm font-medium text-foreground/80">
                                                Select {currentPlanType === "CATEGORY" ? "Category" : "Course"} *
                                            </FieldLabel>
                                            <Select
                                                disabled={isPending || loadingTargets}
                                                value={field.state.value}
                                                onValueChange={(value) => field.handleChange(value)}
                                            >
                                                <SelectTrigger className="h-10 bg-background shadow-sm transition-shadow focus-visible:ring-1">
                                                    <SelectValue placeholder={`Select ${currentPlanType.toLowerCase()}`} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {loadingTargets ? (
                                                        <div className="flex items-center justify-center p-2 text-xs text-muted-foreground">
                                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Fetching...
                                                        </div>
                                                    ) : targets.length === 0 ? (
                                                        <div className="p-2 text-xs text-muted-foreground">No targets found.</div>
                                                    ) : (
                                                        targets.map((t) => (
                                                            <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                                        ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            {field.state.meta.errors.length > 0 && <FieldError errors={field.state.meta.errors} />}
                                        </Field>
                                    )}
                                />
                            )}

                            <form.Field
                                name="currency"
                                children={(field) => (
                                    <Field className="flex flex-col gap-2">
                                        <FieldLabel className="text-sm font-medium text-foreground/80">
                                            Currency
                                        </FieldLabel>
                                        <Input
                                            value={field.state.value}
                                            readOnly
                                            className="bg-muted"
                                        />
                                    </Field>
                                )}
                            />
                        </div>

                        {/* Trial Setup Layout row */}
                        <div className="p-4 rounded-xl border border-dashed bg-muted/40 hover:bg-muted/60 transition-all duration-300">
                            <form.Field
                                name="hasTrial"
                                children={(field) => (
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="space-y-1">
                                            <FieldLabel htmlFor={field.name} className="text-sm font-semibold flex items-center gap-2 cursor-pointer">
                                                Enable Free Trial Period
                                            </FieldLabel>
                                            <FieldDescription className="text-[11px] font-medium">
                                                Check to add a trial phase before charging subscription triggers.
                                            </FieldDescription>
                                        </div>
                                        <Switch
                                            id={field.name}
                                            checked={field.state.value}
                                            onCheckedChange={(checked) => field.handleChange(checked)}
                                        />
                                    </div>
                                )}
                            />

                            <form.Subscribe selector={(state) => state.values.hasTrial}
                                children={(hasTrial) => (
                                    hasTrial ? (
                                        <div className="mt-4 pt-4 border-t border-dashed grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-200">
                                            <form.Field
                                                name="trialDays"
                                                children={(field) => (
                                                    <Field className="flex flex-col gap-1">
                                                        <FieldLabel className="text-xs font-medium">Trial Duration (Days) *</FieldLabel>
                                                        <Input
                                                            type="number"
                                                            min="1"
                                                            disabled={isPending}
                                                            value={field.state.value}
                                                            onChange={(e) => field.handleChange(Number(e.target.value))}
                                                            placeholder="7"
                                                            className="h-9"
                                                        />
                                                        {field.state.meta.errors.length > 0 && <FieldError errors={field.state.meta.errors} />}
                                                    </Field>
                                                )}
                                            />
                                            <form.Field
                                                name="trialFee"
                                                children={(field) => (
                                                    <Field className="flex flex-col gap-1">
                                                        <FieldLabel className="text-xs font-medium">Trial Fee (₹ - Optional)</FieldLabel>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            disabled={isPending}
                                                            value={field.state.value}
                                                            onChange={(e) => field.handleChange(Number(e.target.value))}
                                                            placeholder="0"
                                                            className="h-9"
                                                        />
                                                        {field.state.meta.errors.length > 0 && <FieldError errors={field.state.meta.errors} />}
                                                    </Field>
                                                )}
                                            />
                                        </div>
                                    ) : null
                                )}
                            />
                        </div>


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
                                                    ? "An existing active plan of the same category/course and billing cycle will be deactivated."
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
                <Dialog open={isConfirmOpen} onOpenChange={setConfirmOpen}>
                    <DialogContent className="sm:max-w-[425px] z-[5000]">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-amber-500" />
                                Confirm Plan Creation
                            </DialogTitle>
                            <DialogDescription className="space-y-3 pt-2">
                                <div>
                                    Are you sure you want to create an active plan for <strong>₹{payloadValue?.price}</strong>?
                                </div>
                                <div className="text-[12px] p-3 rounded-lg bg-muted text-muted-foreground border">
                                    This will sync to your payment gateway as a live operational template.
                                </div>
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex gap-2 sm:gap-0 mt-4">
                            <Button variant="outline" type="button" onClick={() => setConfirmOpen(false)} className="flex-1">Cancel</Button>
                            <Button variant="gradient" onClick={handleConfirmCreate} className="flex-1">
                                Confirm & Create
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </DialogContent>
        </Dialog>
    )
}
