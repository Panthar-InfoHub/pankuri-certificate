import CreateLessonDialog from "@/components/lesson/create-lesson-dialog"
import { ModuleDetailTabs } from "@/components/module/module-detail-tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { PageHeaderSkeleton } from "@/components/ui/skeleton-loader"
import { getAllCourses } from "@/lib/backend_actions/course"
import { getModuleById } from "@/lib/backend_actions/module"
import { ArrowLeft, ArrowRight, BookOpen, ChevronLeft, ChevronRight, Clock, GraduationCap, ListOrdered, Play, Video } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"

async function ModuleDetailContent({ moduleId }) {

    const [result, coursesResult] = await Promise.all([
        getModuleById(moduleId),
        getAllCourses({ limit: 100, status: "active" }),
    ])

    if (!result.success || !result.data) {
        notFound()
    }

    const module = result.data

    // Count video vs text lessons
    const videoCount = module.lessons?.filter(l => l.type === "video").length || 0
    const textCount = module.lessons?.filter(l => l.type === "text").length || 0

    const courses = coursesResult.success ? coursesResult.data : []
    const courseId = module.courseId

    return (
        <div className="space-y-10">
            {/* Top Nav: Back + Navigation */}
            <div className="flex items-center justify-between">
                <Link href={module.course ? `/course/${module.course.id}` : "/module"}>
                    <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground -ml-2">
                        <ArrowLeft className="h-4 w-4" />
                        {module.course ? module.course.title : "Back to Modules"}
                    </Button>
                </Link>

                {/* Prev / Next Module Navigation */}
                <div className="flex items-center gap-2">
                    <CreateLessonDialog courses={courses} courseId={courseId} />
                </div>
            </div>

            {/* Hero Section */}
            <div className="space-y-5">

                {/* Title + Badges */}
                <div className="flex items-start gap-5">
                    <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 text-primary text-2xl font-bold shrink-0">
                        {module.sequence}
                    </div>
                    <div className="flex-1 space-y-3">
                        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight leading-tight">
                            {module.title}
                        </h1>

                        {/* Badges */}
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge variant={module.status === "published" ? "default" : "secondary"} className="capitalize">
                                {module.status}
                            </Badge>
                            <Badge variant="outline" className="font-mono text-xs">
                                {module.slug}
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y">
                    <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                            <GraduationCap className="h-4 w-4" />
                            <span className="text-xs uppercase tracking-wide">Lessons</span>
                        </div>
                        <p className="text-xl font-bold">{module._count?.lessons || 0}</p>
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Video className="h-4 w-4" />
                            <span className="text-xs uppercase tracking-wide">Video</span>
                        </div>
                        <p className="text-xl font-bold">{videoCount}</p>
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                            <BookOpen className="h-4 w-4" />
                            <span className="text-xs uppercase tracking-wide">Text</span>
                        </div>
                        <p className="text-xl font-bold">{textCount}</p>
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span className="text-xs uppercase tracking-wide">Duration</span>
                        </div>
                        <p className="text-xl font-bold">{module.duration || 0}<span className="text-sm font-normal text-muted-foreground ml-1">min</span></p>
                    </div>
                </div>
            </div>

            {/* Tabs Section */}
            <ModuleDetailTabs module={module} />
        </div>
    )
}

export default async function ModuleDetailPage({ params }) {
    const { id } = await params

    return (
        <div className="container mx-auto max-w-6xl px-6 py-24">
            <Suspense fallback={<PageHeaderSkeleton />}>
                <ModuleDetailContent moduleId={id} />
            </Suspense>
        </div>
    )
}
