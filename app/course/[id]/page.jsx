import AddTrainerDialog from "@/components/course/add-trainer-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeaderSkeleton } from "@/components/ui/skeleton-loader"
import { VideoPlayer } from "@/components/video-upload/VideoPlayer"
import { getCourseById } from "@/lib/backend_actions/course"
import { ArrowLeft, Award, BookOpen, Calendar, Clock, Edit, Globe, GraduationCap, PlayCircle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"

async function CourseDetailContent({ courseId }) {
    const result = await getCourseById(courseId)

    if (!result.success || !result.data) {
        notFound()
    }

    const course = result.data
    // console.log("Course Data:", course)
    return (
        <>
            {/* Hero Section with Cover Image */}
            <div className="relative mb-12 -mx-6 -mt-24">
                {/* Cover Image Background */}
                {course.coverImage && (
                    <div className="relative h-[500px] w-full overflow-hidden">
                        <Image
                            src={course.coverImage}
                            alt={`${course.title} - Cover`}
                            fill
                            className="object-cover h-full w-full"
                            priority
                        />
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-linear-to-t from-background via-background/60 to-transparent" />
                    </div>
                )}

                {/* Content Overlay */}
                <div className="container mx-auto px-6 relative">
                    <div className={course.coverImage ? "absolute bottom-8 left-6 right-6" : "py-24"}>
                        <Link href="/course">
                            <Button variant="gradient" size="sm" className="mb-6" >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Courses
                            </Button>
                        </Link>

                        <div className="flex items-start gap-6">
                            {/* Thumbnail as Profile Image */}
                            {course.thumbnailImage && (
                                <div className="hidden lg:block relative w-48 h-48 rounded-2xl overflow-hidden border-4 border-background shadow-2xl shrink-0">
                                    <Image
                                        src={course.thumbnailImage}
                                        alt={`${course.title} - Thumbnail`}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            )}

                            <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-2 mb-3">
                                    <Badge variant={course.status === "active" ? "default" : "secondary"} className="text-xs">
                                        {course.status}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                        {course.level}
                                    </Badge>
                                    {course.hasCertificate && (
                                        <Badge variant="secondary" className="text-xs">
                                            <Award className="mr-1 h-3 w-3" />
                                            Certificate Available
                                        </Badge>
                                    )}
                                </div>

                                <h1 className="text-5xl font-bold tracking-tight mb-4 text-gradient-brand">
                                    {course.title.toUpperCase()}
                                </h1>

                                {course.description && (
                                    <p className="text-xl text-muted-foreground max-w-3xl">
                                        {course.description}
                                    </p>
                                )}

                                {/* Quick Stats Bar */}
                                <div className="flex flex-wrap items-center gap-6 mt-6 text-sm">
                                    {course.duration && (
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-medium">{course.duration} min</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">{course._count.lessons} lessons</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium capitalize">{course.level}</span>
                                    </div>
                                    {course.rating > 0 && (
                                        <div className="flex items-center gap-2">
                                            <Award className="h-4 w-4 text-yellow-500" />
                                            <span className="font-medium">{course.rating.toFixed(1)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Course Module Overview */}
                    <Card className="border-2 shadow-lg p-0!">
                        <CardHeader className="bg-gradient-to-br from-primary/5 to-transparent pt-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-2xl">Course Modules</CardTitle>
                                    <CardDescription className="mt-2">
                                        {course.stats.totalModules} modules • {course._count.lessons} lessons
                                    </CardDescription>
                                </div>
                                {course.demoVideoId && (
                                    <VideoPlayer video={{ id: course.demoVideo.id, title: "Course Demo Video", thumbnailUrl: course.thumbnailImage, playbackUrl: course.demoVideo.playbackUrl }}>
                                        <Button variant="gradient" size="sm">
                                            <PlayCircle className="mr-2 h-4 w-4" />
                                            Watch Demo
                                        </Button>
                                    </VideoPlayer>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="py-4">
                            {course._count.lessons === 0 && course.stats.totalModules === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-30" />
                                    <p className="text-lg font-medium">No content yet</p>
                                    <p className="text-sm">Modules and lessons will appear here</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {course.modules && course.modules.length > 0 ? (
                                        course.modules.map((module, idx) => (
                                            <Link href={`/module/${module.id}`} key={module.id} className="group border-2 flex rounded-xl p-4 hover:border-primary/50 hover:shadow-md transition-all duration-200">
                                                <div className="flex items-start gap-4">
                                                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 text-primary-foreground font-bold shadow-md">
                                                        {idx + 1}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-lg group-hover:text-primary transition-colors">{module.title}</h4>
                                                        {module.description && (
                                                            <p className="text-sm text-muted-foreground mt-1">{module.description}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </Link>
                                        ))
                                    ) : (
                                        <div className="text-center py-4 px-6 bg-muted/50 rounded-lg">
                                            <p className="text-sm font-medium">{course._count.lessons} standalone lesson(s)</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Tags */}
                    {course.tags && course.tags.length > 0 && (
                        <Card className="border-2 shadow-lg overflow-hidden p-0!">
                            <CardHeader className="bg-linear-to-br from-purple-500/5 to-transparent pt-4">
                                <CardTitle className="flex items-center gap-2">
                                    <span className="text-2xl">🏷️</span>
                                    Course Tags
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="py-4">
                                <div className="flex flex-wrap gap-2">
                                    {course.tags.map((tag, idx) => (
                                        <Badge
                                            key={tag}
                                            variant="secondary"
                                            className="text-sm px-4 py-1.5 hover:scale-105 transition-transform cursor-pointer"
                                            style={{
                                                animationDelay: `${idx * 50}ms`
                                            }}
                                        >
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6 md:sticky md:top-24 md:h-fit">
                    {/* Instructor Card - Featured */}
                    {course.trainer && (
                        <Card className="border-2 shadow-xl overflow-hidden p-0!">

                            <CardHeader className="bg-linear-to-br from-purple-500/5 to-transparent pt-4">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground mb-4">Your Instructor</CardTitle>
                                    <AddTrainerDialog trainerId={course.trainer.user.id} courseId={courseId}>
                                        <Button variant="gradient" size="sm">
                                            <Edit className="h-4 w-4 mr-2" />
                                            {course.trainer ? "Edit" : "Add"} Trainer
                                        </Button>
                                    </AddTrainerDialog>
                                </div>
                            </CardHeader>

                            {course.trainer.user ? <CardContent className="py-6">
                                <div className="flex items-center gap-4">
                                    {course.trainer.user.profileImage && (
                                        <div className="relative w-16 h-16 rounded-full overflow-hidden border-4 border-background shadow-lg">
                                            <Image
                                                src={course.trainer.user.profileImage}
                                                alt={course.trainer.user.displayName}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-bold text-lg">{course.trainer.user.displayName}</p>
                                        <p className="text-xs text-muted-foreground">{course.trainer.user.email}</p>
                                    </div>
                                </div>
                            </CardContent> : <CardContent className="pt-6">
                                <p className="text-sm text-muted-foreground text-center py-8">
                                    No trainer added yet. Click &quot;Add Description&quot; to provide an overview of this course.
                                </p>
                            </CardContent>}




                        </Card>
                    )}

                    {/* Stats Card - Redesigned */}
                    <Card className="border-2 shadow-lg overflow-hidden p-0!">
                        <CardHeader className="bg-gradient-to-br from-green-500/5 to-transparent pt-4">
                            <CardTitle className="text-lg">Course Stats</CardTitle>
                        </CardHeader>
                        <CardContent className="py-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center p-4 bg-muted/50 rounded-xl">
                                    <BookOpen className="h-6 w-6 mx-auto mb-2 text-primary" />
                                    <div className="text-2xl font-bold">{course.stats.totalModules}</div>
                                    <div className="text-xs text-muted-foreground">Modules</div>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-xl">
                                    <GraduationCap className="h-6 w-6 mx-auto mb-2 text-primary" />
                                    <div className="text-2xl font-bold">{course._count.lessons}</div>
                                    <div className="text-xs text-muted-foreground">Lessons</div>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-xl">
                                    <Clock className="h-6 w-6 mx-auto mb-2 text-primary" />
                                    <div className="text-2xl font-bold">{course.stats.totalDuration || course.duration || 0}</div>
                                    <div className="text-xs text-muted-foreground">Minutes</div>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-xl">
                                    <Globe className="h-6 w-6 mx-auto mb-2 text-primary" />
                                    <div className="text-2xl font-bold uppercase">{course.language}</div>
                                    <div className="text-xs text-muted-foreground">Language</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Category Card */}
                    {course.category && (
                        <Card className="border-2 shadow-lg overflow-hidden group hover:border-primary/50 transition-all p-0!">
                            <CardHeader className="bg-linear-to-br from-orange-500/5 to-transparent pt-4">
                                <CardTitle className="text-lg">Category</CardTitle>
                            </CardHeader>
                            <CardContent className="py-4">
                                <div className="flex items-center gap-4">
                                    {course.category.icon && (
                                        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-muted shadow-md group-hover:scale-110 transition-transform">
                                            <Image
                                                src={course.category.icon}
                                                alt={course.category.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <p className="font-bold text-lg">{course.category.name}</p>
                                        {course.category.description && (
                                            <p className="text-xs text-muted-foreground line-clamp-2">{course.category.description}</p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Course Details Card */}
                    <Card className="border-2 shadow-lg p-0!">
                        <CardHeader className="bg-gradient-to-br from-pink-500/5 to-transparent pt-4">
                            <CardTitle className="text-lg">Course Details</CardTitle>
                        </CardHeader>
                        <CardContent className="py-4 space-y-4">
                            <div className="flex items-center justify-between py-2 border-b">
                                <span className="text-sm text-muted-foreground flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Created
                                </span>
                                <span className="font-medium text-sm">
                                    {new Date(course.createdAt).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}
                                </span>
                            </div>
                            {course.rating > 0 && (
                                <div className="flex items-center justify-between py-2 border-b">
                                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                                        <Award className="h-4 w-4" />
                                        Rating
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <span className="font-bold text-lg">{course.rating.toFixed(1)}</span>
                                        <span className="text-xs text-muted-foreground">/ 5.0</span>
                                    </div>
                                </div>
                            )}
                            {course.hasCertificate && (
                                <div className="flex items-center justify-between py-2">
                                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                                        <Award className="h-4 w-4" />
                                        Certificate
                                    </span>
                                    <Badge variant="secondary" className="font-medium">
                                        ✓ Available
                                    </Badge>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div >
        </>
    )
}

export default async function CourseDetailPage({ params }) {
    const { id } = await params

    return (
        <div className="container mx-auto px-6 py-24">
            <Suspense fallback={<PageHeaderSkeleton />}>
                <CourseDetailContent courseId={id} />
            </Suspense>
        </div>
    )
}
