"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { MoreHorizontal, Pencil, Trash2, BookOpen, Clock, FileText, Video, Lock, Unlock } from "lucide-react"
import { toast } from "sonner"
import { updateLessonStatus } from "@/lib/backend_actions/lesson"
import EditLessonDialog from "./edit-lesson-dialog"
import DeleteLessonDialog from "./delete-lesson-dialog"

const STATUS_BADGES = {
    draft: { variant: "secondary", label: "Draft" },
    published: { variant: "default", label: "Published" },
    archived: { variant: "outline", label: "Archived" },
}

const TYPE_BADGES = {
    video: { icon: Video, color: "text-violet-500" },
    text: { icon: FileText, color: "text-violet-500" },
}

export default function LessonsTable({ lessons, courses, modules = [], selectedCourseId, selectedModuleId }) {
    const router = useRouter()
    const [editingLesson, setEditingLesson] = useState(null)
    const [deletingLesson, setDeletingLesson] = useState(null)

    const handleStatusToggle = async (lessonId, currentStatus) => {
        const newStatus = currentStatus === "published" ? "draft" : "published"
        const result = await updateLessonStatus(lessonId, newStatus)

        if (result.success) {
            toast.success(`Lesson ${newStatus === "published" ? "published" : "unpublished"} successfully`)
            router.refresh()
        } else {
            toast.error(result.error || "Failed to update lesson status")
        }
    }

    const getCourseName = (courseId) => {
        const course = courses.find(c => c.id === courseId)
        return course?.title || "Unknown Course"
    }

    const getModuleName = (moduleId) => {
        const module = modules.find(m => m.id === moduleId)
        return module?.title || "No Module"
    }

    const handleCourseFilter = (value) => {
        const params = new URLSearchParams(window.location.search)
        if (value === "all") {
            params.delete("courseId")
            params.delete("moduleId")
        } else {
            params.set("courseId", value)
            params.delete("moduleId")
        }
        router.push(`/lesson?${params.toString()}`)
    }

    const handleModuleFilter = (value) => {
        const params = new URLSearchParams(window.location.search)
        if (value === "all") {
            params.delete("moduleId")
        } else {
            params.set("moduleId", value)
        }
        router.push(`/lesson?${params.toString()}`)
    }

    return (
        <>
            <Card className="mb-6">
                <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <label className="text-sm font-medium mb-2 block">Filter by Course</label>
                            <Select value={selectedCourseId || "all"} onValueChange={handleCourseFilter}>
                                <SelectTrigger className="w-[300px]">
                                    <SelectValue placeholder="Select a course" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Courses</SelectItem>
                                    {courses.map((course) => (
                                        <SelectItem key={course.id} value={course.id}>
                                            {course.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {selectedCourseId && modules.length > 0 && (
                            <div className="flex-1">
                                <label className="text-sm font-medium mb-2 block">Filter by Module</label>
                                <Select value={selectedModuleId || "all"} onValueChange={handleModuleFilter}>
                                    <SelectTrigger className="w-[300px]">
                                        <SelectValue placeholder="All Modules" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Modules</SelectItem>
                                        {modules.map((module) => (
                                            <SelectItem key={module.id} value={module.id}>
                                                {module.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div className="text-sm text-muted-foreground">
                            <strong>{lessons.length}</strong> lesson(s) found
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-4">
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[70px]">Seq</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Module</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {lessons.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-12">
                                        <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-30" />
                                        <p className="text-muted-foreground">
                                            {selectedCourseId
                                                ? "No lessons found for this course"
                                                : "No lessons found. Select a course to view lessons."}
                                        </p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                lessons.map((lesson) => {
                                    const TypeIcon = TYPE_BADGES[lesson.type]?.icon || FileText
                                    return (
                                        <TableRow key={lesson.id} className="group cursor-pointer">
                                            <TableCell onClick={() => router.push(`/lesson/${lesson.id}`)}>
                                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                                                    {lesson.sequence}
                                                </div>
                                            </TableCell>
                                            <TableCell onClick={() => router.push(`/lesson/${lesson.id}`)}>
                                                <div>
                                                    <p className="font-medium group-hover:text-primary transition-colors">
                                                        {lesson.title}
                                                    </p>
                                                    {lesson.description && (
                                                        <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                                                            {lesson.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell onClick={() => router.push(`/lesson/${lesson.id}`)}>
                                                <span className="text-sm">{lesson.moduleId ? getModuleName(lesson.moduleId) : "-"}</span>
                                            </TableCell>
                                            <TableCell onClick={() => router.push(`/lesson/${lesson.id}`)}>
                                                <div className="flex items-center gap-2">
                                                    <TypeIcon className={`h-4 w-4 ${TYPE_BADGES[lesson.type]?.color}`} />
                                                    <span className="text-sm capitalize">{lesson.type}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell onClick={() => router.push(`/lesson/${lesson.id}`)}>
                                                <Badge variant={STATUS_BADGES[lesson.status]?.variant}>
                                                    {STATUS_BADGES[lesson.status]?.label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem asChild>
                                                            <EditLessonDialog lesson={lesson} courses={courses}>
                                                                <Button variant="ghost" type="button" className="w-full justify-start p-0">
                                                                    <Pencil className="mr-2 h-4 w-4" />
                                                                    Edit
                                                                </Button>
                                                            </EditLessonDialog>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleStatusToggle(lesson.id, lesson.status)}>
                                                            {lesson.status === "published" ? "Unpublish" : "Publish"}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => setDeletingLesson(lesson)}
                                                            className="text-destructive focus:text-destructive"
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* {editingLesson && (
                <EditLessonDialog
                    lesson={editingLesson}
                    courses={courses}
                    open={!!editingLesson}
                    onOpenChange={(open) => !open && setEditingLesson(null)}
                />
            )} */}

            {deletingLesson && (
                <DeleteLessonDialog
                    lesson={deletingLesson}
                    open={!!deletingLesson}
                    onOpenChange={(open) => !open && setDeletingLesson(null)}
                />
            )}
        </>
    )
}
