import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import ChakraUIProvider from "@/providers/chakra-provider"
import { ClerkProvider } from '@clerk/nextjs'
import { AuthProvider } from "@/contexts/AuthContext"
import { MainLayout } from "@/components/layout/main-layout"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "EduPlatform - Quality Education for All",
  description:
    "Comprehensive educational content for CBSE, NCERT, and other boards. Learn, practice, and excel with our interactive platform.",
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
            <AuthProvider>
              <MainLayout>{children}</MainLayout>
              <Toaster />
            </AuthProvider>
          </ChakraUIProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
