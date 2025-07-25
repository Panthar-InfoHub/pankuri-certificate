import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "react-hot-toast" // Import Toaster for notifications

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "CSV Uploader",
  description: "Upload and view CSV files",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster /> {/* Add Toaster component here */}
      </body>
    </html>
  )
}
