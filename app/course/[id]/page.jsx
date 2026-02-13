import AddTrainerDialog from "@/components/course/add-trainer-dialog"
import { CourseDetailTabs } from "@/components/course/course-detail-tabs"
import { EditCourseDialog } from "@/components/course/edit-course-dialog"
import CreateLessonDialog from "@/components/lesson/create-lesson-dialog"
import CreateModuleDialog from "@/components/module/create-module-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { PageHeaderSkeleton } from "@/components/ui/skeleton-loader"
import { VideoPlayer } from "@/components/video-upload/VideoPlayer"
import { getFlatCategories } from "@/lib/backend_actions/category"
import { getAllCourses, getCourseById } from "@/lib/backend_actions/course"
import { ArrowLeft, Award, BookOpen, Bookmark, Clock, DollarSign, Download, Edit, GraduationCap, Lock, Pencil, PlayCircle, Share2, Unlock } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"

async function CourseDetailContent({ courseId }) {
    // const result = await 

    const [result, coursesResult, categoriesResult] = await Promise.all([
        getCourseById(courseId),
        getAllCourses({ limit: 100, status: "active" }),
        getFlatCategories({ limit: 100, status: "active" }),
    ])


    if (!result.success || !result.data) {
        notFound()
    }

    const course = result.data
    const categories = categoriesResult.success ? categoriesResult.data.data : []
    const courses = coursesResult.success ? coursesResult.data : []

    return (
        <div className="space-y-10">
            {/* Back Button */}
            <Link href="/course">
                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground -ml-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Courses
                </Button>
            </Link>

            {/* Cover Image Banner (if exists) */}
            {course.coverImage && (
                <div className="relative -mx-6 -mt-10 mb-6 h-[280px] overflow-hidden rounded-none md:rounded-2xl">
                    <Image
                        src={course.coverImage}
                        alt={`${course.title} - Cover`}
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-background via-background/30 to-transparent" />
                </div>
            )}

            {/* Hero Section — Image left, details right */}
            <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-8 items-start">

                {/* Left: Thumbnail Image */}
                <div className="relative aspect-3/4 w-full max-w-[340px] mx-auto lg:mx-0 rounded-2xl overflow-hidden bg-muted shadow-xl border-2">
                    {course.thumbnailImage ? (
                        <Image
                            src={course.thumbnailImage}
                            alt={course.title}
                            fill
                            className="object-cover"
                            priority
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <BookOpen className="h-16 w-16 text-muted-foreground/30" />
                        </div>
                    )}
                </div>

                {/* Right: Course Info */}
                <div className="flex flex-col space-y-6">
                    {/* Title and Trainer */}
                    <div className="space-y-3">
                        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight leading-tight">
                            {course.title}
                        </h1>
                        {course.trainer?.user && (
                            <Link href={`/trainer/${course.trainer.id}`} className="flex items-center gap-2 w-fit hover:opacity-80 transition-opacity">
                                {course.trainer.user.profileImage && (
                                    <div className="relative w-8 h-8 rounded-full overflow-hidden border">
                                        <Image
                                            src={course.trainer.user.profileImage}
                                            alt={course.trainer.user.displayName}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                )}
                                <p className="text-base text-muted-foreground">
                                    by <span className="font-medium text-foreground hover:underline">{course.trainer.user.displayName}</span>
                                </p>
                            </Link>
                        )}
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y">
                        <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                <BookOpen className="h-4 w-4" />
                                <span className="text-xs uppercase tracking-wide">Modules</span>
                            </div>
                            <p className="text-xl font-bold">{course.stats?.totalModules || 0}</p>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                <PlayCircle className="h-4 w-4" />
                                <span className="text-xs uppercase tracking-wide">Lessons</span>
                            </div>
                            <p className="text-xl font-bold">{course.stats?.totalLessons || course._count?.lessons || 0}</p>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span className="text-xs uppercase tracking-wide">Duration</span>
                            </div>
                            <p className="text-xl font-bold">{course.stats?.totalDuration || course.duration || 0}<span className="text-sm font-normal text-muted-foreground ml-1">min</span></p>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                <GraduationCap className="h-4 w-4" />
                                <span className="text-xs uppercase tracking-wide">Level</span>
                            </div>
                            <p className="text-xl font-bold capitalize">{course.level}</p>
                        </div>
                    </div>

                    {/* Badges row */}
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={course.status === "active" ? "default" : "secondary"} className="capitalize">
                            {course.status}
                        </Badge>
                        {course.isPaid ? (
                            <Badge variant="outline" className="gap-1.5">
                                <DollarSign className="h-3 w-3" />
                                Paid Course
                            </Badge>
                        ) : (
                            <Badge variant="secondary" className="gap-1.5">
                                Free Course
                            </Badge>
                        )}
                        {course.hasAccess ? (
                            <Badge variant="default" className="gap-1.5">
                                <Unlock className="h-3 w-3" />
                                Access Granted
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="gap-1.5">
                                <Lock className="h-3 w-3" />
                                Locked
                            </Badge>
                        )}
                        {course.certificateInfo?.hasCertificate && (
                            <Badge variant="secondary" className="gap-1.5">
                                <Award className="h-3 w-3" />
                                Certificate
                            </Badge>
                        )}
                        {course.rating > 0 && (
                            <Badge variant="outline" className="gap-1.5">
                                <Award className="h-3 w-3 text-yellow-500" />
                                {course.averageRating?.toFixed(1) || course.rating.toFixed(1)}
                            </Badge>
                        )}
                    </div>

                    {/* Pricing */}
                    {course.pricing && (
                        <div className="flex items-baseline gap-3 pt-2">
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-bold">{course.pricing.currency === "INR" ? "₹" : "$"}{(course.pricing.discountedPrice || course.pricing.price) / 100}</span>
                                {course.pricing.discountedPrice && (
                                    <span className="text-lg text-muted-foreground line-through">
                                        {course.pricing.currency === "INR" ? "₹" : "$"}{course.pricing.price / 100}
                                    </span>
                                )}
                            </div>
                            <Badge variant="secondary" className="capitalize">{course.pricing.subscriptionType}</Badge>
                        </div>
                    )}

                    {/* Action buttons row */}
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                        {(course.demoVideoId && course.demoVideo) ? (
                            <VideoPlayer video={{ id: course.demoVideo.id, title: "Course Demo Video", thumbnailUrl: course.thumbnailImage, playbackUrl: course.demoVideo.playbackUrl, externalUrl: course.externalUrl }}>
                                <Button variant="gradient" size="default" className="gap-2">
                                    <PlayCircle className="h-4 w-4" />
                                    Watch Demo
                                </Button>
                            </VideoPlayer>
                        ) :
                            (<Button variant="ghost" size="default" className="gap-2">
                                <PlayCircle className="h-4 w-4" />
                                No Demo Video
                            </Button>)
                        }


                        {course.trainer && (
                            <AddTrainerDialog trainerId={course.trainer?.user?.id} courseId={courseId}>
                                <Button variant="outline" size="default" className="gap-2">
                                    <Edit className="h-4 w-4" />
                                    {course.trainer ? "Edit" : "Add"} Trainer
                                </Button>
                            </AddTrainerDialog>
                        )}

                        <EditCourseDialog course={course} categories={categories} />

                        <CreateModuleDialog courses={courses} courseId={courseId} />

                        <CreateLessonDialog courses={courses} courseId={courseId} />
                    </div>
                </div>
            </div>

            {/* Separator */}
            <Separator />

            {/* Tabs Section */}
            <CourseDetailTabs course={course} />
        </div>
    )
}

export default async function CourseDetailPage({ params }) {
    const { id } = await params

    return (
        <div className="container mx-auto max-w-7xl px-6 py-24">
            <Suspense fallback={<PageHeaderSkeleton />}>
                <CourseDetailContent courseId={id} />
            </Suspense>
        </div>
    )
}
