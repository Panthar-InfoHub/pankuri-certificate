"use client"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useForm } from "@tanstack/react-form"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "sonner"
import z from "zod"
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, X, CircleDollarSign, CreditCard } from "lucide-react"
import { createCategory } from "@/lib/backend_actions/category"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { generatePresignedUrlForImage } from "@/lib/action"
import axios from "axios"
import { Switch } from "../ui/switch"

const categorySchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    description: z.string(),
    slug: z.string().min(1, "Slug is required"),
    icon: z.string(),
    parentId: z.string(),
    hasPricing: z.boolean().default(false),
    monthlyPrice: z.number().optional(),
    monthlyDiscountedPrice: z.number().optional(),
    yearlyPrice: z.number().optional(),
    yearlyDiscountedPrice: z.number().optional(),
    sequence: z.number().int().nonnegative(),
})

export function CreateCategoryDialog({
    children,
    parentCategories,
}) {
    const [isPending, startTransition] = useTransition()
    const router = useRouter()
    const [imagePreview, setImagePreview] = useState("")
    const [imageFile, setImageFile] = useState(null)
    const [selectedParent, setSelectedParent] = useState(null)

    const form = useForm({
        defaultValues: {
            name: "",
            description: "",
            slug: "",
            icon: "",
            parentId: "",
            hasPricing: false,
            monthlyPrice: 0,
            monthlyDiscountedPrice: 0,
            yearlyPrice: 0,
            yearlyDiscountedPrice: 0,
            sequence: 1,
        },
        validators: {
            onSubmit: categorySchema,
        },
        onSubmit: async ({ value }) => {
            startTransition(async () => {
                try {
                    let iconUrl = value.icon

                    // Upload icon if file is selected
                    if (imageFile) {
                        toast.info("Uploading icon...")
                        const bucketName = "pankhuri-v3"
                        const iconKey = `${process.env.NEXT_PUBLIC_BUCKET_MODE}/category-icons/${Date.now()}_${imageFile.name}`

                        const { url } = await generatePresignedUrlForImage(bucketName, iconKey, imageFile.type)

                        await axios.put(url, imageFile, {
                            headers: {
                                'Content-Type': imageFile.type,
                                'x-amz-acl': 'public-read'
                            },
                        })

                        iconUrl = `https://${bucketName}.blr1.digitaloceanspaces.com/${iconKey}`
                        toast.success("Icon uploaded successfully")
                    }

                    // Prepare pricing data
                    const pricingData = []
                    if (value.hasPricing) {
                        if (value.monthlyPrice > 0) {
                            pricingData.push({
                                type: "monthly",
                                price: value.monthlyPrice * 100,
                                discountedPrice: value.monthlyDiscountedPrice * 100,
                            })
                        }
                        if (value.yearlyPrice > 0) {
                            pricingData.push({
                                type: "yearly",
                                price: value.yearlyPrice * 100,
                                discountedPrice: value.yearlyDiscountedPrice * 100,
                            })
                        }
                    }

                    // Create category with uploaded icon URL
                    const result = await createCategory({
                        name: value.name,
                        description: value.description,
                        slug: value.slug,
                        icon: iconUrl,
                        parentId: value.parentId,
                        sequence: value.sequence,
                        pricing: pricingData,
                    })

                    if (result.success) {
                        toast.success("Category created successfully")
                        form.reset()
                        setImagePreview("")
                        setImageFile(null)
                        router.refresh()
                    } else {
                        toast.warning(result.error || "Failed to create category")
                    }
                } catch (error) {
                    toast.error((error).message || "An unexpected error occurred")
                }
            })
        },
    })

    const handleImageChange = (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        setImageFile(file)

        // Create preview
        const reader = new FileReader()
        reader.onloadend = () => {
            setImagePreview(reader.result)
        }
        reader.readAsDataURL(file)
    }

    const handleParentChange = (value) => {
        if (value === "root") {
            setSelectedParent(null)
            form.setFieldValue("parentId", "")
            form.setFieldValue("sequence", 1)
        } else {
            const parent = parentCategories.find(cat => cat.id === value)
            setSelectedParent(parent)
            form.setFieldValue("parentId", value)
            form.setFieldValue("sequence", (parent?.sequence || 0) + 1)
        }
    }

    const handleRemoveImage = () => {
        setImageFile(null)
        setImagePreview("")
        form.setFieldValue("icon", "")
        // // Reset file input
        // const fileInput = document.getElementById("icon")
        // if (fileInput) fileInput.value = ""
    }

    const handleTitleChange = (value) => {
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
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[720px]">
                <DialogHeader>
                    <DialogTitle>Create New Category</DialogTitle>
                    <DialogDescription>Add a new category to your system</DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-[600px] w-full">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            form.handleSubmit()
                        }}
                        className="space-y-4 px-2"
                    >
                        <form.Field
                            name="name"
                            children={(field) => (
                                <Field>
                                    <FieldLabel htmlFor="name" className="text-sm font-medium">
                                        Category Name *
                                    </FieldLabel>
                                    <Input
                                        id="name"
                                        placeholder="Enter category name"
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
                                        placeholder="category-slug"
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
                                        placeholder="Enter category description"
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


                        <div className="p-4 rounded-xl border border-dashed bg-muted/40 transition-all duration-300 hover:bg-muted/60">
                            <form.Field
                                name="hasPricing"
                                children={(field) => (
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="space-y-0.5">
                                            <FieldLabel htmlFor={field.name} className="text-base font-semibold flex items-center gap-2">
                                                Category Specific Pricing
                                            </FieldLabel>
                                            <FieldDescription>
                                                Enable if this category requires a separate subscription or purchase.
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


                            <form.Subscribe selector={(state) => state.values.hasPricing}
                                children={(hasPricing) => (
                                    hasPricing ? (
                                        <div className="mt-6 pt-6 border-t border-dashed grid gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
                                            {/* Monthly Pricing */}
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-2">
                                                    <CreditCard className="w-4 h-4 text-muted-foreground" />
                                                    <h4 className="text-sm font-semibold">Monthly Subscription</h4>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <form.Field
                                                        name="monthlyPrice"
                                                        children={(field) => (
                                                            <Field className="flex flex-col gap-2">
                                                                <FieldLabel htmlFor={field.name} className="text-sm font-medium text-foreground/80">
                                                                    Base Price (₹)
                                                                </FieldLabel>
                                                                <Input
                                                                    id={field.name}
                                                                    value={field.state.value}
                                                                    disabled={isPending}
                                                                    type="number"
                                                                    min="0"
                                                                    onChange={(e) => field.handleChange(parseInt(e.target.value) || 0)}
                                                                    placeholder="0"
                                                                    className="h-10 bg-background shadow-sm transition-shadow focus-visible:ring-1"
                                                                />
                                                                <FieldDescription className="text-[10px]">
                                                                    Original monthly price
                                                                </FieldDescription>
                                                                {field.state.meta.errors.length > 0 && <FieldError errors={field.state.meta.errors} />}
                                                            </Field>
                                                        )}
                                                    />

                                                    <form.Field
                                                        name="monthlyDiscountedPrice"
                                                        children={(field) => (
                                                            <Field className="flex flex-col gap-2">
                                                                <FieldLabel htmlFor={field.name} className="text-sm font-medium text-foreground/80">
                                                                    Discounted Price (₹)
                                                                </FieldLabel>
                                                                <Input
                                                                    id={field.name}
                                                                    type="number"
                                                                    min="0"
                                                                    value={field.state.value}
                                                                    onChange={(e) => field.handleChange(parseInt(e.target.value) || 0)}
                                                                    placeholder="0"
                                                                    className="h-10 bg-background shadow-sm transition-shadow focus-visible:ring-1"
                                                                />
                                                                <FieldDescription className="text-[10px]">
                                                                    Final monthly price
                                                                </FieldDescription>
                                                                {field.state.meta.errors.length > 0 && <FieldError errors={field.state.meta.errors} />}
                                                            </Field>
                                                        )}
                                                    />
                                                </div>
                                            </div>

                                            {/* Yearly Pricing */}
                                            <div className="space-y-4 pt-4 border-t border-dashed">
                                                <div className="flex items-center gap-2">
                                                    <CreditCard className="w-4 h-4 text-muted-foreground" />
                                                    <h4 className="text-sm font-semibold">Yearly Subscription</h4>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <form.Field
                                                        name="yearlyPrice"
                                                        children={(field) => (
                                                            <Field className="flex flex-col gap-2">
                                                                <FieldLabel htmlFor={field.name} className="text-sm font-medium text-foreground/80">
                                                                    Base Price (₹)
                                                                </FieldLabel>
                                                                <Input
                                                                    id={field.name}
                                                                    value={field.state.value}
                                                                    disabled={isPending}
                                                                    type="number"
                                                                    min="0"
                                                                    onChange={(e) => field.handleChange(parseInt(e.target.value) || 0)}
                                                                    placeholder="0"
                                                                    className="h-10 bg-background shadow-sm transition-shadow focus-visible:ring-1"
                                                                />
                                                                <FieldDescription className="text-[10px]">
                                                                    Original yearly price
                                                                </FieldDescription>
                                                                {field.state.meta.errors.length > 0 && <FieldError errors={field.state.meta.errors} />}
                                                            </Field>
                                                        )}
                                                    />

                                                    <form.Field
                                                        name="yearlyDiscountedPrice"
                                                        children={(field) => (
                                                            <Field className="flex flex-col gap-2">
                                                                <FieldLabel htmlFor={field.name} className="text-sm font-medium text-foreground/80">
                                                                    Discounted Price (₹)
                                                                </FieldLabel>
                                                                <Input
                                                                    id={field.name}
                                                                    type="number"
                                                                    min="0"
                                                                    value={field.state.value}
                                                                    onChange={(e) => field.handleChange(parseInt(e.target.value) || 0)}
                                                                    placeholder="0"
                                                                    className="h-10 bg-background shadow-sm transition-shadow focus-visible:ring-1"
                                                                />
                                                                <FieldDescription className="text-[10px]">
                                                                    Final yearly price
                                                                </FieldDescription>
                                                                {field.state.meta.errors.length > 0 && <FieldError errors={field.state.meta.errors} />}
                                                            </Field>
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ) : null
                                )}
                            />
                        </div>

                        <form.Field
                            name="parentId"
                            children={(field) => (
                                <Field>
                                    <FieldLabel htmlFor="parentId" className="text-sm font-medium">
                                        Parent Category
                                    </FieldLabel>
                                    <Select
                                        disabled={isPending}
                                        value={field.state.value || "root"}
                                        onValueChange={handleParentChange}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select parent category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="root">None (Top-level category)</SelectItem>
                                            {parentCategories.map((cat) => (
                                                <SelectItem key={cat.id} value={cat.id}>
                                                    {cat.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {field.state.meta.errors.length > 0 && <FieldError errors={field.state.meta.errors} />}
                                </Field>
                            )}
                        />

                        <form.Field
                            name="sequence"
                            children={(field) => (
                                <Field>
                                    <FieldLabel htmlFor="sequence">Sequence (auto-calculated)</FieldLabel>
                                    <Input
                                        id="sequence"
                                        type="number"
                                        disabled={isPending}
                                        readOnly
                                        value={field.state.value}
                                        className="bg-muted"
                                    />
                                </Field>
                            )}
                        />


                        <form.Field
                            name="icon"
                            children={(field) => (
                                <Field>
                                    <FieldLabel htmlFor="icon" className="text-sm font-medium">
                                        Icon/Image
                                    </FieldLabel>
                                    <Input
                                        id="icon"
                                        type="file"
                                        accept="image/*"
                                        disabled={isPending}
                                        onChange={handleImageChange}
                                        className="cursor-pointer"
                                    />
                                    {imageFile && (
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Selected: {imageFile.name}
                                        </p>
                                    )}
                                    {imagePreview && (
                                        <div className="relative w-full h-32 rounded-md overflow-hidden border border-input mt-2">
                                            <Image
                                                src={imagePreview}
                                                alt="Preview"
                                                fill
                                                className="object-cover"
                                            />
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                className="absolute top-2 right-2 h-6 w-6"
                                                onClick={handleRemoveImage}
                                                disabled={isPending}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Upload an icon image for the category (PNG, JPG, etc.)
                                    </p>
                                    {field.state.meta.errors.length > 0 && <FieldError errors={field.state.meta.errors} />}
                                </Field>
                            )}
                        />

                        <div className="flex gap-2 pt-4">
                            <DialogClose asChild>
                                <Button type="button" variant="outline" disabled={isPending} className="flex-1 bg-transparent">
                                    Cancel
                                </Button>
                            </DialogClose>

                            <Button type="submit" variant="gradient" disabled={isPending} className="flex-1">
                                {isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    "Create Category"
                                )}
                            </Button>
                        </div>
                    </form>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}
