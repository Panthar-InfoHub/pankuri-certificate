import { LessonDetailTabs } from "@/components/lesson/lesson-detail-tabs"
import UploadAttachmentDialog from "@/components/lesson/upload-attachment-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { PageHeaderSkeleton } from "@/components/ui/skeleton-loader"
import { getLessonById } from "@/lib/backend_actions/lesson"
import {
    ArrowLeft,
    BookOpen,
    ChevronLeft,
    ChevronRight,
    Clock,
    FileText,
    GraduationCap,
    Hash,
    Lock,
    Paperclip,
    Unlock,
    Upload,
    Video,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"

function formatDuration(seconds: number | null | undefined) {
    if (!seconds) return null
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    if (h > 0) return `${h}h ${m}m`
    if (m > 0) return `${m}m ${s}s`
    return `${s}s`
}

async function LessonDetailContent({ lessonId }: { lessonId: string }) {
    const result = await getLessonById(lessonId)

    if (!result.success || !result.data) {
        notFound()
    }

    const lesson = result.data
    const isVideo = lesson.type === "video"
    const video = lesson.videoLesson?.video
    const duration = isVideo ? formatDuration(video?.duration) : lesson.textLesson?.estimatedReadTime ? `${lesson.textLesson.estimatedReadTime} min read` : null
    const nav = lesson.navigation || {}
    const attachmentCount = lesson.lessonAttachments?.length || 0

    return (
        <>
            {/* Breadcrumb + Navigation */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Link href="/lesson" className="hover:text-foreground transition-colors">
                        Lessons
                    </Link>
                    {lesson.course && (
                        <>
                            <span>/</span>
                            <Link href={`/course/${lesson.course.id}`} className="hover:text-foreground transition-colors">
                                {lesson.course.title}
                            </Link>
                        </>
                    )}
                    <span>/</span>
                    <span className="text-foreground font-medium truncate max-w-[200px]">{lesson.title}</span>
                </div>

                <div className="flex items-center gap-2">
                    {nav.previous && (
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/lesson/${nav.previous.id}`}>
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                Prev
                            </Link>
                        </Button>
                    )}
                    {nav.next && (
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/lesson/${nav.next.id}`}>
                                Next
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Link>
                        </Button>
                    )}
                </div>
            </div>

            {/* Hero Section */}
            <div className="mb-10">
                {/* Lesson type icon + title */}
                <div className="flex items-start gap-5 mb-5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${isVideo ? "bg-blue-500/10" : "bg-emerald-500/10"}`}>
                        {isVideo ? (
                            <Video className={`h-7 w-7 ${isVideo ? "text-blue-600" : "text-emerald-600"}`} />
                        ) : (
                            <FileText className="h-7 w-7 text-emerald-600" />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-3xl font-bold tracking-tight mb-3">{lesson.title}</h1>

                        {/* Badges */}
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge
                                variant={lesson.status === "published" ? "default" : "secondary"}
                                className="text-xs capitalize"
                            >
                                {lesson.status}
                            </Badge>
                            <Badge variant="outline" className="text-xs gap-1">
                                {isVideo ? <Video className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
                                {isVideo ? "Video" : "Text"}
                            </Badge>
                            {lesson.isFree ? (
                                <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-700 border-green-500/20 gap-1">
                                    <Unlock className="h-3 w-3" />
                                    Free
                                </Badge>
                            ) : (
                                <Badge variant="secondary" className="text-xs gap-1">
                                    <Lock className="h-3 w-3" />
                                    Premium
                                </Badge>
                            )}
                            {lesson.isMandatory && (
                                <Badge variant="outline" className="text-xs gap-1">
                                    <GraduationCap className="h-3 w-3" />
                                    Mandatory
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats row */}
                <div className="flex items-center gap-6 text-sm text-muted-foreground mt-4">
                    <span className="flex items-center gap-1.5">
                        <Hash className="h-3.5 w-3.5" />
                        Sequence {lesson.sequence}
                    </span>
                    {duration && (
                        <span className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            {duration}
                        </span>
                    )}
                    {attachmentCount > 0 && (
                        <span className="flex items-center gap-1.5">
                            <Paperclip className="h-3.5 w-3.5" />
                            {attachmentCount} attachment{attachmentCount > 1 ? "s" : ""}
                        </span>
                    )}
                    {lesson.course && (
                        <Link href={`/course/${lesson.course.id}`} className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                            <BookOpen className="h-3.5 w-3.5" />
                            {lesson.course.title}
                        </Link>
                    )}
                </div>

                <Separator className="mt-8" />
            </div>

            {/* Tabs */}
            <LessonDetailTabs lesson={lesson} />
        </>
    )
}

export default async function LessonDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    return (
        <div className="container mx-auto max-w-6xl px-6 py-24">
            <Suspense fallback={<PageHeaderSkeleton />}>
                <LessonDetailContent lessonId={id} />
            </Suspense>
        </div>
    )
}
