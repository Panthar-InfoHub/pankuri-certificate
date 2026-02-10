"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { BookOpen, Clock, GraduationCap, Globe, Award, Calendar, Mail, User, Lock } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export function CourseDetailTabs({ course }) {
    return (
        <Tabs defaultValue="about" className="w-full">
            <TabsList variant="line" className="w-full justify-start border-b rounded-none bg-transparent px-0 gap-4">
                <TabsTrigger value="about" className="text-base px-1 pb-3 data-[state=active]:font-semibold">
                    About Course
                </TabsTrigger>
                <TabsTrigger value="modules" className="text-base px-1 pb-3 data-[state=active]:font-semibold">
                    Modules
                </TabsTrigger>
                <TabsTrigger value="trainer" className="text-base px-1 pb-3 data-[state=active]:font-semibold">
                    About Trainer
                </TabsTrigger>
            </TabsList>

            {/* About Course Tab */}
            <TabsContent value="about" className="pt-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left: Description */}
                    <div className="lg:col-span-2 space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Description</h3>
                            {course.description ? (
                                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                                    {course.description}
                                </p>
                            ) : (
                                <p className="text-muted-foreground italic">
                                    No description available for this course yet.
                                </p>
                            )}
                        </div>

                        {/* Tags */}
                        {course.tags && course.tags.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Tags</h3>
                                <div className="flex flex-wrap gap-2">
                                    {course.tags.map((tag) => (
                                        <Badge
                                            key={tag}
                                            variant="secondary"
                                            className="text-sm px-3 py-1 font-normal"
                                        >
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Reviews summary */}
                        {course.totalReviews > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Reviews</h3>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1.5">
                                        <Award className="h-5 w-5 text-yellow-500" />
                                        <span className="text-2xl font-bold">{course.averageRating?.toFixed(1) || course.rating?.toFixed(1)}</span>
                                        <span className="text-muted-foreground text-sm">/ 5.0</span>
                                    </div>
                                    <Separator orientation="vertical" className="h-6" />
                                    <span className="text-muted-foreground text-sm">{course.totalReviews} review(s)</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right: Course Details Sidebar */}
                    <div className="space-y-5">
                        <DetailRow icon={<GraduationCap className="h-4 w-4" />} label="Level" value={<span className="capitalize">{course.level}</span>} />
                        <DetailRow icon={<Globe className="h-4 w-4" />} label="Language" value={<span className="uppercase">{course.language}</span>} />
                        <DetailRow icon={<Clock className="h-4 w-4" />} label="Duration" value={`${course.duration || 0} min`} />
                        <DetailRow icon={<BookOpen className="h-4 w-4" />} label="Lessons" value={course._count?.lessons || 0} />
                        <DetailRow icon={<Award className="h-4 w-4" />} label="Certificate" value={course.hasCertificate ? "Available" : "Not available"} />
                        {course.category && (
                            <DetailRow
                                icon={course.category.icon ? (
                                    <div className="relative w-4 h-4 rounded overflow-hidden">
                                        <Image src={course.category.icon} alt={course.category.name} fill className="object-cover" />
                                    </div>
                                ) : <BookOpen className="h-4 w-4" />}
                                label="Category"
                                value={course.category.name}
                            />
                        )}
                        <DetailRow icon={<Calendar className="h-4 w-4" />} label="Created" value={new Date(course.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} />
                    </div>
                </div>
            </TabsContent>

            {/* Modules Tab */}
            <TabsContent value="modules" className="pt-8 ">
                {!course.curriculum || course.curriculum.length === 0 ? (
                    <div className="text-center py-16 text-muted-foreground">
                        <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-30" />
                        <p className="text-lg font-medium">No content yet</p>
                        <p className="text-sm mt-1">Modules and lessons will appear here once added.</p>
                    </div>
                ) : (
                    <div className="space-y-4 w-full">
                        <div className="flex items-center justify-between mb-6">
                            <p className="text-muted-foreground text-sm">
                                {course.stats?.totalModules || 0} modules &middot; {course.stats?.totalLessons || 0} lessons
                            </p>
                        </div>

                        {course.curriculum.map((module, idx) => (
                            <div key={module.id} className="border rounded-xl overflow-hidden">
                                {/* Module Header */}
                                <div className="flex items-start gap-4 p-5 bg-muted/30">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary font-semibold text-sm shrink-0">
                                        {String(idx + 1).padStart(2, '0')}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-base">
                                            {module.title}
                                        </h4>
                                        {module.description && (
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {module.description}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <BookOpen className="h-3 w-3" />
                                                {module.lessons?.length || 0} lessons
                                            </span>
                                            {module.duration && (
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {module.duration} min
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <Link href={`/module/${module.id}`}>
                                        <Button variant="outline" size="sm" className="gap-2">
                                            Go to Module
                                            <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                                            </svg>
                                        </Button>
                                    </Link>
                                </div>

                                {/* Lessons List */}
                                {module.lessons && module.lessons.length > 0 && (
                                    <div className="divide-y">
                                        {module.lessons.map((lesson, lessonIdx) => (
                                            <div key={lesson.id} className="flex items-center gap-4 p-4 hover:bg-accent/30 transition-colors group">
                                                {/* Lesson Thumbnail */}
                                                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0">
                                                    {lesson.thumbnail ? (
                                                        <Image
                                                            src={lesson.thumbnail}
                                                            alt={lesson.title}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex items-center justify-center h-full">
                                                            <BookOpen className="h-6 w-6 text-muted-foreground/40" />
                                                        </div>
                                                    )}
                                                    {lesson.isLocked && (
                                                        <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                                                            <Lock className="h-5 w-5 text-muted-foreground" />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Lesson Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-muted-foreground font-medium">Lesson {lessonIdx + 1}</span>
                                                        {lesson.isFree && <Badge variant="secondary" className="text-xs">Free</Badge>}
                                                        {lesson.isMandatory && <Badge variant="outline" className="text-xs">Required</Badge>}
                                                    </div>
                                                    <h5 className="font-medium text-sm mt-1 group-hover:text-primary transition-colors">
                                                        {lesson.title}
                                                    </h5>
                                                    <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                                                        <span className="capitalize">{lesson.type}</span>
                                                        {lesson.duration && (
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="h-3 w-3" />
                                                                {lesson.duration} min
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Go to Lesson Button */}
                                                <Link href={`/lesson/${lesson.id}`}>
                                                    <Button variant="ghost" size="sm" className="gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        Go to Lesson
                                                        <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                                                        </svg>
                                                    </Button>
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </TabsContent>

            {/* About Trainer Tab */}
            <TabsContent value="trainer" className="pt-8">
                {course.trainer?.user ? (
                    <div className="max-w-2xl space-y-6">
                        <Link href={`/trainer/${course.trainer.id}`} className="flex items-center gap-5 w-fit hover:opacity-80 transition-opacity">
                            {course.trainer.user.profileImage ? (
                                <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-border shrink-0">
                                    <Image
                                        src={course.trainer.user.profileImage}
                                        alt={course.trainer.user.displayName}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                    <User className="h-8 w-8 text-primary" />
                                </div>
                            )}
                            <div>
                                <h3 className="text-xl font-semibold hover:underline">{course.trainer.user.displayName}</h3>
                                <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                                    <Mail className="h-3.5 w-3.5" />
                                    {course.trainer.user.email}
                                </p>
                            </div>
                        </Link>

                        {course.trainer.bio && (
                            <>
                                <Separator />
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">Bio</h4>
                                    <p className="text-muted-foreground leading-relaxed">{course.trainer.bio}</p>
                                </div>
                            </>
                        )}

                        {course.trainer.expertise && course.trainer.expertise.length > 0 && (
                            <div>
                                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">Expertise</h4>
                                <div className="flex flex-wrap gap-2">
                                    {course.trainer.expertise.map((skill) => (
                                        <Badge key={skill} variant="outline" className="text-sm font-normal">
                                            {skill}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-16 text-muted-foreground">
                        <User className="h-12 w-12 mx-auto mb-4 opacity-30" />
                        <p className="text-lg font-medium">No trainer assigned</p>
                        <p className="text-sm mt-1">A trainer has not been assigned to this course yet.</p>
                    </div>
                )}
            </TabsContent>
        </Tabs>
    )
}

function DetailRow({ icon, label, value }) {
    return (
        <div className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
            <span className="text-sm text-muted-foreground flex items-center gap-2">
                {icon}
                {label}
            </span>
            <span className="font-medium text-sm">{value}</span>
        </div>
    )
}
