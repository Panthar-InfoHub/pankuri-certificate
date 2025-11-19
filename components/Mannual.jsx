"use client"


import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { File, Loader2 } from "lucide-react"
import { useActionState, useState } from "react"
import toast from "react-hot-toast"

export default function Mannual() {

    const [open, setOpen] = useState(false)

    const handleSubmission = async (prevData, formData) => {
        try {
            console.log(" Form name =>  ", formData.get("name"))
            console.log(" Form course =>  ", formData.get("course"))
            console.log(" Form date =>  ", formData.get("date"))
            console.log(" Form phone =>  ", formData.get("phone"))


            const item = {
                Name: formData.get("name"),
                course: formData.get("course"),
                date: formData.get("date"),
                phone: formData.get("phone"),
            }

            const response = await fetch('/api/upload-certificate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ student: item }),
            })

            const res = await response.json()
            console.log("certificate response ==> ", res)
            if (res.success) {
                toast.success(`Certificate of student name : ${item.Name} send successfully`)
            } else {
                toast.error(`Error while sending certificate: ${error.message}`)
            }
        } catch (error) {
            toast.error("Error while sending certificate : ", error.message)
        }
    }

    const [state, formAction, isPending] = useActionState(handleSubmission, {})

    return (
        <div className="flex items-center justify-center p-4">
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button className="w-full cursor-pointer py-6 px-8 text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 border-0 shadow-2xl shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 transform hover:-translate-y-1">
                        <File className="mr-2 size-5" />
                        Enter Data Manually
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] bg-white border-gray-200 text-gray-900">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-[#FF69B4] to-[#8A2BE2] bg-clip-text text-transparent">
                            Create Certificate
                        </DialogTitle>
                        <DialogDescription className="text-gray-600">
                            Fill in the details below to create a certificate.
                        </DialogDescription>
                    </DialogHeader>
                    <form action={formAction}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name" className="text-gray-700 font-medium">
                                    Name
                                </Label>
                                <Input
                                    id="name"
                                    name="name"
                                    placeholder="Enter your full name"
                                    required
                                    className="bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-[#8A2BE2] focus:ring-[#8A2BE2]/20"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="course" className="text-gray-700 font-medium">
                                    Course
                                </Label>
                                <Input
                                    id="course"
                                    name="course"
                                    placeholder="Enter course name"
                                    required
                                    className="bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-[#8A2BE2] focus:ring-[#8A2BE2]/20"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="date" className="text-gray-700 font-medium">
                                    Date
                                </Label>
                                <Input
                                    id="date"
                                    name="date"
                                    type="date"
                                    required
                                    className="bg-gray-50 border-gray-300 text-gray-900 focus:border-[#8A2BE2] focus:ring-[#8A2BE2]/20"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="date" className="text-gray-700 font-medium">
                                    Phone Number
                                </Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    type="text"
                                    required
                                    placeholder="Enter phone number"
                                    className="bg-gray-50 border-gray-300 text-gray-900 focus:border-[#8A2BE2] focus:ring-[#8A2BE2]/20"
                                />
                            </div>
                        </div>
                        <DialogFooter className="gap-2 py-4 w-full flex !justify-between !items-center">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpen(false)}
                                className="border-gray-300 bg-white hover:bg-gray-100 text-gray-700 hover:text-gray-900"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isPending}
                                className="bg-gradient-to-r from-[#8A2BE2] to-[#FF69B4] hover:from-[#943be7] hover:to-[#ff79bf] shadow-lg shadow-[#8A2BE2]/30 text-white"
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="animate-spin mr-2 h-4 w-4" />
                                        Processing...
                                    </>
                                ) : (
                                    "Submit"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
