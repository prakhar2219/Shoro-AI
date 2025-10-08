"use client"

import Link from "next/link"
import {
  BookOpen,
  Users,
  Clock,
  ChevronRight,
} from "lucide-react"

const CBSE_CLASSES = [
  { id: 1, name: "Class 1", subjects: ["English", "Mathematics", "EVS", "Hindi", "Art"], students: "2.5M" },
  { id: 2, name: "Class 2", subjects: ["English", "Mathematics", "EVS", "Hindi", "Art"], students: "2.3M" },
  { id: 3, name: "Class 3", subjects: ["English", "Mathematics", "EVS", "Hindi", "Art", "Computer"], students: "2.1M" },
  { id: 4, name: "Class 4", subjects: ["English", "Mathematics", "EVS", "Hindi", "Art", "Computer"], students: "2.0M" },
  { id: 5, name: "Class 5", subjects: ["English", "Mathematics", "Science", "Social Studies", "Hindi", "Art", "Computer"], students: "1.9M" },
  { id: 6, name: "Class 6", subjects: ["English", "Mathematics", "Science", "Social Studies", "Hindi", "Sanskrit", "Art", "Computer"], students: "1.8M" },
  { id:  7, name: "Class 7", subjects: ["English", "Mathematics", "Science", "Social Studies", "Hindi", "Sanskrit", "Art", "Computer"], students: "1.7M" },
  { id: 8, name: "Class 8", subjects: ["English", "Mathematics", "Science", "Social Studies", "Hindi", "Sanskrit", "Art", "Computer", "Physical Education"], students: "1.6M" },
  { id: 9, name: "Class 9", subjects: ["English", "Mathematics", "Science", "Social Studies", "Hindi", "Sanskrit", "Art", "Computer", "Physical Education", "Health"], students: "1.5M" },
  { id: 10, name: "Class 10", subjects: ["English", "Mathematics", "Science", "Social Studies", "Hindi", "Sanskrit", "Art", "Computer", "Physical Education", "Health"], students: "1.4M" },
]

export default function CBSEPage() {
  return (
    <div className="px-4 py-8 max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
        <Link href="/" className="hover:underline text-blue-600">Home</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-700 dark:text-gray-300">CBSE</span>
      </div>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row gap-6 mb-12">
        <BookOpen className="w-12 h-12 text-blue-600 shrink-0" />
        <div>
          <h1 className="text-3xl font-bold mb-1">CBSE Board</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Central Board of Secondary Education
          </p>
          <p className="mt-4 text-gray-700 dark:text-gray-300 max-w-4xl">
            The Central Board of Secondary Education (CBSE) is a national level board of education in India for public
            and private schools, controlled and managed by the Government of India. Access comprehensive study
            materials, practice questions, and resources for all CBSE classes.
          </p>
          <div className="flex gap-6 mt-4">
            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="font-medium">15M+ Students</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="font-medium">Updated Curriculum</span>
            </div>
          </div>
        </div>
      </div>

      {/* Class Cards */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-6">Select Your Class</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CBSE_CLASSES.map((cls) => (
            <Link
              key={cls.id}
              href={`/cbse/class-${cls.id}`}
              className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow hover:-translate-y-1 transition-transform block"
            >
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">{cls.name}</h3>
                  <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded-full">
                    {cls.students}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {cls.subjects.length} Subjects Available
                </p>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Subjects:</p>
                  <div className="flex flex-wrap gap-2">
                    {cls.subjects.slice(0, 4).map((subj) => (
                      <span
                        key={subj}
                        className="border border-gray-300 dark:border-gray-600 text-xs px-2 py-1 rounded"
                      >
                        {subj}
                      </span>
                    ))}
                    {cls.subjects.length > 4 && (
                      <span className="border border-gray-300 dark:border-gray-600 text-xs px-2 py-1 rounded">
                        +{cls.subjects.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
