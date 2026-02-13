import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import UploadVideoDialog from '@/components/upload-video-dialog'
import BulkVideoUpload from '@/components/video-upload/bulk-video-upload'
import { videoColumns } from '@/components/video-upload/column'
import { DataTable } from '@/components/video-upload/data-table'
import { getAllVideos } from '@/lib/backend_actions/videos'
import { Plus, Upload } from 'lucide-react'

const page = async () => {

    const res = await getAllVideos()
    const videos = res.success ? res.data : []

    return (
        <main className="min-h-screen">
            <div className="container mx-auto px-6 py-24">

                <div className="mb-6">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                        Video <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">Library</span>
                    </h1>
                    <p className="text-muted-foreground">Manage and organize your video content</p>
                </div>



                <div className="flex justify-end mb-4">
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

                {/* <Tabs defaultValue="single" className="w-full">
                    <TabsList className="grid w-full max-w-md grid-cols-2">
                        <TabsTrigger value="single" className="gap-2">
                            <Plus className="w-4 h-4" />
                            Upload Video
                        </TabsTrigger>
                        <TabsTrigger value="bulk" className="gap-2">
                            <Upload className="w-4 h-4" />
                            Bulk Upload
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="single" className="mt-6">
                        <div className="flex justify-end mb-4">
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
                    </TabsContent>

                    <TabsContent value="bulk" className="mt-6">
                        <BulkVideoUpload />
                    </TabsContent>
                </Tabs> */}
            </div>
        </main>
    )
}

export default page