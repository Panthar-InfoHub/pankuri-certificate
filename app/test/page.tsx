import { CreateContentDialog } from "@/components/content-wizard/create-content-dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

const page = () => {
    return (
        <main className="min-h-screen">
            <div className="container mx-auto px-6 py-24">

                <div className="mb-6">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                        Video <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">Library</span>
                    </h1>
                    <p className="text-muted-foreground">Manage and organize your video content</p>
                </div>
                <CreateContentDialog>
                    <Button variant="gradient">
                        <Plus className="w-4 h-4 mr-2" />
                        Upload Content
                    </Button>
                </CreateContentDialog>
            </div>
        </main>
    )
}

export default page