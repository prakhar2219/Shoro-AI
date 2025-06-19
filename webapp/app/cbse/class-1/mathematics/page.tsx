"use client"

import Link from "next/link"
import {
  Calculator,
  FileText,
  PlayCircle,
  BookOpen,
  CheckCircle,
  Clock,
  ChevronRight,
} from "lucide-react"

const CHAPTERS = [
  {
    id: 1,
    title: "Numbers 1 to 9",
    description: "Introduction to numbers and counting",
    topics: [
      { id: 1, title: "Counting Objects", type: "lesson", duration: "15" },
      { id: 2, title: "Number Recognition", type: "practice", duration: "10" },
      { id: 3, title: "Writing Numbers", type: "activity", duration: "20" },
      { id: 4, title: "Number Games", type: "quiz", duration: "15" },
    ],
    progress: 0,
    completed: false,
  },
  // ... other chapters
]

const getTypeIcon = (type: string) => {
  switch (type) {
    case "lesson":
      return <BookOpen className="w-5 h-5 text-blue-500" />
    case "practice":
      return <FileText className="w-5 h-5 text-green-500" />
    case "activity":
      return <PlayCircle className="w-5 h-5 text-purple-500" />
    case "quiz":
      return <CheckCircle className="w-5 h-5 text-orange-500" />
    default:
      return <FileText className="w-5 h-5 text-gray-500" />
  }
}

export default function MathematicsPage() {
  function getTypeColor(type: string) {
    switch (type) {
      case "lesson":
        return "blue"
      case "practice":
        return "green"
      case "activity":
        return "purple"
      case "quiz":
        return "orange"
      default:
        return "gray"
    }
  }
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300 mb-8">
        <Link href="/" className="hover:underline">Home</Link>
        <ChevronRight className="w-4 h-4" />
        <Link href="/cbse" className="hover:underline">CBSE</Link>
        <ChevronRight className="w-4 h-4" />
        <Link href="/cbse/class-1" className="hover:underline">Class 1</Link>
        <ChevronRight className="w-4 h-4" />
        <span>Mathematics</span>
      </nav>

      <div className="space-y-6 mb-12">
        <div className="flex items-start space-x-4">
          <Calculator className="w-12 h-12 text-green-500" />
          <div>
            <h1 className="text-3xl font-bold">Mathematics - Class 1</h1>
            <p className="text-gray-600">Numbers and Basic Operations</p>
          </div>
        </div>

        <p className="text-gray-700 max-w-4xl">
          Mathematics for Class 1 introduces young learners to the wonderful world of numbers...
        </p>

        <div className="flex space-x-8 text-sm">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-green-500" />
            <span className="font-semibold">10 Chapters</span>
          </div>
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-green-500" />
            <span className="font-semibold">38 Topics</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-green-500" />
            <span className="font-semibold">~8 Hours</span>
          </div>
        </div>

        <div className="w-full">
          <div className="flex justify-between mb-1 text-sm font-medium">
            <span>Overall Progress</span>
            <span className="text-gray-500">0% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div className="bg-green-500 h-3 rounded-full" style={{ width: '0%' }}></div>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-4">Course Content</h2>

      <div className="space-y-4">
        {CHAPTERS.map((chapter) => (
          <details key={chapter.id} className="border border-gray-200 dark:border-gray-700 rounded-md">
            <summary className="p-4 cursor-pointer select-none flex justify-between items-start">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-lg">
                    Chapter {chapter.id}: {chapter.title}
                  </span>
                  {chapter.completed && <CheckCircle className="w-4 h-4 text-green-500" />}
                </div>
                <p className="text-gray-600 text-sm">{chapter.description}</p>
                <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                  <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded">{chapter.topics.length} Topics</span>
                  <span>{chapter.topics.reduce((acc, t) => acc + parseInt(t.duration), 0)} min total</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-500">{chapter.progress}% Complete</span>
                <div className="w-24 bg-gray-200 h-2 rounded-full mt-1">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${chapter.progress}%` }}></div>
                </div>
              </div>
            </summary>
            <ul className="px-6 pb-4 space-y-2">
              {chapter.topics.map((topic) => (
                <li key={topic.id}>
                  <Link href={`/cbse/class-1/mathematics/chapter-${chapter.id}`} className="block border rounded-md p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                    <div className="flex justify-between items-center">
                      <div className="flex space-x-3">
                        {getTypeIcon(topic.type)}
                        <div>
                          <p className="font-medium">{topic.title}</p>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <span className={`px-2 py-0.5 rounded bg-${getTypeColor(topic.type)}-100 text-${getTypeColor(topic.type)}-800`}>{topic.type}</span>
                            <span>{topic.duration} min</span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </details>
        ))}
      </div>
    </div>
  )
}
