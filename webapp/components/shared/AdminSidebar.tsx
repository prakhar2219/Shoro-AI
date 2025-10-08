"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
    Home,
    Globe,
    Layers,
    Book,
    FileText,
    LayoutList,
    ChevronLeft,
    ChevronRight,
    Languages,
    HelpCircle,
    MessageSquare,
    CheckSquare
} from "lucide-react"
import clsx from "clsx"

const navItems = [
    { name: "Dashboard", href: "/admin", icon: Home },
    { name: "Languages", href: "/admin/languages", icon: Languages },
    { name: "Countries", href: "/admin/countries", icon: Globe },
    { name: "Boards", href: "/admin/boards", icon: Layers },
    { name: "Classes", href: "/admin/classes", icon: Book },
    { name: "Subjects", href: "/admin/subjects", icon: FileText },
    { name: "Chapters", href: "/admin/chapters", icon: LayoutList },
    { name: "Topics", href: "/admin/topics", icon: LayoutList },
    { name: "Subtopics", href: "/admin/subtopics", icon: LayoutList },
    { name: "MCQs", href: "/admin/mcqs", icon: CheckSquare },
    { name: "Descriptive Questions", href: "/admin/descriptive-questions", icon: MessageSquare },
    { name: "FAQs", href: "/admin/faqs", icon: HelpCircle },
]

export function AdminSidebar() {
    const pathname = usePathname()
    const [isCollapsed, setIsCollapsed] = useState(false)

    return (
        <aside
            className={clsx(
                "h-screen bg-white dark:bg-zinc-900 border-r dark:border-zinc-800 p-4 flex flex-col transition-all duration-300",
                isCollapsed ? "w-20" : "w-64"
            )}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                {!isCollapsed && <div className="text-xl font-bold dark:text-white text-nowrap overflow-hidden">Admin Panel</div>}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="text-zinc-500 hover:text-zinc-800 dark:hover:text-white"
                >
                    {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
                </button>
            </div>

            {/* Navigation */}
            <nav className="space-y-1 flex-1">
                {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(
                                "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-zinc-200 dark:bg-zinc-700 text-black dark:text-white"
                                    : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            )}
                        >
                            <Icon className="w-5 h-5" />
                            {!isCollapsed && <span className="ml-3">{item.name}</span>}
                        </Link>
                    )
                })}
            </nav>
        </aside>
    )
}
