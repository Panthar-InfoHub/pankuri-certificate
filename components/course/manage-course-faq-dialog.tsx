"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { createCourseFaq, getAdminFaqs, deleteFaq, updateCourseFaq, reorderFaqs } from "@/lib/backend_actions/faq"
import { ArrowDown, ArrowUp, Check, Edit2, HelpCircle, Loader2, Plus, Trash2, X } from "lucide-react"
import { useEffect, useState, useTransition } from "react"
import { toast } from "sonner"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface ManageCourseFaqDialogProps {
    courseId: string
    children: React.ReactNode
}

export default function ManageCourseFaqDialog({ courseId, children }: ManageCourseFaqDialogProps) {
    const [open, setOpen] = useState(false)
    const [faqs, setFaqs] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isPending, startTransition] = useTransition()

    // Add Form inputs
    const [question, setQuestion] = useState("")
    const [answer, setAnswer] = useState("")

    // Edit state
    const [editingFaqId, setEditingFaqId] = useState<string | null>(null)
    const [editQuestion, setEditQuestion] = useState("")
    const [editAnswer, setEditAnswer] = useState("")

    const loadFaqs = async () => {
        setIsLoading(true)
        const res = await getAdminFaqs({ type: "course", courseId })
        if (res.success) {
            // Sort by order on client if not sorted by API
            const sorted = (res.data || []).sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
            setFaqs(sorted)
        }
        setIsLoading(false)
    }

    useEffect(() => {
        if (open) {
            loadFaqs()
            setQuestion("")
            setAnswer("")
            setEditingFaqId(null)
        }
    }, [open, courseId])

    const handleAddFaq = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!question.trim() || !answer.trim()) {
            toast.error("Question and answers are required")
            return
        }

        startTransition(async () => {
            if (editingFaqId) {
                // Update mode
                const res = await updateCourseFaq(editingFaqId, { question, answer })
                if (res.success) {
                    toast.success("FAQ updated successfully")
                    setQuestion("")
                    setAnswer("")
                    setEditingFaqId(null)
                    loadFaqs()
                } else {
                    toast.error(res.error || "Failed to update FAQ")
                }
            } else {
                // Create mode
                const res = await createCourseFaq({ courseId, question, answer, isActive: true, order: faqs.length })
                if (res.success) {
                    toast.success("FAQ added successfully")
                    setQuestion("")
                    setAnswer("")
                    loadFaqs()
                } else {
                    toast.error(res.error || "Failed to add FAQ")
                }
            }
        })
    }

    const startEdit = (faq: any, e: React.MouseEvent) => {
        e.stopPropagation()
        setEditingFaqId(faq.id)
        setQuestion(faq.question)
        setAnswer(faq.answer)
    }

    const handleMove = async (index: number, direction: number, e: React.MouseEvent) => {
        e.stopPropagation()
        const newIndex = index + direction
        if (newIndex < 0 || newIndex >= faqs.length) return

        const updatedFaqs = [...faqs]
        const temp = updatedFaqs[index]
        updatedFaqs[index] = updatedFaqs[newIndex]
        updatedFaqs[newIndex] = temp

        setFaqs(updatedFaqs) // Client view updates

        const reorderPayload = updatedFaqs.map((f, i) => ({ id: f.id, order: i }))
        const res = await reorderFaqs(reorderPayload)
        if (!res.success) {
            toast.error("Failed to update order")
            loadFaqs()
        }
    }

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        const res = await deleteFaq(id)
        if (res.success) {
            toast.success("FAQ deleted")
            setFaqs(faqs.filter(f => f.id !== id))
        } else {
            toast.error(res.error || "Failed to delete FAQ")
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <HelpCircle className="h-5 w-5 text-indigo-500" />
                        Manage Course FAQs
                    </DialogTitle>
                    <DialogDescription>
                        Display key QA items configured natively for this course setup.
                    </DialogDescription>
                </DialogHeader>

                {/* Add/Edit Form */}
                <form onSubmit={handleAddFaq} className="space-y-3 bg-muted/40 p-3 rounded-lg border">
                    <p className="text-sm font-semibold">{editingFaqId ? "Edit FAQ" : "Add New FAQ"}</p>
                    <div className="space-y-2">
                        <Input 
                           placeholder="Question" 
                           value={question} 
                           onChange={e => setQuestion(e.target.value)} 
                           disabled={isPending}
                        />
                        <Textarea 
                           placeholder="Answer" 
                           value={answer} 
                           onChange={e => setAnswer(e.target.value)} 
                           disabled={isPending}
                           rows={3}
                        />
                    </div>
                    
                    <div className="flex gap-2">
                        {editingFaqId && (
                            <Button type="button" size="sm" variant="outline" className="flex-1 gap-1" onClick={() => { setEditingFaqId(null); setQuestion(""); setAnswer(""); }}>
                                <X className="h-4 w-4" /> Cancel
                            </Button>
                        )}
                        <Button type="submit" size="sm" disabled={isPending || !question.trim() || !answer.trim()} className="flex-2 w-full gap-1" variant={editingFaqId ? "gradient" : "default"}>
                            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                            {editingFaqId ? "Update FAQ" : "Add FAQ"}
                        </Button>
                    </div>
                </form>

                {/* List View */}
                <div className="mt-4">
                    <p className="text-sm font-semibold mb-2 text-muted-foreground">Existing FAQs ({faqs.length})</p>
                    {isLoading ? (
                        <div className="py-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                    ) : faqs.length === 0 ? (
                        <p className="text-xs text-center text-muted-foreground py-6 bg-muted/20 rounded-lg border border-dashed">No FAQs configured yet.</p>
                    ) : (
                        <Accordion type="single" collapsible className="w-full space-y-2">
                            {faqs.map((faq, index) => (
                                <AccordionItem key={faq.id} value={faq.id} className="border rounded-md px-3 bg-background">
                                    <div className="flex items-center justify-between pr-2">
                                        <AccordionTrigger className="text-sm font-medium hover:no-underline flex-1 py-3 text-left">
                                            {faq.question}
                                        </AccordionTrigger>
                                        
                                        <div className="flex items-center gap-0.5 ml-2">
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" disabled={index === 0} onClick={(e) => handleMove(index, -1, e)}>
                                                <ArrowUp className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" disabled={index === faqs.length - 1} onClick={(e) => handleMove(index, 1, e)}>
                                                <ArrowDown className="h-4 w-4" />
                                            </Button>

                                            <Button variant="ghost" size="icon" className={`h-7 w-7 ${editingFaqId === faq.id ? "text-green-600 bg-green-500/10" : "text-blue-500"}`} onClick={(e) => startEdit(faq, e)}>
                                                <Edit2 className="h-4 w-4" />
                                            </Button>

                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={(e) => handleDelete(faq.id, e)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <AccordionContent className="text-xs text-muted-foreground pb-3 pt-1 border-t">
                                        <div className="pt-2">
                                            {faq.answer}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
