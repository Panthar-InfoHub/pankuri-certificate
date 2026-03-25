"use client"

import { CourseFormContent } from "@/components/course/create-course-dialog"
import { ModuleFormContent } from "@/components/module/create-module-dialog"
import { LessonFormContent } from "@/components/lesson/create-lesson-dialog"
import { ModuleCombobox } from "./module-combobox"
import { StepperIndicator } from "./stepper-indicator"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { BookOpen, LayoutList } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { CourseCombobox } from "./course-combobox"

// ─── Types ────────────────────────────────────────────────────────────────────

type WizardStep = 1 | 2 | 3
type StepMode = "select" | "create"

type WizardState = {
    step: WizardStep
    stepMode: StepMode
    courseId: string
    courseName: string
    /** null = intentionally skipped; "" = not yet decided */
    moduleId: string | null
    moduleName: string
}

interface CreateContentDialogProps {
    children: React.ReactNode
    /** Pre-fill and skip step 1 if provided */
    courseId?: string
    courseName?: string
    /** Pre-fill and skip step 2 if provided (requires courseId) */
    moduleId?: string
    moduleName?: string
    /** Passed through to CourseFormContent when creating a new course */
    categories?: any[]
    trainers?: any[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildInitialState(
    courseId?: string,
    courseName?: string,
    moduleId?: string,
    moduleName?: string,
): WizardState {
    if (courseId && moduleId !== undefined) {
        return {
            step: 3,
            stepMode: "select",
            courseId,
            courseName: courseName ?? "",
            moduleId: moduleId ?? null,
            moduleName: moduleName ?? "",
        }
    }
    if (courseId) {
        return {
            step: 2,
            stepMode: "select",
            courseId,
            courseName: courseName ?? "",
            moduleId: null,
            moduleName: "",
        }
    }
    return { step: 1, stepMode: "select", courseId: "", courseName: "", moduleId: null, moduleName: "" }
}

const STEPS = ["Course", "Module", "Lesson"]

// ─── Mode Toggle (reused in step 1 & 2) ──────────────────────────────────────

function ModeToggle({
    mode,
    onChange,
}: {
    mode: StepMode
    onChange: (m: StepMode) => void
}) {
    return (
        <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
            {(["select", "create"] as StepMode[]).map((m) => (
                <button
                    key={m}
                    type="button"
                    onClick={() => onChange(m)}
                    className={cn(
                        "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                        mode === m
                            ? "bg-background shadow-sm text-foreground"
                            : "text-muted-foreground hover:text-foreground",
                    )}
                >
                    {m === "select" ? "Select Existing" : "Create New"}
                </button>
            ))}
        </div>
    )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function CreateContentDialog({
    children,
    courseId: propCourseId,
    courseName: propCourseName,
    moduleId: propModuleId,
    moduleName: propModuleName,
    categories = [],
    trainers = [],
}: CreateContentDialogProps) {
    const router = useRouter()
    const [open, setOpen] = useState(false)

    const [wizard, setWizard] = useState<WizardState>(() =>
        buildInitialState(propCourseId, propCourseName, propModuleId, propModuleName),
    )

    // Uncommitted selections while the user is in "select" mode
    const [tempCourseId, setTempCourseId] = useState("")
    const [tempCourseName, setTempCourseName] = useState("")
    const [tempModuleId, setTempModuleId] = useState("")
    const [tempModuleName, setTempModuleName] = useState("")

    function resetWizard() {
        setWizard(buildInitialState(propCourseId, propCourseName, propModuleId, propModuleName))
        setTempCourseId("")
        setTempCourseName("")
        setTempModuleId("")
        setTempModuleName("")
    }

    function handleOpenChange(v: boolean) {
        setOpen(v)
        if (!v) resetWizard()
    }

    // ── Step navigation helpers ────────────────────────────────────────────

    function commitCourse(id: string, name: string) {
        setWizard((p) => ({ ...p, step: 2, courseId: id, courseName: name, stepMode: "select", moduleId: null, moduleName: "" }))
        setTempCourseId("")
        setTempCourseName("")
    }

    function commitModule(id: string | null, name: string) {
        setWizard((p) => ({ ...p, step: 3, moduleId: id, moduleName: name, stepMode: "select" }))
        setTempModuleId("")
        setTempModuleName("")
    }

    /** Navigate back to a completed step (used by StepperIndicator and ← Back buttons) */
    function goToStep(step: WizardStep) {
        setWizard((p) => ({ ...p, step, stepMode: "select" }))
    }

    function handleStep3Back() {
        if (propModuleId !== undefined) {
            // Both course & module were pre-locked — nothing to go back to
            setOpen(false)
        } else {
            goToStep(2)
        }
    }

    function handleStep2Back() {
        if (propCourseId) {
            // Course was pre-locked
            setOpen(false)
        } else {
            goToStep(1)
        }
    }

    function handleLessonSuccess() {
        setOpen(false)
        resetWizard()
        router.refresh()
    }

    // ─────────────────────────────────────────────────────────────────────────

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            {/* Wrap trigger in a plain span so we don't break whatever children is */}
            <span
                onClick={() => setOpen(true)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setOpen(true) }}
                role="button"
                tabIndex={0}
                className="contents"
            >
                {children}
            </span>

            <DialogContent className="max-w-3xl gap-0 p-0 overflow-hidden">

                {/* ── Dialog header ─────────────────────────────────────────────── */}
                <DialogHeader className="px-6 pt-5 pb-4 border-b bg-muted/30">
                    <DialogTitle className="text-lg font-semibold mb-3">Create Content</DialogTitle>

                    <StepperIndicator
                        steps={STEPS}
                        currentStep={wizard.step}
                        onStepClick={(s) => goToStep(s as WizardStep)}
                    />

                    {/* Context breadcrumb pills — visible from step 2 onward */}
                    {wizard.step > 1 && wizard.courseId && (
                        <div className="flex items-center gap-2 mt-3 flex-wrap">
                            <div className="flex items-center gap-1.5 bg-violet-100 text-violet-800 text-xs font-medium px-2.5 py-1 rounded-full border border-violet-200">
                                <BookOpen className="h-3 w-3 shrink-0" />
                                <span className="max-w-[220px] truncate">{wizard.courseName || wizard.courseId}</span>
                            </div>

                            {wizard.step === 3 && (
                                <div className="flex items-center gap-1.5 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full border border-blue-200">
                                    <LayoutList className="h-3 w-3 shrink-0" />
                                    <span className="max-w-[220px] truncate">
                                        {wizard.moduleId
                                            ? (wizard.moduleName || wizard.moduleId)
                                            : "No module"}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </DialogHeader>

                {/* ── Step content ──────────────────────────────────────────────── */}
                <ScrollArea className="max-h-[65vh]">
                    <div className="px-6 py-5">

                        {/* ── Step 1: Course ──────────────────────────────────────── */}
                        {wizard.step === 1 && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-4">
                                <p className="text-sm text-muted-foreground">
                                    Choose an existing course or create a new one.
                                </p>

                                <ModeToggle
                                    mode={wizard.stepMode}
                                    onChange={(m) => setWizard((p) => ({ ...p, stepMode: m }))}
                                />

                                {wizard.stepMode === "select" && (
                                    <div className="space-y-3">
                                        <CourseCombobox
                                            value={tempCourseId}
                                            onValueChange={(id, title) => {
                                                setTempCourseId(id)
                                                setTempCourseName(title)
                                            }}
                                        />
                                        <Button
                                            className="w-full"
                                            disabled={!tempCourseId}
                                            onClick={() => commitCourse(tempCourseId, tempCourseName)}
                                        >
                                            Continue with this course →
                                        </Button>
                                    </div>
                                )}

                                {wizard.stepMode === "create" && (
                                    <CourseFormContent
                                        categories={categories}
                                        trainers={trainers}
                                        onSuccess={({ id, title }: { id: string; title: string }) =>
                                            commitCourse(id, title)
                                        }
                                        onCancel={() => setWizard((p) => ({ ...p, stepMode: "select" }))}
                                        cancelLabel="← Select instead"
                                    />
                                )}
                            </div>
                        )}

                        {/* ── Step 2: Module ──────────────────────────────────────── */}
                        {wizard.step === 2 && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-4">
                                <div className="flex items-center gap-2">
                                    <p className="text-sm text-muted-foreground">
                                        Optionally assign this lesson to a module.
                                    </p>
                                    <Badge variant="secondary" className="text-xs shrink-0">Optional</Badge>
                                </div>

                                <ModeToggle
                                    mode={wizard.stepMode}
                                    onChange={(m) => setWizard((p) => ({ ...p, stepMode: m }))}
                                />

                                {wizard.stepMode === "select" && (
                                    <div className="space-y-3">
                                        <ModuleCombobox
                                            courseId={wizard.courseId}
                                            value={tempModuleId}
                                            onValueChange={(id, title) => {
                                                setTempModuleId(id)
                                                setTempModuleName(title)
                                            }}
                                        />
                                        <div className="flex items-center gap-2">
                                            <Button
                                                className="flex-1"
                                                disabled={!tempModuleId}
                                                onClick={() => commitModule(tempModuleId, tempModuleName)}
                                            >
                                                Continue with this module →
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                className="text-muted-foreground hover:text-foreground shrink-0"
                                                onClick={() => commitModule(null, "")}
                                            >
                                                Skip module
                                            </Button>
                                        </div>
                                        {!propCourseId && (
                                            <Button
                                                type="button"
                                                variant="link"
                                                size="sm"
                                                className="px-0 text-muted-foreground"
                                                onClick={handleStep2Back}
                                            >
                                                ← Back to course
                                            </Button>
                                        )}
                                    </div>
                                )}

                                {wizard.stepMode === "create" && (
                                    <ModuleFormContent
                                        courseId={wizard.courseId}
                                        onSuccess={({ id, title }: { id: string; title: string }) =>
                                            commitModule(id, title)
                                        }
                                        onCancel={() => setWizard((p) => ({ ...p, stepMode: "select" }))}
                                        cancelLabel="← Select instead"
                                    />
                                )}
                            </div>
                        )}

                        {/* ── Step 3: Lesson ──────────────────────────────────────── */}
                        {wizard.step === 3 && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                <LessonFormContent
                                    lockedCourseId={wizard.courseId}
                                    lockedCourseName={wizard.courseName}
                                    lockedModuleId={wizard.moduleId}
                                    lockedModuleName={wizard.moduleName}
                                    onSuccess={handleLessonSuccess}
                                    onCancel={handleStep3Back}
                                    cancelLabel="← Back"
                                />
                            </div>
                        )}

                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}
