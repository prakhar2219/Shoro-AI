"use client"

import { Edit3 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HeroProps {
    isDark: boolean
}

export default function Hero({ isDark }: HeroProps) {
    return (
        <div className="relative overflow-hidden">
            {/* Background Gradient and Effects */}
            <div
                className={`absolute inset-0 -z-10 transition-colors duration-500 ${isDark
                        ? "bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900"
                        : "bg-gradient-to-br from-sky-100 via-indigo-200 to-purple-100"
                    }`}
            />

            <div
                className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] rounded-full blur-3xl opacity-30"
                style={{
                    background: "radial-gradient(circle at center, #38bdf8, #6366f1)",
                }}
            />
            <div
                className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] rounded-full blur-3xl opacity-30"
                style={{
                    background: "radial-gradient(circle at center, #a855f7, #f472b6)",
                }}
            />

            {/* Content */}
            <div className="py-24 md:py-32 text-center px-4 max-w-6xl mx-auto relative z-10">
                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white tracking-tight">
                    Learn, Practice, Excel
                </h1>
                <p className="mt-6 text-xl md:text-2xl max-w-2xl mx-auto text-gray-700 dark:text-gray-300">
                    Comprehensive educational content for all boards and classes. Start your journey with expert-guided resources.
                </p>

                <div className="mt-8 flex justify-center gap-4 flex-wrap">
                    <Button
                        size="lg"
                        variant="secondary"
                        className="bg-black/10 text-black hover:bg-black/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
                    >
                        Get Started
                    </Button>
                    <Button
                        size="lg"
                        variant="default"
                        className="bg-white text-sky-700 hover:bg-gray-100"
                    >
                        <Edit3 className="mr-2" />
                        Try Editor
                    </Button>
                </div>
            </div>
        </div>
    )
}
