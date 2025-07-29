import Link from "next/link"
import { Button } from "@/components/ui/button"
import Mannual from "@/components/Mannual"
import { Upload } from "lucide-react"

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-12 lg:p-24 space-y-6 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="space-y-6">
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight flex gap-6 items-center">
          <span className=" ">
            Acadma
          </span>
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
            Certification
          </span>
          <span className="text-4xl sm:text-5xl lg:text-6xl">Platform</span>
        </h1>

        <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
          The delightfully smart certification platform. Streamline your academic credentials with our modern,
          intuitive interface.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-6 justify-center items-center w-full">
        <Link href="/upload" passHref>
          <Button className="w-full cursor-pointer py-6 px-8 text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 border-0 shadow-2xl shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 transform hover:-translate-y-1">
            <Upload className="mr-2 size-5" />
            Upload a CSV File
          </Button>
        </Link>
        <Mannual />
      </div>
    </main>
  )
}
