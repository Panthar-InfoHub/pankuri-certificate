'use client';

import { useEffect, useState } from 'react';
import ReactPlayer from 'react-player';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getVideoPlaybackUrl } from '@/lib/action';


export function VideoPlayer({ isOpen, onClose, video }) {
    const [signedUrl, setSignedUrl] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isOpen || !video.id) {
            setSignedUrl(null);
            return;
        }

        let isMounted = true;

        const fetchUrl = async () => {
            setLoading(true);

            const result = await getVideoPlaybackUrl(video.playbackUrl);

            if (!isMounted) return;
            console.log("result ==> ", result)

            if (result.success && result.url) {
                setSignedUrl(result.url);
            } else {
                toast.error(result.error || 'Failed to load video');
                onClose();
            }

            setLoading(false);
        };

        fetchUrl();

        return () => {
            isMounted = false;
        };
    }, [isOpen, video.id]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>{video.title}</DialogTitle>
                </DialogHeader>

                <div className="aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center">
                    {loading ? (
                        <Loader2 className="w-8 h-8 animate-spin text-white" />
                    ) : signedUrl ? (
                        <ReactPlayer
                            // url={signedUrl}
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
