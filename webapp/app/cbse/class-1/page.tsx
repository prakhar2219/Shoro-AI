"use client"

import Link from "next/link"
import {
  BookOpen,
  FileText,
  Users,
  Clock,
  ChevronRight,
  Calculator,
  Globe,
  Palette,
} from "lucide-react"

const SUBJECTS = [
  {
    id: "english",
    name: "English",
    description: "Language and Literature",
    icon: BookOpen,
    color: "text-blue-500",
    badge: "bg-blue-100 text-blue-700",
    chapters: 12,
    progress: 0,
    topics: 45,
  },
  {
    id: "mathematics",
    name: "Mathematics",
    description: "Numbers and Basic Operations",
    icon: Calculator,
    color: "text-green-500",
    badge: "bg-green-100 text-green-700",
    chapters: 10,
    progress: 0,
    topics: 38,
  },
  {
    id: "evs",
    name: "Environmental Studies",
    description: "Our Environment and Surroundings",
    icon: Globe,
    color: "text-teal-500",
    badge: "bg-teal-100 text-teal-700",
    chapters: 8,
    progress: 0,
    topics: 32,
  },
  {
    id: "hindi",
    name: "Hindi",
    description: "Hindi Language and Literature",
    icon: FileText,
    color: "text-orange-500",
    badge: "bg-orange-100 text-orange-700",
    chapters: 10,
    progress: 0,
    topics: 40,
  },
  {
    id: "art",
    name: "Art & Craft",
    description: "Creative Arts and Drawing",
    icon: Palette,
    color: "text-pink-500",
    badge: "bg-pink-100 text-pink-700",
    chapters: 6,
    progress: 0,
    topics: 24,
  },
]

export default function Class1Page() {
  return (
    <div className="py-8 px-4 max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
        <Link href="/">Home</Link>
        <ChevronRight className="w-4 h-4" />
        <Link href="/cbse">CBSE</Link>
        <ChevronRight className="w-4 h-4" />
        <span>Class 1</span>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-6 mb-12">
        <div className="flex items-start gap-4">
          <BookOpen className="w-12 h-12 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">CBSE Class 1</h1>
            <p className="text-gray-600">Foundation Level - Primary Education</p>
          </div>
        </div>

        <p className="text-gray-700 max-w-4xl">
          Class 1 is the foundation of formal education. Our curriculum focuses on building basic literacy,
          numeracy, and environmental awareness through interactive and engaging content designed specifically
          for young learners.
        </p>

        <div className="flex flex-wrap gap-6 text-sm text-gray-700">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-500" />
            <span className="font-medium">2.5M+ Students</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-500" />
            <span className="font-medium">5 Subjects</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-500" />
            <span className="font-medium">Age 5-6 Years</span>
          </div>
        </div>
      </div>

      {/* Subjects */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Subjects</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SUBJECTS.map((subject) => (
            <Link
              key={subject.id}
              href={`/cbse/class-1/${subject.id}`}
              className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:-translate-y-1 transition-transform"
            >
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <subject.icon className={`w-8 h-8 ${subject.color}`} />
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${subject.badge}`}>{subject.chapters} Chapters</span>
                </div>

                <div>
                  <h3 className="text-lg font-semibold">{subject.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{subject.description}</p>
                </div>

                <div className="w-full">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>{subject.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded">
                    <div
                      className={`h-2 rounded ${subject.color}`}
                      style={{ width: `${subject.progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex justify-between text-xs text-gray-500">
                  <span>{subject.topics} Topics</span>
                  <span>Start Learning →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
