"use client"

import type React from "react"

import { Box } from "@chakra-ui/react"
import { Navbar } from "./navbar"
import { Footer } from "./footer"
import { LoadingBar } from "@/components/ui/loading-bar"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <Box minH="100vh" display="flex" flexDirection="column">
      <LoadingBar />
      <Navbar />
      <Box flex="1" as="main">
        {children}
      </Box>
      <Footer />
    </Box>
  )
}
