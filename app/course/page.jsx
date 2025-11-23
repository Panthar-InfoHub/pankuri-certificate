import { Suspense } from "react"
import { CoursesTable } from "@/components/course/courses-table"
import { CreateCourseDialog } from "@/components/course/create-course-dialog"
import { Button } from "@/components/ui/button"
import { TableSkeleton, PageHeaderSkeleton } from "@/components/ui/skeleton-loader"
import { getAllCourses } from "@/lib/backend_actions/course"
import { getFlatCategories } from "@/lib/backend_actions/category"
import { Plus } from "lucide-react"
import { getAllTrainersAdmin } from "@/lib/backend_actions/trainer"

async function CoursesContent() {
  const [coursesResult, categoriesResult, trainersResult] = await Promise.all([
    getAllCourses({ limit: 100, status: "active" }),
    getFlatCategories({ limit: 100, status: "active" }),
    getAllTrainersAdmin()
  ])

  const courses = coursesResult.success ? coursesResult.data : []
  const categories = categoriesResult.success ? categoriesResult.data : []
  const trainers = trainersResult.success ? trainersResult.data : []


  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gradient-brand">Courses</h1>
          <p className="text-muted-foreground mt-2">Manage your courses and content</p>
        </div>
        <CreateCourseDialog categories={categories} trainers={trainers} >
          <Button variant="gradient">
            <Plus className="mr-2 h-4 w-4" />
            Create Course
          </Button>
        </CreateCourseDialog>
      </div>

      <CoursesTable courses={courses} categories={categories} />
    </>
  )
}

export default function CoursesPage() {
  return (
    <div className="container mx-auto px-6 py-24">
      <Suspense fallback={<PageHeaderSkeleton />}>
        <CoursesContent />
      </Suspense>
    </div>
  )
}