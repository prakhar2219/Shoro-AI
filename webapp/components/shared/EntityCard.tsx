// components/shared/EntityCard.tsx
"use client"

import { MoreVertical, Pencil, Trash } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu"
import { cn } from "@/lib/utils"

type EntityCardProps = {
    title: string
    subtitle?: string
    onEdit: () => void
    onDelete: () => void
    className?: string
}

export function EntityCard({ title, subtitle, onEdit, onDelete, className }: EntityCardProps) {
    return (
        <div
            className={cn(
                "border dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-sm flex justify-between items-start",
                className
            )}
        >
            <div>
                <h3 className="text-lg font-semibold dark:text-white">{title}</h3>
                {subtitle && <p className="text-sm text-zinc-500 dark:text-zinc-400">{subtitle}</p>}
            </div>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800">
                        <MoreVertical className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
                    </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="bg-white dark:bg-zinc-800 shadow-md rounded-md mt-2 px-2 py-1 z-50">
                    <DropdownMenuItem
                        onClick={onEdit}
                        className="flex items-center gap-2 px-2 py-1.5 cursor-pointer text-sm hover:bg-zinc-100 dark:hover:bg-zinc-700 dark:text-white"
                    >
                        <Pencil className="w-4 h-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={onDelete}
                        className="flex items-center gap-2 px-2 py-1.5 cursor-pointer text-sm hover:bg-zinc-100 dark:hover:bg-zinc-700 text-red-600 dark:text-red-400"
                    >
                        <Trash className="w-4 h-4" /> Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}
