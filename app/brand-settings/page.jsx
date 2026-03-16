"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { PlusCircle, Trash2, Save, RefreshCw, MessageCircle, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"

import { getBrandSettings, updateBrandSettings } from "@/lib/backend_actions/brandSetting"
import { getAdminFaqs, createGlobalFaq, updateGlobalFaq, deleteFaq } from "@/lib/backend_actions/faq"

export default function BrandSettingsPage() {
    const [loading, setLoading] = useState(true)
    const [savingSettings, setSavingSettings] = useState(false)
    const [savingFaq, setSavingFaq] = useState(false)

    // Brand Settings State
    const [globalWhatsappLink, setGlobalWhatsappLink] = useState("")
    const [announcements, setAnnouncements] = useState([])

    // FAQ State
    const [faqs, setFaqs] = useState([])
    const [newFaq, setNewFaq] = useState({ question: "", answer: "", isActive: true, order: 0 })
    const [editingFaqId, setEditingFaqId] = useState(null)
    const [activeTab, setActiveTab] = useState("general")

    useEffect(() => {
        loadData(true)
    }, [])

    const loadData = async (isInitial = false) => {
        if (isInitial) setLoading(true)
        try {
            const [settingsRes, faqsRes] = await Promise.all([
                getBrandSettings(),
                getAdminFaqs({ type: "global" })
            ])

            if (settingsRes.success && settingsRes.data) {
                setGlobalWhatsappLink(settingsRes.data.globalWhatsappLink || "")
                const parsedAnnouncements = settingsRes.data.announcements
                setAnnouncements(Array.isArray(parsedAnnouncements) ? parsedAnnouncements : [])
            } else {
                toast.error("Failed to load brand settings")
            }

            if (faqsRes.success && faqsRes.data) {
                setFaqs(faqsRes.data)
            } else {
                toast.error("Failed to load FAQs")
            }
        } catch (error) {
            console.error("Error loading data:", error)
            toast.error("An unexpected error occurred")
        } finally {
            if (isInitial) setLoading(false)
        }
    }

    // ──────────────────────────────────────────
    // Announcements & Whatsapp Methods
    // ──────────────────────────────────────────

    const handleAddAnnouncement = () => {
        const newAnnouncement = {
            id: crypto.randomUUID(),
            text: "",
            link: "",
            isActive: true,
            styles: { bgColor: "#9333ea", textColor: "#ffffff" }
        }
        setAnnouncements([...announcements, newAnnouncement])
    }

    const handleAnnounceChange = (index, field, value) => {
        const updated = [...announcements]
        updated[index] = { ...updated[index], [field]: value }
        setAnnouncements(updated)
    }

    const handleAnnounceStyleChange = (index, styleField, value) => {
        const updated = [...announcements]
        updated[index] = {
            ...updated[index],
            styles: {
                ...(updated[index].styles || { bgColor: "#9333ea", textColor: "#ffffff" }),
                [styleField]: value
            }
        }
        setAnnouncements(updated)
    }

    const handleRemoveAnnouncement = (index) => {
        setAnnouncements(announcements.filter((_, i) => i !== index))
    }

    const handleSaveSettings = async () => {
        setSavingSettings(true)
        try {
            const res = await updateBrandSettings({
                globalWhatsappLink,
                announcements
            })
            if (res.success) {
                toast.success("Settings updated successfully")
            } else {
                toast.error(res.error || "Update failed")
            }
        } catch (error) {
            toast.error("Could not save settings")
        } finally {
            setSavingSettings(false)
        }
    }

    // ──────────────────────────────────────────
    // FAQ Methods
    // ──────────────────────────────────────────

    const handleSaveFaq = async (e) => {
        e.preventDefault()
        setSavingFaq(true)
        try {
            if (editingFaqId) {
                const res = await updateGlobalFaq(editingFaqId, newFaq)
                if (res.success) {
                    toast.success("FAQ updated")
                    setEditingFaqId(null)
                    setNewFaq({ question: "", answer: "", isActive: true, order: 0 })
                    loadData() // Refresh
                } else {
                    toast.error(res.error)
                }
            } else {
                const res = await createGlobalFaq(newFaq)
                if (res.success) {
                    toast.success("FAQ created")
                    setNewFaq({ question: "", answer: "", isActive: true, order: faqs.length })
                    loadData() // Refresh
                } else {
                    toast.error(res.error)
                }
            }
        } catch (error) {
            toast.error("Failed to save FAQ")
        } finally {
            setSavingFaq(false)
        }
    }

    const handleEditFaq = (faq) => {
        setEditingFaqId(faq.id)
        setNewFaq({
            question: faq.question,
            answer: faq.answer,
            isActive: faq.isActive,
            order: faq.order
        })
    }

    const handleDeleteFaq = async (id) => {
        if (!confirm("Are you sure you want to delete this FAQ?")) return
        try {
            const res = await deleteFaq(id)
            if (res.success) {
                toast.success("FAQ deleted")
                loadData()
            } else {
                toast.error(res.error)
            }
        } catch (error) {
            toast.error("Failed to delete FAQ")
        }
    }

    if (loading) {
        return (
            <div className="p-8 flex justify-center items-center h-[calc(100vh-4rem)]">
                <RefreshCw className="h-8 w-8 animate-spin text-purple-600" />
            </div>
        )
    }

    return (
        <div className="container mx-auto p-6 max-w-5xl mt-16">
            <h1 className="text-3xl font-bold text-gradient-brand mb-6">Brand Settings</h1>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="general">Announcements & Socials</TabsTrigger>
                    <TabsTrigger value="faqs">Global FAQs</TabsTrigger>
                </TabsList>

                {/* ────────────────────────────────────────── DIRECTIVES: Announcements ────────────────────────────────────────── */}
                <TabsContent value="general" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl">Communications & Bars</CardTitle>
                            <CardDescription>Setup your community channels and announcement banners here.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* WhatsApp Link */}
                            <div className="space-y-2">
                                <Label htmlFor="whatsapp" className="flex items-center gap-2">
                                    <MessageCircle className="h-4 w-4 text-green-500" /> WhatsApp Community Link
                                </Label>
                                <Input
                                    id="whatsapp"
                                    placeholder="https://chat.whatsapp.com/..."
                                    value={globalWhatsappLink}
                                    onChange={(e) => setGlobalWhatsappLink(e.target.value)}
                                />
                            </div>

                            <div className="border-t pt-4">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-semibold text-lg flex items-center gap-2">
                                        Announcement Banners
                                        <span className="text-xs text-muted-foreground font-normal">({announcements.length}/3)</span>
                                    </h3>
                                    {announcements.length < 3 && (
                                        <Button size="sm" onClick={handleAddAnnouncement}>
                                            <PlusCircle className="mr-2 h-4 w-4" /> Add Announcement
                                        </Button>
                                    )}
                                </div>

                                {announcements.map((item, index) => (
                                    <Card key={item.id} className="border border-purple-100 bg-purple-50/20 p-4 space-y-4 mb-4">
                                        <div className="flex justify-between items-center border-b pb-2">
                                            <span className="text-sm font-semibold text-purple-700">Announcement #{index + 1}</span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 px-2"
                                                onClick={() => handleRemoveAnnouncement(index)}
                                            >
                                                <Trash2 className="h-4 w-4 mr-1" /> Remove
                                            </Button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <Label>Text</Label>
                                                <Input
                                                    placeholder="E.g. Get 50% discount on Course X"
                                                    value={item.text}
                                                    onChange={(e) => handleAnnounceChange(index, "text", e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label>Link (Optional)</Label>
                                                <Input
                                                    placeholder="https://yourwebsite.com/course"
                                                    value={item.link}
                                                    onChange={(e) => handleAnnounceChange(index, "link", e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                                            <div className="space-y-1">
                                                <Label>Background Color</Label>
                                                <div className="flex gap-2 items-center">
                                                    <Input
                                                        type="color"
                                                        className="h-10 w-12 p-1 cursor-pointer"
                                                        value={item.styles?.bgColor || "#9333ea"}
                                                        onChange={(e) => handleAnnounceStyleChange(index, "bgColor", e.target.value)}
                                                    />
                                                    <Input
                                                        value={item.styles?.bgColor || "#9333ea"}
                                                        onChange={(e) => handleAnnounceStyleChange(index, "bgColor", e.target.value)}
                                                        className="font-mono"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <Label>Text Color</Label>
                                                <div className="flex gap-2 items-center">
                                                    <Input
                                                        type="color"
                                                        className="h-10 w-12 p-1 cursor-pointer"
                                                        value={item.styles?.textColor || "#ffffff"}
                                                        onChange={(e) => handleAnnounceStyleChange(index, "textColor", e.target.value)}
                                                    />
                                                    <Input
                                                        value={item.styles?.textColor || "#ffffff"}
                                                        onChange={(e) => handleAnnounceStyleChange(index, "textColor", e.target.value)}
                                                        className="font-mono"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2 h-10">
                                                <Switch
                                                    id={`active-${item.id}`}
                                                    checked={item.isActive}
                                                    onCheckedChange={(checked) => handleAnnounceChange(index, "isActive", checked)}
                                                />
                                                <Label htmlFor={`active-${item.id}`}>Active</Label>
                                            </div>
                                        </div>

                                        {/* Preview */}
                                        <div className="mt-2 text-xs font-semibold text-purple-600">Preview:</div>
                                        <div
                                            className="px-4 py-2 rounded-md font-medium text-center text-sm shadow-sm"
                                            style={{ backgroundColor: item.styles?.bgColor || "#9333ea", color: item.styles?.textColor || "#ffffff" }}
                                        >
                                            {item.text || "Announcement Preview text will appear here"}
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end">
                            <Button onClick={handleSaveSettings} disabled={savingSettings} className="bg-gradient-to-r from-purple-600 to-pink-600">
                                {savingSettings ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Save Settings
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                {/* ────────────────────────────────────────── DIRECTIVES: FAQs ────────────────────────────────────────── */}
                <TabsContent value="faqs" className="mt-6">
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="text-xl">{editingFaqId ? "Edit Global FAQ" : "Add Global FAQ"}</CardTitle>
                            <CardDescription>FAQs displayed on the landing page for all users.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSaveFaq} className="space-y-4">
                                <div className="space-y-1">
                                    <Label>Question</Label>
                                    <Input
                                        value={newFaq.question}
                                        onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                                        placeholder="E.g. What is the cancelation policy?"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label>Answer</Label>
                                    <Input
                                        value={newFaq.answer}
                                        onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                                        placeholder="E.g. You can cancel on the profile dashboards"
                                        required
                                    />
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="space-y-1 w-24">
                                        <Label>Order</Label>
                                        <Input
                                            type="number"
                                            value={newFaq.order}
                                            onChange={(e) => setNewFaq({ ...newFaq, order: parseInt(e.target.value || "0", 10) })}
                                        />
                                    </div>
                                    <div className="flex items-center space-x-2 mt-5">
                                        <Switch
                                            id="faq-active"
                                            checked={newFaq.isActive}
                                            onCheckedChange={(checked) => setNewFaq({ ...newFaq, isActive: checked })}
                                        />
                                        <Label htmlFor="faq-active">Active</Label>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2">
                                    {editingFaqId && (
                                        <Button type="button" variant="outline" onClick={() => {
                                            setEditingFaqId(null)
                                            setNewFaq({ question: "", answer: "", isActive: true, order: 0 })
                                        }}>Cancel</Button>
                                    )}
                                    <Button type="submit" disabled={savingFaq} className="bg-gradient-to-r from-purple-600 to-pink-600">
                                        {savingFaq ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} {editingFaqId ? "Update FAQ" : "Add FAQ"}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl">Existing FAQs</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {faqs.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground flex flex-col items-center gap-2">
                                    <AlertCircle className="h-8 w-8 text-purple-400" />
                                    No global FAQs found. Add one above!
                                </div>
                            ) : (
                                <Accordion type="single" collapsible className="w-full">
                                    {faqs.sort((a, b) => a.order - b.order).map((faq) => (
                                        <AccordionItem value={faq.id} key={faq.id} className="border-b">
                                            <div className="flex items-center justify-between">
                                                <AccordionTrigger className="hover:no-underline text-left">
                                                    <span className={`${!faq.isActive && "text-muted-foreground line-through"}`}>
                                                        {faq.question}
                                                    </span>
                                                    {!faq.isActive && <span className="text-xs text-red-500 ml-2">(Inactive)</span>}
                                                    <span className="text-xs bg-gray-100 text-gray-500 rounded-full px-2 py-0.5 ml-2">Order: {faq.order}</span>
                                                </AccordionTrigger>
                                                <div className="flex items-center gap-2 pr-4">
                                                    <Button 
                                                        size="sm" 
                                                        variant="ghost" 
                                                        className="text-blue-600 h-8 px-2 flex items-center gap-1" 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEditFaq(faq);
                                                        }}
                                                    >
                                                        <PlusCircle className="h-4 w-4 transform rotate-45" /> Edit
                                                    </Button>
                                                    <Button 
                                                        size="sm" 
                                                        variant="ghost" 
                                                        className="text-red-600 h-8 px-2 flex items-center gap-1" 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteFaq(faq.id);
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4" /> Delete
                                                    </Button>
                                                </div>
                                            </div>
                                            <AccordionContent className="text-muted-foreground bg-gray-50/50 p-4 rounded-b-md">
                                                {faq.answer}
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
