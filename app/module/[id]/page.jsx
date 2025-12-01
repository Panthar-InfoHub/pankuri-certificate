import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeaderSkeleton } from "@/components/ui/skeleton-loader"
import { getModuleById } from "@/lib/backend_actions/module"
import { ArrowLeft, BookOpen, Calendar, Clock, FileText, GraduationCap, ListOrdered } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"

async function ModuleDetailContent({ moduleId }) {
    const result = await getModuleById(moduleId)

    if (!result.success || !result.data) {
        notFound()
    }

    const module = result.data

    const STATUS_CONFIG = {
        draft: { variant: "secondary", color: "from-gray-500/5" },
        published: { variant: "default", color: "from-green-500/5" },
        archived: { variant: "outline", color: "from-red-500/5" },
    }

    return (
        <>
            {/* Hero Section */}
            <div className="relative mb-12">
                <div className={`bg-linear-to-br ${STATUS_CONFIG[module.status].color} to-transparent p-8 rounded-2xl border-2 shadow-lg`}>
                    <Link href="/module">
                        <Button variant="gradient" size="sm" className="mb-6">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Modules
                        </Button>
                    </Link>

                    <div className="flex items-start gap-6">
                        <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-linear-to-br from-primary to-primary/60 text-primary-foreground text-3xl font-bold shadow-xl shrink-0">
                            {module.sequence}
                        </div>

                        <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                                <Badge variant={STATUS_CONFIG[module.status].variant} className="text-xs">
                                    {module.status}
                                </Badge>
                                {module.course && (
                                    <Badge variant="outline" className="text-xs">
                                        <BookOpen className="mr-1 h-3 w-3" />
                                        {module.course.title}
                                    </Badge>
                                )}
                                <code className="text-xs bg-muted px-3 py-1 rounded-lg block break-all w-fit">
                                    {module.slug}
                                </code>
                            </div>

                            <h1 className="text-5xl font-bold  mb-4 text-gradient-brand">
                                {module.title}
                            </h1>

                            {module.description && (
                                <p className="text-xl text-muted-foreground max-w-3xl">
                                    {module.description}
                                </p>
                            )}

                            {/* Quick Stats Bar */}
                            <div className="flex flex-wrap items-center gap-6 mt-6 text-sm">
                                <div className="flex items-center gap-2">
                                    <ListOrdered className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">{module._count?.lessons || 0} lessons</span>
                                </div>
                                {module.duration && (
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">{module.duration} min</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">Sequence #{module.sequence}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Lessons List */}
                    <Card className="border-2 shadow-lg p-0!">
                        <CardHeader className="bg-linear-to-br from-primary/5 to-transparent pt-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-2xl">Module Lessons</CardTitle>
                                    <CardDescription className="mt-2">
                                        {module._count?.lessons || 0} lesson(s) in this module
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="py-4">
                            {!module.lessons || module.lessons.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    <GraduationCap className="h-16 w-16 mx-auto mb-4 opacity-30" />
                                    <p className="text-lg font-medium">No lessons yet</p>
                                    <p className="text-sm">Add lessons to this module to build your course content</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {module.lessons.map((lesson, idx) => (
                                        <Link href={`/lesson/${lesson.id}`} key={lesson.id} className="group border-2 rounded-xl p-4 hover:border-primary/50 hover:shadow-md transition-all duration-200 w-full flex">
                                            <div className="flex items-start gap-4 w-full">
                                                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-linear-to-br from-blue-500 to-blue-600 text-white font-bold shadow-md">
                                                    {lesson.sequence || idx + 1}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-start justify-between gap-4 flex-1">
                                                        <div>
                                                            <h4 className="font-semibold text-lg group-hover:text-primary transition-colors">
                                                                {lesson.title}
                                                            </h4>
                                                            {lesson.description && (
                                                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                                                    {lesson.description}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <Badge variant="secondary" className="shrink-0">
                                                            {lesson.type}
                                                        </Badge>
                                                    </div>
                                                    {lesson.duration && (
                                                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                                            <Clock className="h-3 w-3" />
                                                            <span>{lesson.duration} min</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Module Metadata */}
                    {module.metadata && (
                        <Card className="border-2 shadow-lg">
                            <CardHeader className="bg-linear-to-br from-purple-500/5 to-transparent">
                                <CardTitle className="text-2xl">Additional Information</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <pre className="text-sm bg-muted p-4 rounded-lg overflow-auto">
                                    {JSON.stringify(module.metadata, null, 2)}
                                </pre>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6 lg:sticky lg:top-24 lg:h-fit">
                    {/* Course Card */}
                    {module.course && (
                        <Card className="border-2 shadow-xl overflow-hidden p-0!">
                            <div className="bg-linear-to-br from-blue-500/10 via-purple-500/10 to-transparent p-6">
                                <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground py-4">
                                    Part of Course
                                </CardTitle>
                                <Link href={`/course/${module.course.id}`}>
                                    <div className="flex items-start gap-4 group cursor-pointer">
                                        {module.course.thumbnailImage && (
                                            <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-background shadow-lg group-hover:scale-105 transition-transform">
                                                <Image
                                                    src={module.course.thumbnailImage}
                                                    alt={module.course.title}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <p className="font-bold text-lg group-hover:text-primary transition-colors">
                                                {module.course.title}
                                            </p>
                                            {module.course.level && (
                                                <Badge variant="outline" className="mt-2 text-xs">
                                                    {module.course.level}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        </Card>
                    )}

                    {/* Module Info Card */}
                    <Card className="border-2 shadow-lg p-0!">
                        <CardHeader className="bg-linear-to-br from-green-500/5 to-transparent pt-4">
                            <CardTitle className="text-lg">Module Details</CardTitle>
                        </CardHeader>
                        <CardContent className="py-4 space-y-4">
                            <div className="flex items-center justify-between py-2 border-b">
                                <span className="text-sm text-muted-foreground flex items-center gap-2">
                                    <ListOrdered className="h-4 w-4" />
                                    Sequence
                                </span>
                                <span className="font-bold text-lg">#{module.sequence}</span>
                            </div>

                            <div className="flex items-center justify-between py-2 border-b">
                                <span className="text-sm text-muted-foreground flex items-center gap-2">
                                    <GraduationCap className="h-4 w-4" />
                                    Lessons
                                </span>
                                <span className="font-medium">{module._count?.lessons || 0}</span>
                            </div>

                            {module.duration && (
                                <div className="flex items-center justify-between py-2 border-b">
                                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        Duration
                                    </span>
                                    <span className="font-medium">{module.duration} min</span>
                                </div>
                            )}

                            <div className="flex items-center justify-between py-2 border-b">
                                <span className="text-sm text-muted-foreground flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Created
                                </span>
                                <span className="font-medium text-sm">
                                    {new Date(module.createdAt).toLocaleDateString("en-US", {
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
                                    {new Date(module.updatedAt).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                    })}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    )
}

export default async function ModuleDetailPage({ params }) {
    const { id } = await params

    return (
        <div className="container mx-auto px-6 py-24">
            <Suspense fallback={<PageHeaderSkeleton />}>
                <ModuleDetailContent moduleId={id} />
            </Suspense>
        </div>
    )
}
