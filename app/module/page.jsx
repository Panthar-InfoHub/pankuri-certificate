import { Suspense } from "react"
import { getModulesByCourse } from "@/lib/backend_actions/module"
import { getAllCourses } from "@/lib/backend_actions/course"
import { TableSkeleton, PageHeaderSkeleton } from "@/components/ui/skeleton-loader"
import ModulesTable from "@/components/module/modules-table"
import CreateModuleDialog from "@/components/module/create-module-dialog"

async function ModulesContent({ courseId, status }) {
    // const courseId = searchParams?.courseId || null
    // const status = searchParams?.status || "published"

    // Fetch modules and courses in parallel
    console.log("Fetching modules for courseId:", courseId, "with status:", status);
    const [modulesResult, coursesResult] = await Promise.all([
        courseId ? getModulesByCourse(courseId, { status, limit: 100 }) : { success: true, data: [] },
        getAllCourses({ limit: 100, status: "active" })
    ])

    const modules = modulesResult.success ? modulesResult.data : []
    const courses = coursesResult.success ? coursesResult.data : []

    return (
        <>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-gradient-brand">Modules</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage course modules and their content structure
                    </p>
                </div>
                <CreateModuleDialog courses={courses} />
            </div>

            <ModulesTable
                modules={modules}
                courses={courses}
                selectedCourseId={courseId}
            />
        </>
    )
}

export default async function ModulePage({ searchParams }) {
    const courseId = (await searchParams)?.courseId || null
    const status = (await searchParams)?.status || undefined
    return (
        <div className="container mx-auto px-6 py-24">
            <Suspense fallback={<PageHeaderSkeleton />}>
                <ModulesContent courseId={courseId} status={status} />
            </Suspense>
        </div>
    )
}