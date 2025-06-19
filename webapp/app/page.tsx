"use client"

import {
  BookOpen,
  Award,
  GraduationCap,
  Target,
} from "lucide-react"
import Link from "next/link"
import { useTheme } from "next-themes"

import ClassCard from "@/components/custom/cards/ClassCard"
import BoardCard from "@/components/custom/cards/BoardCard"
import Hero from "@/components/custom/Banners/Hero"
import StatsSection from "@/components/custom/HomePage/StatsSection"
import CtaSection from "@/components/custom/common/CtaSection"
import BoardsSection from "@/components/custom/HomePage/BoardSection"
import ClassesSection from "@/components/custom/HomePage/ClassesSection"



export default function HomePage() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  return (
    <div>
      {/* Hero Section */}
      <Hero isDark={isDark} />

      {/* Stats Section */}
      <StatsSection />

      {/* Boards Section */}
      <BoardsSection />

      {/* Classes Section */}
      <ClassesSection />

      {/* CTA Section */}
      <CtaSection />
    </div>
  )
}
