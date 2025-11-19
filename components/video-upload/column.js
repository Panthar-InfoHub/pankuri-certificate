"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Play, Download, Trash2, MoreHorizontal, Edit } from "lucide-react"
import Image from "next/image"
import { DeleteVideoDialog } from "./delete-video-dialog"
import { toast } from "sonner"

export const videoColumns = [
    {
        accessorKey: "thumbnailUrl",
        header: "Thumbnail",
        cell: ({ row }) => (
            <Image
                src={row.original.thumbnailUrl || "/placeholder.svg"}
                alt={row.original.title || "Video"}
                width={80}
                height={45}
                className="rounded object-cover"
            />
        ),
    },
    {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => <div className="max-w-xs truncate font-medium">{row.original.title || "Untitled"}</div>,
    },
    {
        accessorKey: "duration",
        header: "Duration",
        cell: ({ row }) => {
            const seconds = row.original.duration
            const minutes = Math.floor(seconds / 60)
            const secs = seconds % 60
            return `${minutes}:${secs.toString().padStart(2, "0")}`
        },
    },
    {
        accessorKey: "quality",
        header: "Quality",
        cell: ({ row }) => <Badge variant="secondary">{row.original.quality}</Badge>,
    },
    {
        accessorKey: "uploadedAt",
        header: "Uploaded",
        cell: ({ row }) => {
            if (!row.original.uploadedAt) return "—"
            return new Date(row.original.uploadedAt).toLocaleDateString()
        },
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
            const handleDownload = async () => {

                console.log("Download:", row.original)
                const video = row.original

                if (video.videoUrl) {
                    try {
                        const response = await fetch(video.videoUrl)
                        const blob = await response.blob()
                        const url = window.URL.createObjectURL(blob)
                        const link = document.createElement("a")
                        link.href = url
                        link.download = `${video.title || "video"}.mp4`
                        document.body.appendChild(link)
                        link.click()
                        document.body.removeChild(link)
                        window.URL.revokeObjectURL(url)
                        toast.success("Download started")
                    } catch (error) {
                        toast.error("Failed to download video")
                        console.error("Download error:", error)
                    }
                } else {
                    toast.error("Video URL not available")
                }
            }
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                            <span className="sr-only">Open menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                            onClick={() => {
                                console.log("Play:", row.original._id)
                            }}
                        >
                            <Play className="w-4 h-4 mr-2" />
                            Play
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => {
                                console.log("Edit:", row.original._id)
                            }}
                        >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleDownload}>
                            <Download className="w-4 h-4 mr-2" />
                            Download
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DeleteVideoDialog video={row.original}>
                            <DropdownMenuItem
                                onSelect={(e) => e.preventDefault()}
                                className="text-destructive focus:text-destructive"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                            </DropdownMenuItem>
                        </DeleteVideoDialog>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]
