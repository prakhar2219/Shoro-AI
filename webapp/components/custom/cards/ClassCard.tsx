"use client"

import { Card,  CardTitle, CardDescription } from "@/components/ui/card"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface ClassCardProps {
  id: number
  name: string
  level: string
  subjects: number
}

export default function ClassCard({ id, name, level, subjects }: ClassCardProps) {
  return (
    <Link href={`/cbse/class-${id}`}>
      <Card
        className={cn(
          "p-4 rounded-lg hover:shadow-lg hover:-translate-y-1 transition-transform duration-200",
          "bg-white text-black dark:bg-gray-800 dark:text-white"
        )}
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <CardTitle className="text-lg">{name}</CardTitle>
          <span className="bg-sky-100 text-sky-700 text-xs font-medium px-2 py-1 rounded-full dark:bg-sky-900 dark:text-sky-300">
            {level}
          </span>
          <CardDescription className="text-xs text-gray-500 dark:text-gray-400">
            {subjects} Subjects
          </CardDescription>
        </div>
      </Card>
    </Link>
  )
}
