import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import ChakraUIProvider from "@/providers/chakra-provider"
import { ClerkProvider } from '@clerk/nextjs'
import { MainLayout } from "@/components/layout/main-layout"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Education AI Platform - Admin Panel",
  description:
    "Administration dashboard for managing educational content, including countries, boards, classes, subjects, chapters, topics, and related content for the Education AI Platform.",
  generator: 'v0.dev',
  icons: {
    icon: [
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <ChakraUIProvider>
            <MainLayout>{children}</MainLayout>
            <Toaster />
          </ChakraUIProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
