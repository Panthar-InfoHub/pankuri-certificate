"use client"
import { useEffect, useState } from 'react';
import ReactPlayer from 'react-player';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getVideoPlaybackUrl } from '@/lib/action';


export function VideoPlayer({ isOpen, onClose, video, children }) {
    console.log("VideoPlayer video:", video);
    const [open, setOpen] = useState(false);
    const [signedUrl, setSignedUrl] = useState(null);
    const [loading, setLoading] = useState(true);

    const effectiveOpen = typeof isOpen === 'boolean' ? isOpen : open;
    const effectiveOnClose = onClose ? onClose : () => setOpen(false);

    useEffect(() => {
        if (!effectiveOpen || !video.id) {
            setSignedUrl(null);
            return;
        }
        let isMounted = true;
        setLoading(true);

        getVideoPlaybackUrl(video.playbackUrl)
            .then(result => {
                if (!isMounted) return;
                if (result.success && result.url) {
                    setSignedUrl(result.url);
                } else {
                    toast.error(result.error || 'Failed to load video');
                    effectiveOnClose();
                }
                setLoading(false);
            });
        return () => { isMounted = false; };
    }, [effectiveOpen, video.id]);

    return (
        <Dialog open={effectiveOpen} onOpenChange={val => {
            setOpen(val);
            if (onClose) onClose(val);
        }}>
            {children && <DialogTrigger asChild>{children}</DialogTrigger>}
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>{video.title}</DialogTitle>
                </DialogHeader>
                <div className="aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center">
                    {loading ? (
                        <Loader2 className="w-8 h-8 animate-spin text-white" />
                    ) : signedUrl ? (
                        <ReactPlayer
                            src={signedUrl}
                            controls
                            playing
                            width="100%"
                            height="100%"
                            config={{
                                file: {
                                    attributes: {
                                        poster: video.thumbnailUrl,
                                    },
                                },
                            }}
                        />
                    ) : null}
                </div>
            </DialogContent>
        </Dialog>
    );
}
