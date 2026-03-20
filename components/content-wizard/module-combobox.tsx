"use client"

/**
 * ModuleCombobox — search-powered module selector scoped to a course.
 *
 * CURRENT: fetches up to 50 modules for the given courseId on open,
 * client-side filters by title.
 *
 * TODO: once GET /modules/course/:id supports a ?search= query param, replace
 * the fetchModules call with:
 *   getModulesByCourse(courseId, { search: searchQuery, limit: 30 })
 * and remove the client-side `.filter()` below.
 * Pattern to follow: components/course/video-combobox.jsx
 */

import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { getModulesByCourse } from "@/lib/backend_actions/module"
import { cn } from "@/lib/utils"
import { Check, ChevronsUpDown, LayoutList } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface ModuleComboboxProps {
    courseId: string
    value: string
    /** Called with (id, title) when a module is selected */
    onValueChange: (id: string, title: string) => void
    disabled?: boolean
}

export function ModuleCombobox({ courseId, value, onValueChange, disabled }: ModuleComboboxProps) {
    const [open, setOpen] = useState(false)
    const [modules, setModules] = useState<any[]>([])
    const [search, setSearch] = useState("")
    const [loading, setLoading] = useState(false)

    const fetchModules = async () => {
        if (!courseId) return
        setLoading(true)
        try {
            // TODO: pass search param once backend supports it
            const result = await getModulesByCourse(courseId, { limit: 50 })
            if (result.success) {
                setModules(result.data || [])
            } else {
                toast.error(result.error || "Failed to fetch modules")
                setModules([])
            }
        } catch {
            toast.error("Failed to load modules")
            setModules([])
        } finally {
            setLoading(false)
        }
    }

    // Re-fetch whenever courseId changes
    useEffect(() => {
        setModules([])
        setSearch("")
        if (courseId && open) fetchModules()
    }, [courseId])

    useEffect(() => {
        if (open && courseId) fetchModules()
    }, [open])

    // Client-side filter until backend search is ready
    const filtered = search.trim()
        ? modules.filter((m) => m.title?.toLowerCase().includes(search.toLowerCase()))
        : modules

    const selectedModule = modules.find((m) => m.id === value)

    return (
        <Popover open={open} onOpenChange={setOpen} modal>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between h-10"
                    disabled={disabled || !courseId}
                >
                    {!courseId ? (
                        <span className="text-muted-foreground">Select a course first</span>
                    ) : selectedModule ? (
                        <div className="flex items-center gap-2 truncate">
                            <LayoutList className="h-4 w-4 shrink-0 text-blue-500" />
                            <span className="truncate">{selectedModule.sequence}. {selectedModule.title}</span>
                        </div>
                    ) : (
                        <span className="text-muted-foreground">Search and select a module...</span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder="Search modules..."
                        value={search}
                        onValueChange={setSearch}
                    />
                    <CommandList>
                        {loading ? (
                            <div className="py-6 text-center text-sm text-muted-foreground">Loading modules...</div>
                        ) : (
                            <>
                                <CommandEmpty>No modules found.</CommandEmpty>
                                <CommandGroup>
                                    {filtered.map((module) => (
                                        <CommandItem
                                            key={module.id}
                                            value={module.id}
                                            onSelect={() => {
                                                onValueChange(
                                                    module.id === value ? "" : module.id,
                                                    module.id === value ? "" : module.title,
                                                )
                                                setOpen(false)
                                            }}
                                        >
                                            <Check className={cn("mr-2 h-4 w-4", value === module.id ? "opacity-100" : "opacity-0")} />
                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                <span className="text-xs font-mono text-muted-foreground shrink-0 w-5 text-right">
                                                    {module.sequence}.
                                                </span>
                                                <span className="truncate font-medium">{module.title}</span>
                                            </div>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
