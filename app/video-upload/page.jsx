import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import UploadVideoDialog from '@/components/upload-video-dialog'
import { videoColumns } from '@/components/video-upload/column'
import { DataTable } from '@/components/video-upload/data-table'
import { auth } from '@/lib/auth'
import { getAllVideos } from '@/lib/backend_actions/videos'
import { Plus } from 'lucide-react'

const page = async () => {

    const res = await getAllVideos()
    const videos = res.success ? res.data : []
    console.log("Video upload page getAllVideos ==> ", res)

    return (
        <main className="min-h-screen p-4 sm:p-6 md:p-8 mt-24 ">
            <div className="container mx-auto max-w-7xl space-y-6">

                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                            Video <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">Library</span>
                        </h1>
                        <p className="text-muted-foreground">Manage and organize your video content</p>
                    </div>
                    <UploadVideoDialog>
                        <Button variant="gradient">
                            <Plus className="w-4 h-4 mr-2" />
                            Upload Video
                        </Button>
                    </UploadVideoDialog>
                </div>

                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle>Videos</CardTitle>
                        <CardDescription>Manage your video library</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            columns={videoColumns}
                            data={videos}
                            pagination={{ currentPage: 1, totalPages: 1 }}
                        />
                    </CardContent>
                </Card>
            </div>
        </main>
    )
}

export default page