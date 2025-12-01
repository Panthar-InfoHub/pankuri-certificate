import DeleteAttachmentDialog from "@/components/lesson/delete-attachment-dialog"
import DescriptionMarkdown from "@/components/lesson/description_markdown"
import LessonDescriptionDialog from "@/components/lesson/lesson-description-dialog"
import UploadAttachmentDialog from "@/components/lesson/upload-attachment-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeaderSkeleton } from "@/components/ui/skeleton-loader"
import { getLessonById } from "@/lib/backend_actions/lesson"
import MDEditor from "@uiw/react-md-editor"
import { ArrowLeft, Calendar, Clock, Download, Edit, FileIcon, FileText, GraduationCap, Lock, Trash2, Unlock, Upload, Video } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"

async function LessonDetailContent({ lessonId }: { lessonId: string }) {
    const result = await getLessonById(lessonId)

    if (!result.success || !result.data) {
        notFound()
    }

    const lesson = result.data

    const STATUS_CONFIG = {
        draft: { variant: "secondary" as const, color: "from-gray-500/5" },
        published: { variant: "default" as const, color: "from-green-500/5" },
        archived: { variant: "outline" as const, color: "from-red-500/5" },
    }

    const TYPE_CONFIG = {
        video: { icon: Video, color: "from-blue-500/5", label: "Video Lesson" },
        text: { icon: FileText, color: "from-green-500/5", label: "Text Lesson" },
    }

    const TypeIcon = TYPE_CONFIG[lesson.type]?.icon || FileText

    return (
        <>
            {/* Hero Section */}
            <div className="relative mb-12">
                <div className={`bg-linear-to-br ${STATUS_CONFIG[lesson.status].color} to-transparent p-8 rounded-2xl border-2 shadow-lg`}>
                    <Link href="/lesson">
                        <Button variant="gradient" size="sm" className="mb-6">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Lessons
                        </Button>
                    </Link>

                    <div className="flex items-start gap-6">
                        <div className={`flex items-center justify-center w-20 h-20 rounded-2xl bg-linear-to-br ${TYPE_CONFIG[lesson.type]?.color} to-transparent border-2 shadow-xl shrink-0`}>
                            <TypeIcon className="h-10 w-10 text-primary" />
                        </div>

                        <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                                <Badge variant={STATUS_CONFIG[lesson.status].variant} className="text-xs">
                                    {lesson.status}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                    <TypeIcon className="mr-1 h-3 w-3" />
                                    {TYPE_CONFIG[lesson.type]?.label}
                                </Badge>
                                {lesson.isFree ? (
                                    <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-700 border-green-500/20">
                                        <Unlock className="mr-1 h-3 w-3" />
                                        Free Preview
                                    </Badge>
                                ) : (
                                    <Badge variant="secondary" className="text-xs">
                                        <Lock className="mr-1 h-3 w-3" />
                                        Premium
                                    </Badge>
                                )}
                                {lesson.isMandatory && (
                                    <Badge variant="outline" className="text-xs">
                                        <GraduationCap className="mr-1 h-3 w-3" />
                                        Mandatory
                                    </Badge>
                                )}
                            </div>

                            <h1 className="text-5xl font-bold mb-4 text-gradient-brand">
                                {lesson.title}
                            </h1>

                            {lesson.description && (
                                <p className="text-xl text-muted-foreground max-w-3xl">
                                    {lesson.description}
                                </p>
                            )}

                            {/* Quick Stats Bar */}
                            <div className="flex flex-wrap items-center gap-6 mt-6 text-sm">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">Sequence #{lesson.sequence}</span>
                                </div>
                                {lesson.duration && (
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">{lesson.duration} min</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Video Content */}
                    {lesson.type === "video" && lesson.videoLesson && (
                        <Card className="border-2 shadow-lg p-0!">
                            <CardHeader className="bg-linear-to-br from-blue-500/5 to-transparent pt-4">
                                <CardTitle className="text-2xl flex items-center gap-2">
                                    <Video className="h-6 w-6" />
                                    Video Content
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="py-4">
                                {lesson.videoLesson.video && (
                                    <div className="space-y-4">
                                        {lesson.videoLesson.video.thumbnailUrl && (
                                            <div className="relative w-full h-[400px] rounded-lg overflow-hidden bg-muted">
                                                <Image
                                                    src={lesson.videoLesson.video.thumbnailUrl}
                                                    alt={lesson.videoLesson.video.title}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        )}
                                        <div>
                                            <h3 className="font-semibold text-lg">{lesson.videoLesson.video.title}</h3>
                                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                                <span>Status: {lesson.videoLesson.video.status}</span>
                                                {lesson.videoLesson.video.duration && (
                                                    <span>Duration: {Math.floor(lesson.videoLesson.video.duration / 60)} min</span>
                                                )}
                                                {lesson.videoLesson.video.metadata && typeof lesson.videoLesson.video.metadata === 'object' && 'resolution' in lesson.videoLesson.video.metadata && (
                                                    <span>Quality: {String(lesson.videoLesson.video.metadata.resolution)}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Text Content */}
                    {lesson.type === "text" && lesson.textLesson && (
                        <Card className="border-2 shadow-lg p-0!">
                            <CardHeader className="bg-linear-to-br from-green-500/5 to-transparent pt-4">
                                <CardTitle className="text-2xl flex items-center gap-2">
                                    <FileText className="h-6 w-6" />
                                    Text Content
                                </CardTitle>
                                {lesson.textLesson.estimatedReadTime && (
                                    <CardDescription>
                                        Estimated read time: {lesson.textLesson.estimatedReadTime} minutes
                                    </CardDescription>
                                )}
                            </CardHeader>
                            <CardContent className="py-6">
                                <div className="prose prose-sm max-w-none bg-muted" data-color-mode="light">
                                    <DescriptionMarkdown value={lesson.textLesson.content} />
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Lesson Description */}
                    <Card className="border-2 shadow-lg p-0!">
                        <CardHeader className="bg-linear-to-br from-purple-500/5 to-transparent pt-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-2xl">Lesson Description</CardTitle>
                                <LessonDescriptionDialog lesson={lesson}>
                                    <Button variant="gradient" size="sm">
                                        <Edit className="h-4 w-4 mr-2" />
                                        {lesson.lessonDescription ? "Edit" : "Add"} Description
                                    </Button>
                                </LessonDescriptionDialog>
                            </div>
                        </CardHeader>
                        {lesson.lessonDescription && (
                            <CardContent className="py-6">
                                <div className="prose prose-sm max-w-none">
                                    <DescriptionMarkdown value={lesson.lessonDescription.textContent} />
                                </div>
                            </CardContent>
                        )}
                        {!lesson.lessonDescription && (
                            <CardContent className="pt-6">
                                <p className="text-sm text-muted-foreground text-center py-8">
                                    No description added yet. Click &quot;Add Description&quot; to provide an overview of this lesson.
                                </p>
                            </CardContent>
                        )}
                    </Card>

                    {/* Attachments */}
                    <Card className="border-2 shadow-lg p-0!">
                        <CardHeader className="bg-linear-to-br from-orange-500/5 to-transparent pt-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-2xl flex items-center gap-2">
                                        <Download className="h-6 w-6" />
                                        Lesson Attachments
                                    </CardTitle>
                                    {lesson.lessonAttachments && lesson.lessonAttachments.length > 0 && (
                                        <CardDescription>
                                            {lesson.lessonAttachments.length} file(s) available
                                        </CardDescription>
                                    )}
                                </div>
                                <UploadAttachmentDialog lessonId={lesson.id}>
                                    <Button variant="outline" size="sm">
                                        <Upload className="h-4 w-4 mr-2" />
                                        Upload
                                    </Button>
                                </UploadAttachmentDialog>
                            </div>
                        </CardHeader>
                        <CardContent className="py-4">
                            {lesson.lessonAttachments && lesson.lessonAttachments.length > 0 ? (
                                <div className="space-y-3">
                                    {lesson.lessonAttachments.map((attachment) => (
                                        <div
                                            key={attachment.id}
                                            className="flex items-center justify-between p-4 border-2 rounded-lg hover:border-primary/50 transition-colors"
                                        >
                                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                                    <FileIcon className="h-6 w-6 text-primary" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold truncate">{attachment.title}</p>
                                                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                                        <span className="truncate">{attachment.fileName}</span>
                                                        <span>•</span>
                                                        <span>{(attachment.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                                                        <span>•</span>
                                                        <span className="uppercase">{attachment.type}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <Button variant="outline" size="sm" asChild>
                                                    <a href={attachment.fileUrl} target="_blank" rel="noopener noreferrer">
                                                        <Download className="h-4 w-4 mr-2" />
                                                        Download
                                                    </a>
                                                </Button>
                                                <DeleteAttachmentDialog attachment={attachment}>
                                                    <Button variant="ghost" size="sm">
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </DeleteAttachmentDialog>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-8">
                                    No attachments yet. Click &quot;Upload&quot; to add supplementary materials.
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Metadata */}
                    {lesson.metadata && (
                        <Card className="border-2 shadow-lg">
                            <CardHeader className="bg-linear-to-br from-pink-500/5 to-transparent">
                                <CardTitle className="text-2xl">Additional Information</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <pre className="text-sm bg-muted p-4 rounded-lg overflow-auto">
                                    {JSON.stringify(lesson.metadata, null, 2)}
                                </pre>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6 lg:sticky lg:top-24 lg:h-fit">
                    {/* Course Card */}
                    {lesson.course && (
                        <Card className="border-2 shadow-xl overflow-hidden p-0!">
                            <div className="bg-linear-to-br from-blue-500/10 via-purple-500/10 to-transparent px-4 py-2 ">
                                <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground mb-4">
                                    Part of Course
                                </CardTitle>
                                <Link href={`/course/${lesson.course.id}`}>
                                    <div className="flex items-start gap-4 group cursor-pointer">
                                        {lesson.course.thumbnailImage && (
                                            <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-background shadow-lg group-hover:scale-105 transition-transform">
                                                <Image
                                                    src={lesson.course.thumbnailImage}
                                                    alt={lesson.course.title}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <p className="font-bold text-lg group-hover:text-primary transition-colors">
                                                {lesson.course.title}
                                            </p>
                                            {lesson.course.level && (
                                                <Badge variant="outline" className="mt-2 text-xs">
                                                    {lesson.course.level}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        </Card>
                    )}

                    {/* Module Card */}
                    {lesson.module && (
                        <Card className="border-2 shadow-lg p-0!">
                            <CardHeader className="bg-linear-to-br from-indigo-500/5 to-transparent pt-4">
                                <CardTitle className="text-lg">Module</CardTitle>
                            </CardHeader>
                            <CardContent className="py-4">
                                <Link href={`/module/${lesson.module.id}`}>
                                    <div className="group cursor-pointer">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary font-bold flex items-center justify-center">
                                                -
                                            </div>
                                            <p className="font-bold group-hover:text-primary transition-colors">
                                                {lesson.module.title}
                                            </p>
                                        </div>
                                        {lesson.module.description && (
                                            <p className="text-xs text-muted-foreground line-clamp-2">
                                                {lesson.module.description}
                                            </p>
                                        )}
                                    </div>
                                </Link>
                            </CardContent>
                        </Card>
                    )}

                    {/* Lesson Info Card */}
                    <Card className="border-2 shadow-lg p-0!">
                        <CardHeader className="bg-linear-to-br from-green-500/5 to-transparent pt-4">
                            <CardTitle className="text-lg">Lesson Details</CardTitle>
                        </CardHeader>
                        <CardContent className="py-6 space-y-4">
                            <div className="flex items-center justify-between py-2 border-b">
                                <span className="text-sm text-muted-foreground flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    Sequence
                                </span>
                                <span className="font-bold text-lg">#{lesson.sequence}</span>
                            </div>

                            {lesson.duration && (
                                <div className="flex items-center justify-between py-2 border-b">
                                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        Duration
                                    </span>
                                    <span className="font-medium">{lesson.duration} min</span>
                                </div>
                            )}

                            <div className="flex items-center justify-between py-2 border-b">
                                <span className="text-sm text-muted-foreground flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Created
                                </span>
                                <span className="font-medium text-sm">
                                    {new Date(lesson.createdAt).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                    })}
                                </span>
                            </div>

                            <div className="flex items-center justify-between py-2">
                                <span className="text-sm text-muted-foreground flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Updated
                                </span>
                                <span className="font-medium text-sm">
                                    {new Date(lesson.updatedAt).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                    })}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Slug Info Card */}
                    <Card className="border-2 shadow-lg">
                        <CardHeader className="bg-linear-to-br from-orange-500/5 to-transparent">
                            <CardTitle className="text-lg">URL Slug</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <code className="text-sm bg-muted px-3 py-2 rounded-lg block break-all">
                                {lesson.slug}
                            </code>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    )
}

export default async function LessonDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    return (
        <div className="container mx-auto px-6 py-24">
            <Suspense fallback={<PageHeaderSkeleton />}>
                <LessonDetailContent lessonId={id} />
            </Suspense>
        </div>
    )
}
