import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import ChakraUIProvider from "@/providers/chakra-provider"
import { MainLayout } from "@/components/layout/main-layout"

const inter = Inter({ subsets: ["latin"] })

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
    <html lang="en">
      <body className={inter.className}>
        <ChakraUIProvider>
          <MainLayout>{children}</MainLayout>
        </ChakraUIProvider>
      </body>
    </html>
  )
}
