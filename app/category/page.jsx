import { CategoriesTable } from "@/components/category/categories-table"
import { CreateCategoryDialog } from "@/components/category/create-category-dialog"
import { Button } from "@/components/ui/button"
import { getCategoryTree, getFlatCategories } from "@/lib/backend_actions/category"
import { Plus } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function CategoriesPage() {
  // Fetch categories server-side
  const categoriesResult = await getFlatCategories({ limit: 100, status: "active" })
  const categories = categoriesResult.success ? categoriesResult.data : []

  // Fetch parent categories for the create dialog
  // const treeResult = await getCategoryTree()
  const parentCategories = categoriesResult.success ? categoriesResult.data.map((cat) => ({ id: cat.id, name: cat.name, sequence: cat.sequence })) : []

  return (
    <div className="container mx-auto px-6 py-24">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground mt-2">Manage your course categories and hierarchy</p>
        </div>
        <CreateCategoryDialog parentCategories={parentCategories}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Category
          </Button>
        </CreateCategoryDialog>
      </div>

      <CategoriesTable categories={categories} parentCategories={parentCategories} />
    </div>
  )
}
