"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DescriptionMarkdown from "@/components/lesson/description_markdown"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Clock, FileText, GraduationCap, ListOrdered, Calendar, Play, Video, Type, ChevronRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

function formatDuration(seconds) {
    if (!seconds) return null
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    if (h > 0) return `${h}h ${m}m`
    if (m > 0) return `${m}m ${s}s`
    return `${s}s`
}

export function ModuleDetailTabs({ module }) {
    return (
        <Tabs defaultValue="lessons" className="w-full">
            <TabsList variant="line" className="w-full justify-start border-b rounded-none bg-transparent px-0 gap-4">
                <TabsTrigger value="overview" className="text-base px-1 pb-3 data-[state=active]:font-semibold">
                    Overview
                </TabsTrigger>
                <TabsTrigger value="lessons" className="text-base px-1 pb-3 data-[state=active]:font-semibold">
                    Lessons
                </TabsTrigger>
            </TabsList>

            {/* Lessons Tab */}
            <TabsContent value="lessons" className="pt-8">
                {!module.lessons || module.lessons.length === 0 ? (
                    <div className="text-center py-16 text-muted-foreground">
                        <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-30" />
                        <p className="text-lg font-medium">No lessons yet</p>
                        <p className="text-sm mt-1">Add lessons to this module to build your course content.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <p className="text-muted-foreground text-sm mb-6">
                            {module.lessons.length} lesson(s) in this module
                        </p>

                        {module.lessons.map((lesson, idx) => {
                            const isVideo = lesson.type === "video"
                            const thumbnail = lesson.videoLesson?.video?.thumbnailUrl
                            const videoDuration = lesson.videoLesson?.video?.duration

                            return (
                                <Link
                                    href={`/lesson/${lesson.id}`}
                                    key={lesson.id}
                                    className="group flex items-center gap-4 rounded-xl border p-4 hover:bg-accent/50 hover:border-primary/30 transition-all duration-200"
                                >
                                    {/* Thumbnail / Type Icon */}
                                    <div className="relative w-24 h-16 rounded-lg overflow-hidden bg-muted shrink-0">
                                        {thumbnail ? (
                                            <>
                                                <Image
                                                    src={thumbnail}
                                                    alt={lesson.title}
                                                    fill
                                                    className="object-cover"
                                                />
                                                {/* Play overlay for video */}
                                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Play className="h-6 w-6 text-white fill-white" />
                                                </div>
                                                {/* Duration badge */}
                                                {videoDuration && (
                                                    <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                                                        {formatDuration(videoDuration)}
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="flex items-center justify-center h-full">
                                                {isVideo ? (
                                                    <Video className="h-6 w-6 text-muted-foreground/40" />
                                                ) : (
                                                    <Type className="h-6 w-6 text-muted-foreground/40" />
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Lesson Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs text-muted-foreground font-medium">
                                                {String(lesson.sequence || idx + 1).padStart(2, '0')}
                                            </span>
                                            <Badge variant={isVideo ? "default" : "secondary"} className="text-[10px] px-1.5 py-0 capitalize">
                                                {lesson.type}
                                            </Badge>
                                            {lesson.isFree && (
                                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-green-600 border-green-300">
                                                    Free
                                                </Badge>
                                            )}
                                        </div>

                                        <h4 className="font-medium text-sm group-hover:text-primary transition-colors truncate">
                                            {lesson.title}
                                        </h4>

                                        {/* Meta row */}
                                        <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                                            {isVideo && videoDuration && (
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {formatDuration(videoDuration)}
                                                </span>
                                            )}
                                            {lesson.duration && (
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {lesson.duration} min
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Arrow */}
                                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                                </Link>
                            )
                        })}
                    </div>
                )}
            </TabsContent>

            {/* Overview Tab */}
            <TabsContent value="overview" className="pt-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left: Description & Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Description</h3>
                            {module.description ? (
                                <DescriptionMarkdown value={module.description} className="prose-sm" />
                            ) : (
                                <p className="text-muted-foreground italic">
                                    No description available for this module.
                                </p>
                            )}
                        </div>

                        {/* Metadata */}
                        {module.metadata && (
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Additional Metadata</h3>
                                <pre className="text-sm bg-muted p-4 rounded-lg overflow-auto">
                                    {JSON.stringify(module.metadata, null, 2)}
                                </pre>
                            </div>
                        )}
                    </div>

                    {/* Right: Details Sidebar */}
                    <div className="space-y-5">
                        <DetailRow icon={<ListOrdered className="h-4 w-4" />} label="Sequence" value={`#${module.sequence}`} />
                        <DetailRow icon={<GraduationCap className="h-4 w-4" />} label="Lessons" value={module._count?.lessons || 0} />
                        {module.duration > 0 && (
                            <DetailRow icon={<Clock className="h-4 w-4" />} label="Duration" value={`${module.duration} min`} />
                        )}
                        <DetailRow icon={<FileText className="h-4 w-4" />} label="Status" value={<Badge variant={module.status === "published" ? "default" : "secondary"} className="capitalize text-xs">{module.status}</Badge>} />
                        <DetailRow icon={<Calendar className="h-4 w-4" />} label="Created" value={new Date(module.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} />
                        <DetailRow icon={<Calendar className="h-4 w-4" />} label="Updated" value={new Date(module.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} />
                    </div>
                </div>
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
