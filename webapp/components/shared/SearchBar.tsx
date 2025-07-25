"use client"

import { InputHTMLAttributes } from "react"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "../ui/input"

type SearchBarProps = InputHTMLAttributes<HTMLInputElement> & {
    wrapperClassName?: string
}

export function SearchBar({ wrapperClassName, className, ...props }: SearchBarProps) {
    return (
        <div className={cn("relative", wrapperClassName)}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
                type="text"
                className={cn(
                    "w-full pl-10 pr-4 py-2 border rounded-md bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-white",
                    "border-zinc-300 dark:border-zinc-700 placeholder:text-zinc-500 dark:placeholder:text-zinc-400",
                    className
                )}
                placeholder="Search..."
                {...props}
            />
        </div>
    )
}
