"use client" // This component needs client-side interactivity

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import toast from "react-hot-toast"

export default function DisplayCsvPage() {
  const [csvData, setCsvData] = useState([])
  const [headers, setHeaders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const content = localStorage.getItem("uploadedCsvContent")
    if (content) {
      try {
        const lines = content.split("\n").filter((line) => line.trim() !== "")
        if (lines.length > 0) {
          // Simple CSV parsing: assumes comma-separated values and first line as headers
          const parsedHeaders = lines[0].split(",").map((h) => h.trim())
          setHeaders(parsedHeaders)

          const parsedData = lines.slice(1).map((line) => {
            const values = line.split(",").map((v) => v.trim())
            // Map values to header keys
            return parsedHeaders.reduce((obj, header, index) => {
              obj[header] = values[index] || "" // Assign empty string if value is missing
              return obj
            }, {})
          })
          setCsvData(parsedData)
          toast.success("CSV data loaded successfully!")
        } else {
          toast.error("The uploaded CSV file is empty.")
        }
      } catch (error) {
        console.error("Error parsing CSV:", error)
        toast.error("Failed to parse CSV content. Please check the file format.")
      }
    } else {
      toast.error("No CSV data found. Please upload a file first.")
    }
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <p>Loading CSV data...</p>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-8 md:p-12 lg:p-24 bg-gradient-to-br from-gray-50 to-gray-100">
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8 text-center">Uploaded CSV Content</h1>

      {csvData.length > 0 ? (
        <Card className="w-full max-w-5xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-gray-800">CSV Data Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto max-h-[60vh] border rounded-md">
              <Table>
                <TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
                  <TableRow>
                    {headers.map((header, index) => (
                      <TableHead key={index} className="min-w-[120px] text-gray-700 font-bold text-left px-4 py-3">
                        {header}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {csvData.map((row, rowIndex) => (
                    <TableRow key={rowIndex} className="hover:bg-gray-50 transition-colors">
                      {headers.map((header, colIndex) => (
                        <TableCell key={colIndex} className="px-4 py-2 text-gray-800">
                          {row[header]}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <p className="text-lg text-muted-foreground text-center mt-8">
          No CSV data found or the file was empty. Please go back and upload a file.
        </p>
      )}

      <Button className="mt-10 py-6 px-8 text-lg font-semibold shadow-md hover:shadow-lg transition-all duration-300 ease-in-out bg-green-600 hover:bg-green-700 text-white">
        Generate Certificate (No Functionality)
      </Button>
    </main>
  )
}
