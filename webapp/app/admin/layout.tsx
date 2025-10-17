'use client';

import { AdminSidebar } from "@/components/shared/AdminSidebar"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import type React from "react"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <ProtectedRoute requiredRoles={['super_admin', 'admin', 'editor']}>
            <div className="flex min-h-screen bg-background dark:bg-black">
                <AdminSidebar />

                <main className="flex-1 p-4 md:p-6">
                    {children}
                </main>
            </div>
        </ProtectedRoute>
    )
}
