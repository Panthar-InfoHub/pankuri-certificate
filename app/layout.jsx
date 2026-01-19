import Component from "@/components/Navbar"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { Inter } from "next/font/google"
import { Toaster } from "react-hot-toast"; // Import Toaster for notifications
import "./globals.css"



const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Pankhuri Dashboard",
  description: "Manage your Pankhuri Content Platform with ease.",
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
