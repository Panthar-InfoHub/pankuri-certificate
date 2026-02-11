"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import DescriptionMarkdown from "@/components/lesson/description_markdown"
import LessonDescriptionDialog from "@/components/lesson/lesson-description-dialog"
import UploadAttachmentDialog from "@/components/lesson/upload-attachment-dialog"
import DeleteAttachmentDialog from "@/components/lesson/delete-attachment-dialog"
import { Clock, Download, Edit, FileIcon, FileText, Paperclip, Play, Trash2, Upload, Video } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

function formatDuration(seconds: number | null | undefined) {
    if (!seconds) return null
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    if (h > 0) return `${h}h ${m}m`
    if (m > 0) return `${m}m ${s}s`
    return `${s}s`
}

export function LessonDetailTabs({ lesson }: { lesson: any }) {
    const isVideo = lesson.type === "video"
    const video = lesson.videoLesson?.video
    const textContent = lesson.textLesson?.content
    const readTime = lesson.textLesson?.estimatedReadTime
    const hasDescription = !!lesson.lessonDescription?.textContent
    const attachments = lesson.lessonAttachments || []

    return (
        <Tabs defaultValue="content" className="w-full">
            <TabsList variant="line" className="w-full justify-start border-b rounded-none bg-transparent px-0 gap-4">
                <TabsTrigger value="content" className="text-base px-1 pb-3 data-[state=active]:font-semibold">
                    {isVideo ? "Video" : "Content"}
                </TabsTrigger>
                <TabsTrigger value="description" className="text-base px-1 pb-3 data-[state=active]:font-semibold">
                    Description
                </TabsTrigger>
                {attachments.length > 0 && (
                    <TabsTrigger value="attachments" className="text-base px-1 pb-3 data-[state=active]:font-semibold gap-2">
                        Attachments
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 ml-1">
                            {attachments.length}
                        </Badge>
                    </TabsTrigger>
                )}
            </TabsList>

            {/* Content Tab */}
            <TabsContent value="content" className="pt-8">
                {isVideo && video ? (
                    <div className="space-y-6 max-w-4xl">
                        {/* Video Thumbnail */}
                        {video.thumbnailUrl && (
                            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-muted group cursor-pointer">
                                <Image
                                    src={video.thumbnailUrl}
                                    alt={video.title}
                                    fill
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                                        <Play className="h-7 w-7 text-foreground ml-1" />
                                    </div>
                                </div>
                                {/* Duration badge */}
                                {video.duration && (
                                    <div className="absolute bottom-3 right-3 bg-black/80 text-white text-xs px-2 py-1 rounded-md font-medium">
                                        {formatDuration(video.duration)}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Video Info */}
                        <div className="space-y-3">
                            <h3 className="text-lg font-semibold">{video.title}</h3>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                {video.duration && (
                                    <span className="flex items-center gap-1.5">
                                        <Clock className="h-3.5 w-3.5" />
                                        {formatDuration(video.duration)}
                                    </span>
                                )}
                                {video.metadata?.quality && (
                                    <Badge variant="outline" className="text-xs">{video.metadata.quality}p</Badge>
                                )}
                                <Badge variant={video.status === "ready" ? "default" : "secondary"} className="text-xs capitalize">
                                    {video.status}
                                </Badge>
                            </div>
                        </div>

                        {/* Video Description (timestamps, products, disclaimer) */}
                        {video.videoDescription && (
                            <div className="space-y-6 pt-4">
                                <Separator />

                                {/* Description text */}
                                {video.videoDescription.description && (
                                    <div>
                                        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">Video Description</h4>
                                        <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
                                            {video.videoDescription.description}
                                        </p>
                                    </div>
                                )}

                                {/* Timestamps */}
                                {video.videoDescription.timestamps && video.videoDescription.timestamps.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">Timestamps</h4>
                                        <div className="space-y-2">
                                            {video.videoDescription.timestamps.map((ts: any, i: number) => (
                                                <div key={i} className="flex items-center gap-3 text-sm">
                                                    <span className="font-mono text-xs bg-muted px-2 py-1 rounded min-w-[50px] text-center">
                                                        {ts.time_interval}
                                                    </span>
                                                    <span className="text-muted-foreground">{ts.time_content}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Products */}
                                {video.videoDescription.products && video.videoDescription.products.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">Products Mentioned</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {video.videoDescription.products.map((product: any, i: number) => (
                                                <a
                                                    key={i}
                                                    href={product.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-3 rounded-lg border p-3 hover:bg-accent/50 transition-colors group"
                                                >
                                                    {product.image && (
                                                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted shrink-0">
                                                            <Image src={product.image} alt={product.name} fill className="object-cover" />
                                                        </div>
                                                    )}
                                                    <span className="text-sm font-medium group-hover:text-primary transition-colors">{product.name}</span>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Disclaimer */}
                                {video.videoDescription.disclaimer && (
                                    <div className="bg-muted/50 rounded-lg p-4 text-xs text-muted-foreground">
                                        <span className="font-medium text-foreground">Disclaimer: </span>
                                        {video.videoDescription.disclaimer}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ) : lesson.type === "text" && textContent ? (
                    <div className="max-w-3xl space-y-4">
                        {readTime && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5" />
                                {readTime} min read
                            </p>
                        )}
                        <div className="prose prose-sm max-w-none" data-color-mode="light">
                            <DescriptionMarkdown value={textContent} />
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-16 text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
                        <p className="text-lg font-medium">No content available</p>
                    </div>
                )}
            </TabsContent>

            {/* Description Tab */}
            <TabsContent value="description" className="pt-8">
                <div className="max-w-3xl space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Lesson Description</h3>
                        <LessonDescriptionDialog lesson={lesson}>
                            <Button variant="outline" size="sm" className="gap-2">
                                <Edit className="h-4 w-4" />
                                {hasDescription ? "Edit" : "Add"} Description
                            </Button>
                        </LessonDescriptionDialog>
                    </div>

                    {hasDescription ? (
                        <div className="prose prose-sm max-w-none">
                            <DescriptionMarkdown value={lesson.lessonDescription.textContent} />
                        </div>
                    ) : (
                        <div className="text-center py-16 text-muted-foreground border rounded-xl">
                            <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
                            <p className="font-medium">No description yet</p>
                            <p className="text-sm mt-1">Add a description to provide an overview of this lesson.</p>
                        </div>
                    )}
                </div>
            </TabsContent>

            {/* Attachments Tab */}
            {attachments.length > 0 && (
                <TabsContent value="attachments" className="pt-8">
                    <div className="max-w-3xl space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">{attachments.length} file(s)</p>
                            <UploadAttachmentDialog lessonId={lesson.id}>
                                <Button variant="outline" size="sm" className="gap-2">
                                    <Upload className="h-4 w-4" />
                                    Upload
                                </Button>
                            </UploadAttachmentDialog>
                        </div>

                        <div className="space-y-2">
                            {attachments.map((attachment: any) => (
                                <div
                                    key={attachment.id}
                                    className="flex items-center gap-4 p-4 rounded-xl border hover:bg-accent/30 transition-colors group"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                        <FileIcon className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm truncate">{attachment.title}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {(attachment.fileSize / 1024 / 1024).toFixed(2)} MB &middot; {attachment.type?.toUpperCase()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <Button variant="ghost" size="sm" asChild>
                                            <a href={attachment.fileUrl} target="_blank" rel="noopener noreferrer">
                                                <Download className="h-4 w-4" />
                                            </a>
                                        </Button>
                                        <DeleteAttachmentDialog attachment={attachment}>
                                            <Button variant="ghost" size="sm">
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </DeleteAttachmentDialog>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </TabsContent>
            )}
        </Tabs>
    )
}
