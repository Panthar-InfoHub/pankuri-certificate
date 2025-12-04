import { Suspense } from "react"
import { TrainersTable } from "@/components/trainer/trainers-table"
import { CreateTrainerDialog } from "@/components/trainer/create-trainer-dialog"
import { Button } from "@/components/ui/button"
import { TableSkeleton, PageHeaderSkeleton } from "@/components/ui/skeleton-loader"
import { getAllTrainersAdmin } from "@/lib/backend_actions/trainer"
import { Plus } from "lucide-react"

async function TrainersContent() {
  const result = await getAllTrainersAdmin({ limit: 100, status: "active" })
  const trainers = result.success ? result.data : []

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gradient-brand">Trainers</h1>
          <p className="text-muted-foreground mt-2">Manage trainer profiles and specializations</p>
        </div>
        <CreateTrainerDialog>
          <Button variant="gradient">
            <Plus className="mr-2 h-4 w-4" />
            Create Trainer
          </Button>
        </CreateTrainerDialog>
      </div>

      <TrainersTable trainers={trainers} />
    </>
  )
}

export default function TrainersPage() {
  return (
    <div className="container mx-auto px-6 py-24">
      <Suspense fallback={<PageHeaderSkeleton />}>
        <TrainersContent />
      </Suspense>
    </div>
  )
}
