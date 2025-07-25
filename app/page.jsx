import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-12 lg:p-24 space-y-6 bg-gradient-to-br from-gray-50 to-gray-100">
      <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-8 text-center leading-tight">
        Welcome to the Acadma Certifation App
      </h1>
      <p className="text-lg text-gray-600 mb-10 text-center max-w-prose">
        Choose how you'd like to input your data to get started.
      </p>
      <div className="flex flex-col sm:flex-row gap-6 w-full max-w-md">
        <Link href="/upload" passHref>
          <Button className="w-full py-7 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 bg-primary text-primary-foreground hover:bg-primary/90">
            Upload a CSV File
          </Button>
        </Link>
        <Button
          className="w-full py-7 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 bg-secondary text-secondary-foreground hover:bg-secondary/90"
          disabled
        >
          Enter Details Manually (Coming Soon)
        </Button>
      </div>
    </main>
  )
}
