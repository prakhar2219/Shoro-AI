"use client"

import Link from "next/link"
import { useTheme } from "next-themes"
import { Award, BookOpen, GraduationCap, Target } from "lucide-react"
import BoardCard from "@/components/custom/cards/BoardCard"

const BOARDS = [
    {
        id: "cbse",
        name: "CBSE",
        description: "Central Board of Secondary Education",
        icon: BookOpen,
        color: "text-sky-500",
        students: "15M+",
    },
    {
        id: "ncert",
        name: "NCERT",
        description: "National Council of Educational Research",
        icon: GraduationCap,
        color: "text-emerald-500",
        students: "20M+",
    },
    {
        id: "icse",
        name: "ICSE",
        description: "Indian Certificate of Secondary Education",
        icon: Award,
        color: "text-violet-500",
        students: "5M+",
    },
    {
        id: "state-boards",
        name: "State Boards",
        description: "Various State Education Boards",
        icon: Target,
        color: "text-amber-500",
        students: "25M+",
    },
]

export default function BoardsSection() {
    const { resolvedTheme } = useTheme()
    const isDark = resolvedTheme === "dark"

    return (
        <section className="bg-background py-20">
            <div className="max-w-6xl mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold">Choose Your Board</h2>
                    <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
                        Select from various education boards to access tailored content and curriculum
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
                    {BOARDS.map((board) => (
                        <Link href={`/${board.id}`} key={board.id} className="block h-full">
                            <BoardCard
                                name={board.name}
                                description={board.description}
                                students={board.students}
                                icon={<board.icon className={`w-10 h-10 ${board.color}`} />}
                                isDark={isDark}
                            />
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}
