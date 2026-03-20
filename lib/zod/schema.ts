import z from "zod"

export const courseSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    slug: z.string().min(1, "Slug is required"),
    description: z.string().optional(),
    thumbnailImage: z.string().optional(),
    coverImage: z.string().optional(),
    hasPricing: z.boolean().default(false),
    price: z.number().optional(),
    discountedPrice: z.number().optional(),
    categoryId: z.string().min(1, "Category is required"),
    trainerId: z.string().min(1, "Trainer is required"),
    level: z.enum(["beginner", "intermediate", "advanced", "expert"]),
    duration: z.number().optional(),
    language: z.string().default("en"),
    hasCertificate: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
    demoVideoId: z.string().optional(),
})