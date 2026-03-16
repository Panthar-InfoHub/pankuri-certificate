"use client"

/**
 * CourseCombobox — search-powered course selector for the content wizard.
 *
 * CURRENT: fetches up to 20 active courses on open, client-side filters by title.
 *
 * TODO: once GET /courses supports a ?search= query param, replace the fetchCourses
 * call with:
 *   getAllCourses({ search: searchQuery, limit: 20, status: "active" })
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
import { getAllCourses } from "@/lib/backend_actions/course"
import { cn } from "@/lib/utils"
import { BookOpen, Check, ChevronsUpDown } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface CourseComboboxProps {
    value: string
    /** Called with (id, title) when a course is selected */
    onValueChange: (id: string, title: string) => void
    disabled?: boolean
}

export function CourseCombobox({ value, onValueChange, disabled }: CourseComboboxProps) {
    const [open, setOpen] = useState(false)
    const [courses, setCourses] = useState<any[]>([])
    const [search, setSearch] = useState("")
    const [loading, setLoading] = useState(false)

    const fetchCourses = async () => {
        setLoading(true)
        try {
            // TODO: pass search param once backend supports it
            const result = await getAllCourses({ limit: 20, status: "active" })
            if (result.success) {
                setCourses(result.data || [])
            } else {
                toast.error(result.error || "Failed to load courses")
                setCourses([])
            }
        } catch {
            toast.error("Failed to load courses")
            setCourses([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (open) fetchCourses()
    }, [open])

    // Client-side filter until backend search is ready
    const filtered = search.trim()
        ? courses.filter((c) => c.title?.toLowerCase().includes(search.toLowerCase()))
        : courses

    const selectedCourse = courses.find((c) => c.id === value)

    return (
        <Popover open={open} onOpenChange={setOpen} modal>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between h-10"
                    disabled={disabled}
                >
                    {selectedCourse ? (
                        <div className="flex items-center gap-2 truncate">
                            <BookOpen className="h-4 w-4 shrink-0 text-violet-500" />
                            <span className="truncate">{selectedCourse.title}</span>
                        </div>
                    ) : (
                        <span className="text-muted-foreground">Search and select a course...</span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder="Search courses..."
                        value={search}
                        onValueChange={setSearch}
                    />
                    <CommandList>
                        {loading ? (
                            <div className="py-6 text-center text-sm text-muted-foreground">Loading courses...</div>
                        ) : (
                            <>
                                <CommandEmpty>No courses found.</CommandEmpty>
                                <CommandGroup>
                                    {filtered.map((course) => (
                                        <CommandItem
                                            key={course.id}
                                            value={course.id}
                                            onSelect={() => {
                                                onValueChange(
                                                    course.id === value ? "" : course.id,
                                                    course.id === value ? "" : course.title,
                                                )
                                                setOpen(false)
                                            }}
                                        >
                                            <Check className={cn("mr-2 h-4 w-4", value === course.id ? "opacity-100" : "opacity-0")} />
                                            <span className="truncate font-medium">{course.title}</span>
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
