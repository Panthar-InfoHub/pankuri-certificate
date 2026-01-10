"use client"

import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import MDEditor from "@uiw/react-md-editor"
import { Plus, Trash2 } from "lucide-react"
import { useState } from "react"


export function VideoDescriptionSection({ value, onChange, disabled }) {
    const [imagePreviewUrls, setImagePreviewUrls] = useState({})

    // Initialize default structure if empty
    const descriptionData = value || {
        disclaimer: "",
        products: [],
        timestamps: [],
        description: ""
    }

    const updateField = (field, fieldValue) => {
        onChange({
            ...descriptionData,
            [field]: fieldValue
        })
    }

    // Product handlers
    const addProduct = () => {
        const newProducts = [...(descriptionData.products || []), { name: "", url: "", image: null }]
        updateField("products", newProducts)
    }

    const removeProduct = (index) => {
        const newProducts = descriptionData.products.filter((_, i) => i !== index)
        updateField("products", newProducts)

        // Clean up preview URL
        const newPreviews = { ...imagePreviewUrls }
        if (newPreviews[index]) {
            URL.revokeObjectURL(newPreviews[index])
            delete newPreviews[index]
        }
        setImagePreviewUrls(newPreviews)
    }

    const updateProduct = (index, field, value) => {
        const newProducts = [...descriptionData.products]
        newProducts[index] = { ...newProducts[index], [field]: value }
        updateField("products", newProducts)
    }

    const handleProductImageSelect = (index, file) => {
        if (!file) return

        // Create preview URL
        const previewUrl = URL.createObjectURL(file)
        setImagePreviewUrls(prev => ({ ...prev, [index]: previewUrl }))

        // Store the file object
        updateProduct(index, "image", file)
    }

    // Timestamp handlers
    const addTimestamp = () => {
        const newTimestamps = [...(descriptionData.timestamps || []), { time_interval: "", time_content: "" }]
        updateField("timestamps", newTimestamps)
    }

    const removeTimestamp = (index) => {
        const newTimestamps = descriptionData.timestamps.filter((_, i) => i !== index)
        updateField("timestamps", newTimestamps)
    }

    const updateTimestamp = (index, field, value) => {
        const newTimestamps = [...descriptionData.timestamps]
        newTimestamps[index] = { ...newTimestamps[index], [field]: value }
        updateField("timestamps", newTimestamps)
    }

    return (
        <div className="space-y-6">
            {/* Disclaimer Section */}
            <Field className="space-y-2 px-2" data-color-mode="light">
                <div className="flex items-center gap-2">
                    <div className="w-1 h-5 bg-orange-500 rounded-full"></div>
                    <FieldLabel htmlFor="disclaimer">Disclaimer</FieldLabel>
                </div>
                <MDEditor
                    value={descriptionData.disclaimer || ""}
                    onChange={(val) => updateField("disclaimer", val || "")}
                    textareaProps={{
                        placeholder: "Add any disclaimers for this video...",
                        disabled: disabled
                    }}
                    preview="edit"
                    height={150}
                    minHeight={100}
                />
                <p className="text-xs text-muted-foreground">
                    Add any legal disclaimers or important notices. Markdown supported.
                </p>
            </Field>

            {/* Products Section */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-1 h-5 bg-blue-500 rounded-full"></div>
                        <FieldLabel>Products Featured</FieldLabel>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addProduct}
                        disabled={disabled}
                    >
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                    </Button>
                </div>

                {descriptionData.products?.length > 0 && (
                    <div className="space-y-2">
                        {descriptionData.products.map((product, index) => (
                            <div key={index} className="flex gap-2 p-3 border rounded-lg bg-muted/30">
                                <div className="flex-1 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                                    <Input
                                        value={product.name}
                                        onChange={(e) => updateProduct(index, "name", e.target.value)}
                                        placeholder="Product name"
                                        disabled={disabled}
                                    />
                                    <Input
                                        value={product.url}
                                        onChange={(e) => updateProduct(index, "url", e.target.value)}
                                        placeholder="URL"
                                        disabled={disabled}
                                    />
                                    <div className="flex gap-2 items-center">
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0]
                                                if (file) handleProductImageSelect(index, file)
                                            }}
                                            disabled={disabled}
                                            className="cursor-pointer w-[120px]"
                                        />
                                        {(imagePreviewUrls[index] || (typeof product.image === 'string' && product.image)) && (
                                            <img
                                                src={imagePreviewUrls[index] || product.image}
                                                alt={product.name || "Product"}
                                                className="h-8 w-8 object-cover rounded border"
                                            />
                                        )}
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeProduct(index)}
                                    disabled={disabled}
                                    className="shrink-0"
                                >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Timestamps Section */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-1 h-5 bg-green-500 rounded-full"></div>
                        <FieldLabel>Video Timestamps</FieldLabel>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addTimestamp}
                        disabled={disabled}
                    >
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                    </Button>
                </div>

                {descriptionData.timestamps?.length > 0 && (
                    <div className="space-y-2">
                        {descriptionData.timestamps.map((timestamp, index) => (
                            <div key={index} className="flex gap-2 p-3 border rounded-lg bg-muted/30">
                                <Input
                                    value={timestamp.time_interval}
                                    onChange={(e) => updateTimestamp(index, "time_interval", e.target.value)}
                                    placeholder="00:00"
                                    pattern="\d{2}:\d{2}"
                                    disabled={disabled}
                                    className="w-24 font-mono"
                                />
                                <Input
                                    value={timestamp.time_content}
                                    onChange={(e) => updateTimestamp(index, "time_content", e.target.value)}
                                    placeholder="What happens at this time"
                                    disabled={disabled}
                                    className="flex-1"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeTimestamp(index)}
                                    disabled={disabled}
                                    className="shrink-0"
                                >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Description Section */}
            <Field className="space-y-2 px-2" data-color-mode="light">
                <div className="flex items-center gap-2">
                    <div className="w-1 h-5 bg-purple-500 rounded-full"></div>
                    <FieldLabel htmlFor="description">Video Description</FieldLabel>
                </div>
                <MDEditor
                    value={descriptionData.description || ""}
                    onChange={(val) => updateField("description", val || "")}
                    textareaProps={{
                        placeholder: `# About This Video\n\nDetailed description of what viewers will learn...\n\n## Key Takeaways\n- Point 1\n- Point 2\n\n**Additional Notes:**\nAny extra information...`,
                        disabled: disabled
                    }}
                    preview="edit"
                    height={300}
                    minHeight={200}
                />
                <p className="text-xs text-muted-foreground">
                    Add a comprehensive description of your video. Markdown supported.
                </p>
            </Field>
        </div>
    )
}
