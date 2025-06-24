import { AdminSidebar } from "@/components/shared/AdminSidebar"
import { Metadata } from "next"
import type React from "react"

export const metadata: Metadata = {
    title: "EduPlatform - Quality Education for All",
    description:
        "Comprehensive educational content for CBSE, NCERT, and other boards. Learn, practice, and excel with our interactive platform.",
    generator: 'v0.dev'
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen bg-background dark:bg-black">
            <AdminSidebar />

            <main className="flex-1 p-4 md:p-6">
                {children}
            </main>
        </div>
    )
}
