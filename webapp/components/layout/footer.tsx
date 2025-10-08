"use client"

import { BookOpen, Mail, Phone, Facebook, Twitter, Instagram, Youtube } from "lucide-react"
import { Box, Container, SimpleGrid, Stack, Icon, HStack } from "@chakra-ui/react"
import Link from "next/link"
import { useTheme } from "next-themes"
import type { ReactNode } from "react"

const ListHeader = ({ children }: { children: ReactNode }) => (
  <div className="font-semibold text-base mb-2">{children}</div>
)

export function Footer() {
  const { resolvedTheme } = useTheme()
  const textColor = resolvedTheme === "dark" ? "text-gray-300" : "text-gray-700"

  return (
    <Box className="bg-white dark:bg-gray-900 text-sm">
      <Container maxW="6xl" className="py-10">
        <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} className="gap-8">
          <Stack className="gap-4">
            <HStack className="gap-2">
              <Icon as={BookOpen} className="w-6 h-6 text-blue-500" />
              <span className="text-lg font-bold text-blue-500">EduPlatform</span>
            </HStack>
            <p className={`text-sm ${textColor}`}>
              Empowering students with quality education content across all boards and classes.
            </p>
            <HStack className="gap-4">
              <Link href="#" aria-label="Facebook">
                <Facebook className="w-5 h-5" />
              </Link>
              <Link href="#" aria-label="Twitter">
                <Twitter className="w-5 h-5" />
              </Link>
              <Link href="#" aria-label="Instagram">
                <Instagram className="w-5 h-5" />
              </Link>
              <Link href="#" aria-label="YouTube">
                <Youtube className="w-5 h-5" />
              </Link>
            </HStack>
          </Stack>

          <Stack className="gap-2">
            <ListHeader>Boards</ListHeader>
            <Link href="/cbse" className="hover:underline">CBSE</Link>
            <Link href="/ncert" className="hover:underline">NCERT</Link>
            <Link href="/state-boards" className="hover:underline">State Boards</Link>
            <Link href="/icse" className="hover:underline">ICSE</Link>
          </Stack>

          <Stack className="gap-2">
            <ListHeader>Classes</ListHeader>
            <Link href="/classes/primary" className="hover:underline">Primary (1–5)</Link>
            <Link href="/classes/middle" className="hover:underline">Middle (6–8)</Link>
            <Link href="/classes/secondary" className="hover:underline">Secondary (9–10)</Link>
            <Link href="/classes/senior" className="hover:underline">Senior (11–12)</Link>
          </Stack>

          <Stack className="gap-2">
            <ListHeader>Support</ListHeader>
            <Link href="/help" className="hover:underline">Help Center</Link>
            <Link href="/contact" className="hover:underline">Contact Us</Link>
            <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
            <Link href="/terms" className="hover:underline">Terms of Service</Link>
          </Stack>
        </SimpleGrid>
      </Container>

      {/* Bottom Footer */}
      <div className="border-t border-gray-200 dark:border-gray-700">
        <Container maxW="6xl" className="py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm">&copy; 2024 EduPlatform. All rights reserved.</p>
          <div className="flex flex-col sm:flex-row gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Mail className="w-4 h-4" />
              <span>support@eduplatform.com</span>
            </div>
            <div className="flex items-center gap-1">
              <Phone className="w-4 h-4" />
              <span>+1 (555) 123-4567</span>
            </div>
          </div>
        </Container>
      </div>
    </Box>
  )
}
