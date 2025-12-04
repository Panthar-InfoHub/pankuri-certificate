import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeaderSkeleton } from "@/components/ui/skeleton-loader"
import { getTrainerById } from "@/lib/backend_actions/trainer"
import { ArrowLeft, Award, BookOpen, Calendar, ExternalLink, GraduationCap, Users } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"

async function TrainerDetailContent({ trainerId }) {
    const result = await getTrainerById(trainerId)

    if (!result.success || !result.data) {
        notFound()
    }

    const trainer = result.data;

    return (
        <>
            {/* Hero Section */}
            <div className="relative mb-12 -mx-6 -mt-24">
                {/* Content Overlay */}
                <div className="container mx-auto px-6 relative bg-linear-to-br from-primary/10 via-purple-500/5 to-background">
                    <div className="pt-24 pb-10" >
                        <Link href="/trainer">
                            <Button variant="gradient" size="sm" className="mb-6">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Trainers
                            </Button>
                        </Link>

                        <div className="flex items-start gap-6 md:flex-row flex-col">
                            {/* Profile Image */}
                            {trainer.user?.profileImage && (
                                <div className=" relative w-48 h-48 rounded-2xl overflow-hidden border-4 border-background shadow-2xl shrink-0">
                                    <Image
                                        src={trainer.user.profileImage}
                                        alt={trainer.user.displayName}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            )}

                            <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-2 mb-3">
                                    <Badge variant={trainer.status === "active" ? "default" : "secondary"} className="text-xs">
                                        {trainer.status}
                                    </Badge>
                                    {trainer.experience && (
                                        <Badge variant="outline" className="text-xs">
                                            {trainer.experience} years experience
                                        </Badge>
                                    )}
                                </div>

                                <h1 className="text-5xl font-bold tracking-tight mb-4 text-gradient-brand">
                                    {trainer.user?.displayName?.toUpperCase()}
                                </h1>

                                {trainer.user?.email && (
                                    <p className="text-lg text-muted-foreground mb-4">{trainer.user.email}</p>
                                )}

                                {trainer.bio && (
                                    <p className="text-xl text-muted-foreground max-w-3xl">
                                        {trainer.bio}
                                    </p>
                                )}

                                {/* Quick Stats Bar */}
                                <div className="flex flex-wrap items-center gap-6 mt-6 text-sm">
                                    <div className="flex items-center gap-2">
                                        <Award className="h-4 w-4 text-yellow-500" />
                                        <span className="font-medium">{trainer.rating?.toFixed(1) || "0.0"} Rating</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">{trainer.totalStudents || 0} Students</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">{trainer.courses.length || 0} Courses</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Courses Overview */}
                    <Card className="border-2 shadow-lg p-0!">
                        <CardHeader className="bg-linear-to-br from-primary/5 to-transparent pt-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-2xl">Courses</CardTitle>
                                    <CardDescription className="mt-2">
                                        {trainer._count?.courses || 0} course(s) taught by this trainer
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="py-4">
                            {!trainer.courses || trainer.courses.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-30" />
                                    <p className="text-lg font-medium">No courses yet</p>
                                    <p className="text-sm">This trainer hasn&apos;t been assigned to any courses</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {trainer.courses.map((course) => (
                                        <Link
                                            href={`/course/${course.id}`}
                                            key={course.id}
                                            className="group border-2 flex rounded-xl p-4 hover:border-primary/50 hover:shadow-md transition-all duration-200"
                                        >
                                            <div className="flex items-start gap-4 w-full">
                                                {course.thumbnailImage && (
                                                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0">
                                                        <Image
                                                            src={course.thumbnailImage}
                                                            alt={course.title}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                )}
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-lg group-hover:text-primary transition-colors">
                                                        {course.title}
                                                    </h4>
                                                    {course.description && (
                                                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                                            {course.description}
                                                        </p>
                                                    )}
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <Badge variant="outline" className="text-xs">
                                                            {course.level}
                                                        </Badge>
                                                        <Badge variant={course.status === "active" ? "default" : "secondary"} className="text-xs">
                                                            {course.status}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Specialization */}
                    {trainer.specialization && trainer.specialization.length > 0 && (
                        <Card className="border-2 shadow-lg overflow-hidden p-0!">
                            <CardHeader className="bg-linear-to-br from-purple-500/5 to-transparent pt-4">
                                <CardTitle className="flex items-center gap-2">
                                    <span className="text-2xl">🎯</span>
                                    Specialization
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="py-4">
                                <div className="flex flex-wrap gap-2">
                                    {trainer.specialization.map((spec, idx) => (
                                        <Badge
                                            key={spec}
                                            variant="secondary"
                                            className="text-sm px-4 py-1.5 hover:scale-105 transition-transform cursor-pointer"
                                            style={{
                                                animationDelay: `${idx * 50}ms`
                                            }}
                                        >
                                            {spec}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6 md:sticky md:top-24 md:h-fit">
                    {/* Stats Card */}
                    <Card className="border-2 shadow-lg overflow-hidden p-0!">
                        <CardHeader className="bg-linear-to-br from-green-500/5 to-transparent pt-4">
                            <CardTitle className="text-lg">Trainer Stats</CardTitle>
                        </CardHeader>
                        <CardContent className="py-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center p-4 bg-muted/50 rounded-xl">
                                    <BookOpen className="h-6 w-6 mx-auto mb-2 text-primary" />
                                    <div className="text-2xl font-bold">{trainer.courses.length || 0}</div>
                                    <div className="text-xs text-muted-foreground">Courses</div>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-xl">
                                    <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
                                    <div className="text-2xl font-bold">{trainer.totalStudents || 0}</div>
                                    <div className="text-xs text-muted-foreground">Students</div>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-xl">
                                    <Award className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
                                    <div className="text-2xl font-bold">{trainer.rating?.toFixed(1) || "0.0"}</div>
                                    <div className="text-xs text-muted-foreground">Rating</div>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-xl">
                                    <GraduationCap className="h-6 w-6 mx-auto mb-2 text-primary" />
                                    <div className="text-2xl font-bold">{trainer.experience || 0}</div>
                                    <div className="text-xs text-muted-foreground">Years Exp.</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Social Links */}
                    {trainer.socialLinks && Object.keys(trainer.socialLinks).length > 0 && (
                        <Card className="border-2 shadow-lg overflow-hidden p-0!">
                            <CardHeader className="bg-linear-to-br from-blue-500/5 to-transparent pt-4">
                                <CardTitle className="text-lg">Social Links</CardTitle>
                            </CardHeader>
                            <CardContent className="py-4 space-y-3">
                                {trainer.socialLinks.linkedin && (
                                    <a
                                        href={trainer.socialLinks.linkedin}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                                    >
                                        <span className="font-medium text-sm">LinkedIn</span>
                                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                                    </a>
                                )}
                                {trainer.socialLinks.instagram && (
                                    <a
                                        href={trainer.socialLinks.instagram.startsWith('http') ? trainer.socialLinks.instagram : `https://instagram.com/${trainer.socialLinks.instagram.replace('@', '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                                    >
                                        <span className="font-medium text-sm">Instagram</span>
                                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                                    </a>
                                )}
                                {trainer.socialLinks.twitter && (
                                    <a
                                        href={trainer.socialLinks.twitter.startsWith('http') ? trainer.socialLinks.twitter : `https://twitter.com/${trainer.socialLinks.twitter.replace('@', '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                                    >
                                        <span className="font-medium text-sm">Twitter</span>
                                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                                    </a>
                                )}
                                {trainer.socialLinks.website && (
                                    <a
                                        href={trainer.socialLinks.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                                    >
                                        <span className="font-medium text-sm">Website</span>
                                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                                    </a>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Trainer Details Card */}
                    <Card className="border-2 shadow-lg p-0!">
                        <CardHeader className="bg-linear-to-br from-pink-500/5 to-transparent pt-4">
                            <CardTitle className="text-lg">Profile Details</CardTitle>
                        </CardHeader>
                        <CardContent className="py-4 space-y-4">
                            <div className="flex items-center justify-between py-2 border-b">
                                <span className="text-sm text-muted-foreground flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Joined
                                </span>
                                <span className="font-medium text-sm">
                                    {new Date(trainer.createdAt).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b">
                                <span className="text-sm text-muted-foreground">Status</span>
                                <Badge variant={trainer.status === "active" ? "default" : "secondary"}>
                                    {trainer.status}
                                </Badge>
                            </div>
                            {trainer.experience && (
                                <div className="flex items-center justify-between py-2">
                                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                                        <GraduationCap className="h-4 w-4" />
                                        Experience
                                    </span>
                                    <span className="font-medium text-sm">{trainer.experience} years</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    )
}

export default async function TrainerDetailPage({ params }) {
    const { id } = await params

    return (
        <div className="container mx-auto px-6 py-24">
            <Suspense fallback={<PageHeaderSkeleton />}>
                <TrainerDetailContent trainerId={id} />
            </Suspense>
        </div>
    )
}
