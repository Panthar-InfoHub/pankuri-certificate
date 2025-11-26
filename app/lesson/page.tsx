import { Suspense } from "react"
import { getLessonsByCourse, getLessonsByModule } from "@/lib/backend_actions/lesson"
import { getModulesByCourse } from "@/lib/backend_actions/module"
import { getAllCourses } from "@/lib/backend_actions/course"
import { TableSkeleton, PageHeaderSkeleton } from "@/components/ui/skeleton-loader"
import LessonsTable from "@/components/lesson/lessons-table"
import CreateLessonDialog from "@/components/lesson/create-lesson-dialog"

interface SearchParamsProps {
    searchParams: Promise<{
        courseId?: string
        moduleId?: string
        type?: string
        status?: string
        isFree?: string
    }>
}

async function LessonsContent({ searchParams }: SearchParamsProps) {
    const params = await searchParams
    const courseId = params?.courseId || null
    const moduleId = params?.moduleId || null
    const type = params?.type || null
    const status = params?.status || "published"
    const isFree = params?.isFree || null

    // Fetch courses first
    const coursesResult = await getAllCourses({ limit: 100, status: "active" })
    const courses = coursesResult.success ? coursesResult.data : []

    // If courseId is selected, fetch lessons and modules for that course
    let lessons = []
    let modules = []

    if (courseId) {
        const [lessonsResult, modulesResult] = await Promise.all([
            moduleId
                ? getLessonsByModule(moduleId)
                : getLessonsByCourse(courseId, { status }),
            getModulesByCourse(courseId, { status: "published", limit: 100 })
        ])

        lessons = lessonsResult.success ? lessonsResult.data : []
        modules = modulesResult.success ? modulesResult.data : []
    }

    return (
        <>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-gradient-brand">Course Lessons</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage individual lessons and their content
                    </p>
                </div>
                <CreateLessonDialog courses={courses} />
            </div>

            <LessonsTable
                lessons={lessons}
                courses={courses}
                modules={modules}
                selectedCourseId={courseId}
                selectedModuleId={moduleId}
            />
        </>
    )
}

export default async function LessonPage({ searchParams }) {
    return (
        <div className="container mx-auto px-6 py-24">
            <Suspense fallback={
                <PageHeaderSkeleton />
            }>
                <LessonsContent searchParams={searchParams} />
            </Suspense>
        </div>
    )
}
