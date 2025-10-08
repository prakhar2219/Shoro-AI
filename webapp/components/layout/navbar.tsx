"use client"

import Link from "next/link"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import { useState, useRef } from "react"
import {
  Menu,
  X,
  ChevronDown,
  Sun,
  Moon,
  BookOpen,
} from "lucide-react"
import CountrySelector from "@/components/custom/CountrySelector"

const NAV_ITEMS = [
  {
    label: "Boards",
    children: [
      {
        label: "CBSE",
        subLabel: "Central Board of Secondary Education",
        href: "/cbse",
      },
      {
        label: "NCERT",
        subLabel: "National Council of Educational Research",
        href: "/ncert",
      },
      {
        label: "State Boards",
        subLabel: "Various state education boards",
        href: "/state-boards",
      },
    ],
  },
  {
    label: "Classes",
    children: [
      {
        label: "Primary (1-5)",
        subLabel: "Foundation classes",
        href: "/classes/primary",
      },
      {
        label: "Middle (6-8)",
        subLabel: "Middle school classes",
        href: "/classes/middle",
      },
      {
        label: "Secondary (9-10)",
        subLabel: "High school classes",
        href: "/classes/secondary",
      },
    ],
  },
  { label: "Resources", href: "/resources" },
  { label: "About", href: "/about" },
]

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const leaveTimeout = useRef<NodeJS.Timeout | null>(null)
  const { theme, setTheme } = useTheme()
  const router = useRouter()

  const handleMouseEnter = (label: string) => {
    if (leaveTimeout.current) clearTimeout(leaveTimeout.current)
    setActiveDropdown(label)
  }

  const handleMouseLeave = () => {
    leaveTimeout.current = setTimeout(() => {
      setActiveDropdown(null)
    }, 150)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3 md:py-4">
        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setMobileOpen((prev) => !prev)}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <BookOpen className="w-6 h-6 text-blue-600" />
          <span className="text-xl font-bold text-blue-600">EduPlatform</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex space-x-6 items-center">
          <CountrySelector className="mr-4" />
          {NAV_ITEMS.map((item) => (
            <div
              key={item.label}
              className="relative"
              onMouseEnter={() => item.children && handleMouseEnter(item.label)}
              onMouseLeave={handleMouseLeave}
            >
              <Link
                href={item.href ?? "#"}
                className="text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-white font-medium flex items-center"
              >
                {item.label}
                {item.children && <ChevronDown className="ml-1 w-4 h-4" />}
              </Link>

              {item.children && activeDropdown === item.label && (
                <div className="absolute left-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-md shadow-lg py-2 z-50">
                  {item.children.map((child) => (
                    <Link
                      key={child.label}
                      href={child.href}
                      className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="font-medium text-gray-800 dark:text-gray-100">
                        {child.label}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {child.subLabel}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Right Controls */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {theme === "light" ? (
              <Moon className="w-4 h-4" />
            ) : (
              <Sun className="w-4 h-4" />
            )}
          </button>

          <Link
            href="/editor"
            className="hidden md:inline text-sm font-medium text-gray-600 dark:text-gray-300 hover:underline"
          >
            Editor
          </Link>

          <button
            onClick={() => router.push("/get-started")}
            className="hidden md:inline-block bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded hover:bg-blue-500"
          >
            Get Started
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="absolute top-full left-0 w-full bg-white dark:bg-gray-900 shadow-md z-40 px-4 pb-4">
          <div className="pt-4 mb-4">
            <CountrySelector className="w-full" />
          </div>
          <nav className="space-y-2">
            {NAV_ITEMS.map((item) => (
              <div key={item.label}>
                <Link
                  href={item.href ?? "#"}
                  className="block font-medium text-gray-700 dark:text-gray-200 py-2"
                >
                  {item.label}
                </Link>
                {item.children && (
                  <div className="ml-4 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.label}
                        href={child.href}
                        className="block text-sm text-gray-500 dark:text-gray-400"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
          <div className="mt-4 space-y-2">
            <Link
              href="/editor"
              className="block text-sm text-gray-600 dark:text-gray-300"
            >
              Editor
            </Link>
            <Link
              href="/get-started"
              className="block bg-blue-600 text-white text-center text-sm font-semibold px-4 py-2 rounded hover:bg-blue-500"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
