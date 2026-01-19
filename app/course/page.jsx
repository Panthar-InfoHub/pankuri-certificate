import { CourseFilter } from "@/components/course/course-filter"
import { CoursesTable } from "@/components/course/courses-table"
import { CreateCourseDialog } from "@/components/course/create-course-dialog"
import { Button } from "@/components/ui/button"
import { PageHeaderSkeleton } from "@/components/ui/skeleton-loader"
import { getFlatCategories } from "@/lib/backend_actions/category"
import { getAllCourses } from "@/lib/backend_actions/course"
import { getAllTrainersAdmin } from "@/lib/backend_actions/trainer"
import { Plus } from "lucide-react"
import { Suspense } from "react"

async function CoursesContent({ searchP }) {

  const [coursesResult, categoriesResult, trainersResult] = await Promise.all([
    getAllCourses({
      limit: searchP.limit || 100,
      status: searchP.status || "active",
      categoryId: searchP.category || undefined,
      level: searchP.level || undefined,
      search: searchP.search || undefined,
      page: searchP.page || 1,
    }),
    getFlatCategories({ limit: 100, status: "active" }),
    getAllTrainersAdmin()
  ])

  const courses = coursesResult.success ? coursesResult.data : []
  const categories = categoriesResult.success ? categoriesResult.data.data : []
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

      <CourseFilter categories={categories} />

      <CoursesTable courses={courses} categories={categories} pagination={coursesResult.success && coursesResult.pagination} />
    </>
  )
}

export default async function CoursesPage({ searchParams }) {
  const searchP = await searchParams
  return (
    <div className="container mx-auto px-6 py-24">
      <Suspense fallback={<PageHeaderSkeleton />}>
        <CoursesContent searchP={searchP} />
      </Suspense>
    </div>
  )
}