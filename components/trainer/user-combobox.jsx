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
import { TableSkeleton } from "@/components/ui/skeleton-loader"
import { getAllUsers } from "@/lib/backend_actions/users"
import { cn } from "@/lib/utils"
import { Check, ChevronsUpDown, Scroll } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { ScrollArea } from "../ui/scroll-area"

export function UserCombobox({ value, onValueChange, disabled }) {
    const [open, setOpen] = useState(false)
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState("")

    const fetchUsers = useCallback(async (searchQuery = "") => {
        setLoading(true)
        const result = await getAllUsers({ limit: 50, search: searchQuery })
        if (result.success) {
            setUsers(result.data.data)
        }
        setLoading(false)
    }, [])

    useEffect(() => {
        if (open) {
            fetchUsers()
        }
    }, [open, fetchUsers])

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (open) {
                fetchUsers(search)
            }
        }, 500)
        return () => clearTimeout(timer)
    }, [search, open, fetchUsers])

    const selectedUser = users.find(user => user.id === value)

    return (
        <Popover open={open} onOpenChange={setOpen} modal>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                    disabled={disabled}
                >
                    {selectedUser ? (
                        <div className="flex items-center gap-2 truncate">
                            <span className="font-medium">{selectedUser.displayName}</span>
                            <span className="text-xs text-muted-foreground">({selectedUser.email})</span>
                        </div>
                    ) : (
                        "Select user..."
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-[500px] p-0" align="start">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder="Search users by name or email..."
                        value={search}
                        onValueChange={setSearch}
                    />
                    <CommandList className="max-h-[300px] overflow-y-auto">
                        {loading ? (
                            <div className="p-4">
                                <TableSkeleton />
                            </div>
                        ) : (
                            <>
                                <CommandEmpty>No users found.</CommandEmpty>
                                <CommandGroup>
                                    {users.map((user) => (
                                        <CommandItem
                                            key={user.id}
                                            value={user.id}
                                            onSelect={() => {
                                                onValueChange(user.id === value ? "" : user.id)
                                                setOpen(false)
                                            }}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    value === user.id ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            <div className="flex flex-col flex-1 overflow-hidden">
                                                <span className="font-medium truncate">{user.displayName}</span>
                                                <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                                            </div>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </>
                        )}
                    </CommandList>
                </Command>

            </PopoverContent>
        </Popover >
    )
}
