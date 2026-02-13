"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { Upload, FileSpreadsheet, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import * as XLSX from "xlsx"

interface ParsedVideo {
    title: string
    description: string
    externalUrl: string
    duration: string
    videoQuality: string
    isShort: boolean
    status?: "pending" | "valid" | "invalid"
    error?: string
}

const BulkVideoUpload = () => {
    const [file, setFile] = useState<File | null>(null)
    const [valid, setValid] = useState<number | null>(null)
    const [parsedData, setParsedData] = useState<ParsedVideo[]>([])
    const [isParsing, setIsParsing] = useState(false)
    const [dragActive, setDragActive] = useState(false)

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true)
        } else if (e.type === "dragleave") {
            setDragActive(false)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0])
        }
    }

    const handleFileSelect = (selectedFile: File) => {
        const validTypes = [
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "text/csv"
        ]

        if (!validTypes.includes(selectedFile.type)) {
            toast.error("Please upload a valid Excel or CSV file")
            return
        }

        setFile(selectedFile)
        setParsedData([])
        toast.success(`File "${selectedFile.name}" selected`)
    }

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0])
        }
    }

    const validateRow = (row: ParsedVideo): ParsedVideo => {
        const errors: string[] = []

        if (!row.title || row.title.length < 3) {
            errors.push("Title must be at least 3 characters")
        }
        if (!row.externalUrl || !row.externalUrl.startsWith("http")) {
            errors.push("Invalid URL")
        }
        if (!row.duration) {
            errors.push("Duration is required")
        }

        return {
            ...row,
            status: errors.length > 0 ? "invalid" : "valid",
            error: errors.join(", ")
        }
    }

    const parseExcel = async () => {
        if (!file) {
            toast.error("Please select a file first")
            return
        }

        setIsParsing(true)

        try {
            const data = await file.arrayBuffer()
            const workbook = XLSX.read(data, { type: "array" })
            const sheetName = workbook.SheetNames[0]
            const worksheet = workbook.Sheets[sheetName]
            const jsonData = XLSX.utils.sheet_to_json<any>(worksheet)

            console.log("Json data for excel sheet ==> ", jsonData)

            const parsed: ParsedVideo[] = jsonData.map((row) => ({
                title: row.title || row.Title || "",
                description: row.description || row.Description || "",
                externalUrl: row.externalUrl || row.ExternalUrl || row.url || row.URL || "",
                duration: row.duration || row.Duration || "",
                videoQuality: row.videoQuality || row.VideoQuality || "720",
                isShort: row.isShort === true || row.IsShort === true || row.isShort === "true" || false,
            }))

            const validatedData = parsed.map(validateRow)
            setParsedData(validatedData)

            const validCount = validatedData.filter(v => v.status === "valid").length
            setValid(validCount);
            toast.success(`Parsed ${validatedData.length} videos (${validCount} valid)`)
        } catch (error) {
            console.error("Parse error:", error)
            toast.error("Failed to parse Excel file")
        } finally {
            setIsParsing(false)
        }
    }

    const handleBulkUpload = async () => {
        const validVideos = parsedData.filter(v => v.status === "valid")

        if (validVideos.length === 0) {
            toast.error("No valid videos to upload")
            return
        }

        toast.info(`Uploading ${validVideos.length} videos...`)
        // TODO: Implement bulk upload API call
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Upload Excel File</CardTitle>
                    <CardDescription>
                        Upload an Excel file with columns: title, description, externalUrl, duration, videoQuality, isShort
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div
                        className={`relative border-2 border-dashed rounded-lg p-12 transition-colors ${dragActive
                            ? "border-primary bg-primary/5"
                            : "border-muted-foreground/25 hover:border-muted-foreground/50"
                            }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        <input
                            type="file"
                            id="file-upload"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            accept=".xlsx,.xls,.csv"
                            onChange={handleFileInput}
                        />
                        <div className="flex flex-col items-center justify-center space-y-4 text-center">
                            <div className="p-4 bg-primary/10 rounded-full">
                                {file ? (
                                    <FileSpreadsheet className="w-10 h-10 text-primary" />
                                ) : (
                                    <Upload className="w-10 h-10 text-primary" />
                                )}
                            </div>
                            <div>
                                <p className="text-lg font-semibold">
                                    {file ? file.name : "Drop your Excel file here"}
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    or click to browse (Excel or CSV)
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            onClick={parseExcel}
                            disabled={!file || isParsing}
                            className="flex-1"
                            variant="gradient"
                        >
                            {isParsing ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Parsing...
                                </>
                            ) : (
                                "Parse File"
                            )}
                        </Button>
                        {parsedData.length > 0 && (
                            <Button
                                onClick={handleBulkUpload}
                                disabled={parsedData.filter(v => v.status === "valid").length === 0}
                                className="flex-1"
                            >
                                Upload {parsedData.filter(v => v.status === "valid").length} Videos
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {parsedData.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Parsed Videos ({parsedData.length})
                            <span className="text-green-300" >  {valid !== null && `${valid} valid`} </span>
                            <span className="text-red-300" >  {valid !== null && `${parsedData.length - valid} Invalid`} </span>
                        </CardTitle>
                        <CardDescription>
                            Review the parsed data before uploading
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="border rounded-lg overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">Status</TableHead>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Video URL</TableHead>
                                        <TableHead>Thumbnail URL</TableHead>
                                        <TableHead>Duration</TableHead>
                                        <TableHead>Quality</TableHead>
                                        <TableHead>Short</TableHead>
                                        <TableHead>Error</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {parsedData.map((video, index) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                {video.status === "valid" ? (
                                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                                ) : (
                                                    <AlertCircle className="w-5 h-5 text-destructive" />
                                                )}
                                            </TableCell>
                                            <TableCell className="font-medium max-w-[200px] truncate">
                                                {video.title}
                                            </TableCell>
                                            <TableCell className="max-w-[200px] truncate text-muted-foreground">
                                                {video.description}
                                            </TableCell>
                                            <TableCell className="max-w-[150px] truncate text-xs">
                                                {video.externalUrl}
                                            </TableCell>
                                            <TableCell>{video.duration}</TableCell>
                                            <TableCell>{video.videoQuality}</TableCell>
                                            <TableCell>{video.isShort ? "Yes" : "No"}</TableCell>
                                            <TableCell className="text-xs text-destructive max-w-[150px] truncate">
                                                {video.error}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

export default BulkVideoUpload