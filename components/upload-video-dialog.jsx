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
            <DialogContent>
                <ScrollArea className="max-w-2xl max-h-[90vh]  rounded-md ">
                    <DialogHeader>
                        <DialogTitle className="space-y-2" >Upload Video</DialogTitle>
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
