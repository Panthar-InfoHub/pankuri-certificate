"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface StepperIndicatorProps {
    steps: string[]
    /** 1-indexed current step */
    currentStep: number
    /** Called when a completed (past) step is clicked — lets the wizard navigate back */
    onStepClick: (step: number) => void
}

export function StepperIndicator({ steps, currentStep, onStepClick }: StepperIndicatorProps) {
    return (
        <div className="flex items-center w-full px-1">
            {steps.map((label, index) => {
                const step = index + 1
                const isCompleted = step < currentStep
                const isActive = step === currentStep
                const isPending = step > currentStep

                return (
                    <div key={step} className={cn("flex items-center", index < steps.length - 1 && "flex-1")}>
                        {/* Step circle + label */}
                        <button
                            type="button"
                            aria-current={isActive ? "step" : undefined}
                            aria-label={label}
                            disabled={!isCompleted}
                            onClick={() => isCompleted && onStepClick(step)}
                            className={cn(
                                "flex flex-col items-center gap-1 group focus:outline-none",
                                isCompleted && "cursor-pointer",
                                isPending && "cursor-default",
                            )}
                        >
                            {/* Circle */}
                            <div
                                className={cn(
                                    "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition-all duration-200",
                                    isCompleted &&
                                    "border-green-500 bg-green-500 text-white group-hover:bg-green-600 group-hover:border-green-600 group-focus-visible:ring-2 group-focus-visible:ring-green-500 group-focus-visible:ring-offset-2",
                                    isActive &&
                                    "border-transparent bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-200",
                                    isPending &&
                                    "border-muted-foreground/30 bg-background text-muted-foreground/50",
                                )}
                            >
                                {isCompleted ? <Check className="h-4 w-4 stroke-[3]" /> : <span>{step}</span>}
                            </div>

                            {/* Label */}
                            <span
                                className={cn(
                                    "text-xs font-medium whitespace-nowrap transition-colors duration-200",
                                    isCompleted && "text-green-600 group-hover:text-green-700",
                                    isActive && "text-violet-700 font-semibold",
                                    isPending && "text-muted-foreground/50",
                                )}
                            >
                                {label}
                            </span>
                        </button>

                        {/* Connector line between steps */}
                        {index < steps.length - 1 && (
                            <div
                                aria-hidden="true"
                                className={cn(
                                    "flex-1 h-0.5 mx-2 mb-5 rounded-full transition-all duration-300",
                                    step < currentStep ? "bg-green-400" : "bg-muted-foreground/20",
                                )}
                            />
                        )}
                    </div>
                )
            })}
        </div>
    )
}
