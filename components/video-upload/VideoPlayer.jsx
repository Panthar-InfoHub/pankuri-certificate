"use client"
import { useEffect, useState } from 'react';
import ReactPlayer from 'react-player';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getVideoPlaybackUrl } from '@/lib/action';


export function VideoPlayer({ isOpen, onClose, video, children }) {
    const [open, setOpen] = useState(false);
    const [signedUrl, setSignedUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    console.log("Video in video player ==> ", video)

    const effectiveOpen = typeof isOpen === 'boolean' ? isOpen : open;
    const effectiveOnClose = onClose ? onClose : () => setOpen(false);

    useEffect(() => {
        if (!effectiveOpen || !video.id) {
            setSignedUrl(null);
            return;
        }
        let isMounted = true;
        setLoading(true);

        if (video.playbackUrl) {
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
                }).catch(error => {
                    console.error('Error fetching video playback URL:', video);
                    if (!isMounted) return;
                    toast.error('Failed to load video');
                    console.error('Error fetching video playback URL:', error);
                }).finally(() => {
                    setLoading(false);
                });
        }

        if (video.externalUrl) {
            // A. If it's a relative string (e.g., "manual-recordings/..."), route it through the proxy
            if (!video.externalUrl.startsWith('http')) {
                getVideoPlaybackUrl(video.externalUrl)
                    .then(result => {
                        if (!isMounted) return;
                        if (result.success && result.url) {
                            setSignedUrl(result.url); // Sets it cleanly to "/api/video/manual-recordings/..."
                        } else {
                            toast.error('Failed to load video');
                            effectiveOnClose();
                        }
                    }).catch(error => {
                        console.error('Error proxying external URL:', error);
                        if (!isMounted) return;
                        toast.error('Failed to load video');
                    }).finally(() => {
                        if (isMounted) setLoading(false);
                    });
            } else {
                // B. If it's a legacy absolute link (e.g., "https://..."), play it directly
                setSignedUrl(video.externalUrl);
                setLoading(false);
            }
            return;
        }
        if (video.storageKey) {
            if (!video.storageKey.startsWith('http')) {
                getVideoPlaybackUrl(video.storageKey)
                    .then(result => {
                        if (!isMounted) return;
                        if (result.success && result.url) {
                            setSignedUrl(result.url);
                        } else {
                            toast.error('Failed to load video');
                            effectiveOnClose();
                        }
                    }).catch(error => {
                        console.error('Error proxying external URL:', error);
                        if (!isMounted) return;
                        toast.error('Failed to load video');
                    }).finally(() => {
                        if (isMounted) setLoading(false);
                    });
            } else {
                // B. If it's a legacy absolute link (e.g., "https://..."), play it directly
                setSignedUrl(video.externalUrl);
                setLoading(false);
            }
            return;
        }
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
