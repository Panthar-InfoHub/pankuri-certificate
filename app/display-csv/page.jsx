"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle, FileSpreadsheet, Home, Loader2, SendHorizonal, Trash2, XCircle } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"

export default function DisplayCsvPage() {
  const [csvData, setCsvData] = useState([])
  const [headers, setHeaders] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploadLoading, setUploadLoading] = useState(false)


  useEffect(() => {
    const stored = localStorage.getItem("uploadedCsvData")
    if (stored) {
      const { headers, rows } = JSON.parse(stored)
      setHeaders(headers)
      setCsvData(rows)
      toast.success("CSV data loaded successfully!")
    } else {
      toast.error("No CSV data found. Please upload a file first.")
    }
    setLoading(false)
  }, [])


  useEffect(() => {
    if (csvData.length > 0) {
      localStorage.setItem("uploadedCsvData", JSON.stringify({ headers, rows: csvData }))
    }
  }, [csvData, headers])

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <p>Loading CSV data...</p>
      </main>
    )
  }

  const handleClick = async () => {
    setUploadLoading(true)
    try {
      console.log("\n\n CSV data ==> ", csvData)

      for (const item of csvData) {
        const response = await fetch('/api/upload-certificate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ student: item }),
        })

        const res = await response.json()
        console.log("certificate response ==> ", res)

        setCsvData(prev =>
          prev.map(row =>
            row.id === item.id
              ? { ...row, certificateStatus: res.success ? "success" : "failed" }
              : row
          )
        )

        if (res.success) {
          toast.success(`Certificate of student name : ${item.Name} send successfully`)
        } else {
          toast.error(res.message)
        }
      }
      // localStorage.removeItem("uploadedCsvContent")
      // setCsvData([])
    } catch (error) {
      toast.error(`Error while sending certificate: ${error.message}`)
    } finally {
      setUploadLoading(false)
    }
  }

  const renderCertificateStatus = (status) => {
    switch (status) {
      case "success":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100 animate-pulse">
            <CheckCircle className="w-3 h-3 mr-1" />
            Yes
          </Badge>
        )
      case "failed":
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100 animate-pulse">
            <XCircle className="w-3 h-3 mr-1" />
            No
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-600 hover:bg-gray-100">
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            Pending
          </Badge>
        )
    }
  }


  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900 relative overflow-hidden">
      {/* Subtle background gradients for light mode */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-100/50 via-transparent to-orange-100/50 opacity-70" />

      <div className="relative flex min-h-screen flex-col gap-8 items-center p-4 sm:p-8 md:p-12 lg:p-24">
        <div className="flex items-center gap-5" >
          <Link href={"/"}  >
            <Home className="size-8 text-purple-500" />
          </Link>
          <h1 className="text-4xl sm:text-5xl font-bold text-center text-gray-900 flex items-center gap-4">Uploaded
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
              CSV
            </span>
            Content
          </h1>
        </div>


        {csvData.length > 0 ? (
          <Card className="w-full max-w-6xl bg-white border-gray-200 shadow-xl !pt-0">
            <CardHeader className="bg-gray-50 border-b border-gray-200 pt-4">
              <CardTitle className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                <FileSpreadsheet className="h-6 w-6 text-[#8A2BE2]" />
                CSV Data Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="overflow-x-auto max-h-[60vh] border border-gray-200 rounded-lg bg-white">
                <Table>
                  <TableHeader className="sticky top-0 bg-gray-100 z-10">
                    <TableRow className="border-gray-200 hover:bg-transparent">
                      {headers.map((header, index) => (
                        <TableHead
                          key={index}
                          className="min-w-[120px] text-gray-700 font-bold text-left px-4 py-3 capitalize"
                        >
                          {header}
                        </TableHead>
                      ))}
                      <TableHead className="min-w-[140px] text-gray-700 font-bold text-left px-4 py-3">
                        Certificate Send
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {csvData.map((row, rowIndex) => (
                      <TableRow
                        key={rowIndex}
                        className="border-gray-100 hover:bg-gray-50 transition-colors duration-200"
                      >
                        {headers.map((header, colIndex) => (
                          <TableCell key={colIndex} className="px-4 py-3 text-gray-800 font-medium">
                            {row[header]}
                          </TableCell>
                        ))}
                        <TableCell className="px-4 py-3">{renderCertificateStatus(row.certificateStatus)}</TableCell>

                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50 border-t border-gray-200 flex justify-between items-center">
              <Button
                onClick={handleClick}
                disabled={uploadLoading}
                className="mt-4 py-6 px-8 text-lg font-semibold bg-gradient-to-r from-[#8A2BE2] to-[#FF69B4] hover:from-[#943be7] hover:to-[#ff79bf] shadow-lg shadow-[#8A2BE2]/30 text-white cursor-pointer hover:scale-[0.9] duration-300 ease-in-out"
              >
                {uploadLoading ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-5 w-5" />
                    Generating Certificates...
                  </>
                ) : (
                  <>
                    Generate Certificates
                    < SendHorizonal />
                  </>
                )}
              </Button>
              <Button
                onClick={() => {
                  localStorage.removeItem("uploadedCsvData")
                  setCsvData([])
                }}
                className="mt-4 py-6 px-8 text-lg font-semibold bg-gray-600 hover:to-[#ff79bf] shadow-lg shadow-[#8A2BE2]/30 text-white cursor-pointer hover:scale-[0.9] duration-300 ease-in-out"
              >
                Delete Old Data
                <Trash2 />
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <div className="text-center mt-8 space-y-6">
            <p className="text-xl text-gray-600 max-w-md mx-auto">
              No CSV data found or the file was empty. Please go back and upload a file.
            </p>
            <Button className="py-6 px-8 text-lg font-semibold bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 shadow-lg text-white transition-all duration-300 transform hover:-translate-y-1">
              <Link href="/" className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Home Page
              </Link>
            </Button>
          </div>
        )}
      </div>
    </main >
  )
}
