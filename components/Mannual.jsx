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


            const item = {
                Name: formData.get("name"),
                course: formData.get("course"),
                date: formData.get("date"),
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
                toast.success(`Certificate of student name : ${item.name} send successfully`)
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
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Course Registration</DialogTitle>
                        <DialogDescription>Fill in the details below to register for a course.</DialogDescription>
                    </DialogHeader>
                    <form action={formAction}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    placeholder="Enter your full name"
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="course">Course</Label>
                                <Input
                                    id="course"
                                    name="course"
                                    placeholder="Enter course name"
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="date">Date</Label>
                                <Input
                                    id="date"
                                    name="date"
                                    type="date"
                                    required
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isPending} > {isPending ? <> <Loader2 className="animate-spin" /> </> : "Submit"} </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
