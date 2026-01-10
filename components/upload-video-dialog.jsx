"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { useState } from "react"
import { VideoUploadForm } from "./video-upload-form"
import { ScrollArea } from "./ui/scroll-area"

export default function UploadVideoDialog({ children }) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="max-w-5xl w-[95vw]">
                <ScrollArea className="max-h-[85vh] pr-4">
                    <DialogHeader className="mb-4">
                        <DialogTitle>Upload Video</DialogTitle>
                        <DialogDescription>
                            Upload your thumbnail, select video quality, and upload your video file.
                        </DialogDescription>
                    </DialogHeader>

                    <VideoUploadForm onSuccess={() => {
                        setIsOpen(false);
                    }} />
                </ScrollArea>
            </DialogContent>
        </Dialog >
    )
}
