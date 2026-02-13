"use client"


import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import Image from "next/image"
import { deleteVideo } from "@/lib/backend_actions/videos"



export function DeleteVideoDialog({ children, video }) {

    console.log("Video in delete ==> ", video)
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const handleDelete = () => {
        if (!video.id) {
            toast.error("Video ID is missing")
            return
        }

        startTransition(async () => {
            try {
                const result = await deleteVideo(video.id)

                if (result.success) {
                    toast.success("Video deleted successfully")
                    router.refresh()
                } else {
                    toast.warning(result.error || "Failed to delete video")
                }
            } catch (error) {
                toast.error((error).message || "An unexpected error occurred")
            }
        })
    }

    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Delete Video</DialogTitle>
                    <DialogDescription>This action cannot be undone.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Are you sure you want to delete this video? This will permanently remove the video from your account.
                    </p>

                    <div className="rounded-lg bg-muted p-3 space-y-2">
                        {video.thumbnailUrl && (
                            <Image
                                src={video.thumbnailUrl || "/placeholder.svg"}
                                alt={video.title || "Video"}
                                width={160}
                                height={90}
                                className="rounded object-cover"
                            />
                        )}
                        <p className="text-sm font-medium">{video.title || "Untitled"}</p>
                        <p className="text-sm text-muted-foreground">Quality: {video.quality}</p>
                    </div>

                    <div className="flex gap-2">
                        <DialogClose asChild>
                            <Button type="button" variant="outline" disabled={isPending} className="flex-1 bg-transparent">
                                Cancel
                            </Button>
                        </DialogClose>

                        <Button variant="destructive" disabled={isPending} onClick={handleDelete} className="cursor-pointer flex-1">
                            {isPending ? (
                                <>
                                    <Loader2 className="animate-spin" /> Deleting...
                                </>
                            ) : (
                                "Delete"
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
