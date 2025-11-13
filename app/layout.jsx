import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "react-hot-toast" // Import Toaster for notifications
import { Toaster as Sonner } from "@/components/ui/sonner"
import Component from "@/components/Navbar"


const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Acadma Uploader",
  description: "Upload and Manager Content",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Component />
        {children}
        <Toaster /> {/* Add Toaster component here */}
        <Sonner position="top-center" richColors />
      </body>
    </html>
  )
}
