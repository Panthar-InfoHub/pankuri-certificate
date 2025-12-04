"use client"

import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { getAllTrainersAdmin } from "@/lib/backend_actions/trainer"
import { cn } from "@/lib/utils"
import { Check, ChevronsUpDown, UserCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { TableSkeleton } from "../ui/skeleton-loader"

export function TrainerCombobox({ value, onValueChange, disabled }) {
    const [open, setOpen] = useState(false)
    const [trainers, setTrainers] = useState([])
    const [search, setSearch] = useState("")
    const [loading, setLoading] = useState(false)

    const fetchTrainers = async (searchQuery = "") => {
        setLoading(true)
        try {
            const result = await getAllTrainersAdmin({
                status: "active",
                search: searchQuery,
                limit: 100
            })

            if (result.success) {
                console.log("Fetched trainers:", result.data);
                setTrainers(result.data || [])
            } else {
                toast.error(result.error || "Failed to fetch trainers")
                setTrainers([])
            }
        } catch (error) {
            console.error("Error fetching trainers:", error)
            toast.error("Failed to load trainers")
            setTrainers([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (open) {
            fetchTrainers(search)
        }
    }, [open])

    const handleSearch = (searchValue) => {
        setSearch(searchValue)
        // Debounce search - only search after user stops typing
        const timeoutId = setTimeout(() => {
            fetchTrainers(searchValue)
        }, 500)

        return () => clearTimeout(timeoutId)
    }

    const selectedTrainer = trainers.find(trainer => trainer.user.id === value)
    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                    disabled={disabled}
                >
                    {selectedTrainer ? (
                        <div className="flex items-center gap-2 truncate">
                            <UserCircle className="h-4 w-4 shrink-0" />
                            <span className="truncate">{selectedTrainer.user.displayName}</span>
                        </div>
                    ) : (
                        <span className="text-muted-foreground">Select trainer...</span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder="Search trainers..."
                        value={search}
                        onValueChange={handleSearch}
                    />
                    <CommandList>
                        {loading ? (
                            <TableSkeleton />
                        ) : (
                            <>
                                <CommandEmpty>No trainers found.</CommandEmpty>
                                <CommandGroup>
                                    {trainers.map((trainer) => (
                                        <CommandItem
                                            key={trainer.user.id}
                                            value={trainer.user.id}
                                            onSelect={() => {
                                                onValueChange(trainer.user.id === value ? "" : trainer.user.id)
                                                setOpen(false)
                                            }}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    value === trainer.user.id ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            <div className="flex flex-col gap-1 flex-1 min-w-0">
                                                <span className="truncate font-medium">{trainer.user.displayName}</span>
                                                {trainer.user.email && (
                                                    <span className="text-xs text-muted-foreground">
                                                        {trainer.user.email}
                                                    </span>
                                                )}
                                            </div>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
