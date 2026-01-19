import { CategoriesTable } from "@/components/category/categories-table"
import { CategoryFilter } from "@/components/category/category-filter"
import { CreateCategoryDialog } from "@/components/category/create-category-dialog"
import { Button } from "@/components/ui/button"
import { TableSkeleton } from "@/components/ui/skeleton-loader"
import { getFlatCategories } from "@/lib/backend_actions/category"
import { Loader2, Plus } from "lucide-react"
import { Suspense } from "react"


export default async function CategoriesPage({ searchParams }) {


  const searchP = await searchParams

  const categoriesPromise = getFlatCategories({
    limit: searchP.limit || 100,
    status: searchP.status || "active",
    search: searchP.search || undefined,
    page: searchP.page || 1,
  })

  return (
    <div className="container mx-auto px-6 py-24">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gradient-brand">Categories</h1>
          <p className="text-muted-foreground mt-2">Manage your course categories and hierarchy</p>
        </div>

        <Suspense fallback={<Button disabled variant="outline"> <Loader2 className="animate-spin" /> </Button>}>
          <CreateCategoryWrapper promise={categoriesPromise} />
        </Suspense>
      </div>

      <CategoryFilter />

      <Suspense fallback={<TableSkeleton rows={4} columns={5} />}>
        <CategoriesTableWrapper promise={categoriesPromise} />
      </Suspense>
    </div>
  )
}




async function CreateCategoryWrapper({ promise }) {
  const result = await promise
  const categories = result.success ? result.data.data : []
  const parentCategories = categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    sequence: cat.sequence
  }))
  return (
    <CreateCategoryDialog parentCategories={parentCategories}>
      <Button variant="gradient">
        <Plus className="mr-2 h-4 w-4" />
        Create Category
      </Button>
    </CreateCategoryDialog>
  )
}


async function CategoriesTableWrapper({ promise }) {
  const result = await promise
  const categories = result.success ? result.data.data : []
  // Re-derive parentCategories for the table if needed, or pass separately
  const parentCategories = categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    sequence: cat.sequence
  }))

  const pagination = result.success ? result.data.pagination : null
  return <CategoriesTable categories={categories} parentCategories={parentCategories} pagination={pagination} />
}