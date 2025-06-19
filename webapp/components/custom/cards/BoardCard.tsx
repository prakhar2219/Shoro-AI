"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface BoardCardProps {
    name: string
    description: string
    students: string
    icon: React.ReactNode
    color?: string
    isDark?: boolean
}

export default function BoardCard({ name, description, students, icon, color, isDark }: BoardCardProps) {
    return (
        <Card
            className={cn(
                "h-full flex flex-col justify-between p-6 rounded-xl shadow-md transition-transform duration-200 hover:-translate-y-1",
                isDark ? "bg-gray-800 text-white" : "bg-white"
            )}
        >
            <div className="flex flex-col items-center gap-4 text-center">
                <div className={cn("w-12 h-12", color)}>{icon}</div>
                <div>
                    <CardTitle className="text-lg">{name}</CardTitle>
                    <CardDescription className="text-sm text-gray-500 dark:text-gray-400">{description}</CardDescription>
                    <span className="mt-2 inline-block bg-sky-100 text-sky-700 text-xs font-semibold px-2 py-1 rounded-full">
                        {students} Students
                    </span>
                </div>
            </div>
        </Card>
    )
}
