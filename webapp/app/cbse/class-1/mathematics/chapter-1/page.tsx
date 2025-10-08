"use client"

import Link from "next/link"
import { useState } from "react"
import {
  Calculator,
  Clock,
  BookOpen,
  PlayCircle,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  ChevronRight,
} from "lucide-react"

const SAMPLE_CONTENT = `
<h2>Numbers 1 to 9 - Counting Objects</h2>
<p>Welcome to your first mathematics lesson! Today we'll learn about numbers 1 to 9 by counting different objects around us.</p>
<h3>What are Numbers?</h3>
<p>Numbers help us count things. Let's start with the numbers 1 to 9:</p>
<ul>
<li><strong>1 (One)</strong> - Like one sun in the sky</li>
<li><strong>2 (Two)</strong> - Like two eyes on your face</li>
<li><strong>3 (Three)</strong> - Like three wheels on a tricycle</li>
<li><strong>4 (Four)</strong> - Like four legs on a chair</li>
<li><strong>5 (Five)</strong> - Like five fingers on one hand</li>
</ul>
<h3>Let's Practice Counting!</h3>
<p>Look around your room and try to find:</p>
<ul>
<li>1 door</li>
<li>2 shoes</li>
<li>3 books</li>
<li>4 corners of a table</li>
<li>5 toys</li>
</ul>
<blockquote>
<p><strong>Remember:</strong> Counting helps us know "how many" of something we have!</p>
</blockquote>
<h3>Fun Activity</h3>
<p>Draw the correct number of objects:</p>
<ul>
<li>Draw 3 apples</li>
<li>Draw 5 stars</li>
<li>Draw 2 flowers</li>
</ul>
`

export default function Chapter1Page() {
  const [content] = useState(SAMPLE_CONTENT)

  return (
    <div className="py-8 max-w-6xl mx-auto px-4">
      <div className="flex flex-wrap items-center text-sm text-gray-500 dark:text-gray-400 space-x-1 mb-6">
        <Link href="/" className="hover:underline">Home</Link>
        <ChevronRight className="w-4 h-4" />
        <Link href="/cbse" className="hover:underline">CBSE</Link>
        <ChevronRight className="w-4 h-4" />
        <Link href="/cbse/class-1" className="hover:underline">Class 1</Link>
        <ChevronRight className="w-4 h-4" />
        <Link href="/cbse/class-1/mathematics" className="hover:underline">Mathematics</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="font-semibold">Chapter 1</span>
      </div>

      <div className="space-y-6 mb-8">
        <div className="flex items-start gap-4">
          <Calculator className="w-10 h-10 text-green-500" />
          <div>
            <h1 className="text-2xl font-bold">Numbers 1 to 9</h1>
            <p className="text-gray-600">Chapter 1 - Counting Objects</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-6 text-sm">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-green-500" /> <span className="font-semibold">Lesson</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" /> <span>15 minutes</span>
          </div>
          <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs font-semibold">Beginner</span>
        </div>

        <div className="w-full">
          <div className="flex justify-between text-sm mb-1">
            <span className="font-semibold">Lesson Progress</span>
            <span className="text-gray-500">0% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div className="bg-green-500 h-3 rounded-full w-0" />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
          <div className="p-6 border rounded-lg">
            <div className="bg-blue-50 text-blue-800 p-4 rounded mb-6">
              <strong className="block font-semibold mb-1">Interactive Lesson!</strong>
              <span>This lesson includes interactive elements and activities to help you learn better.</span>
            </div>

            <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: content }} />

            <hr className="my-8" />

            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Quick Check</h2>
              <p className="text-gray-600">Test your understanding with these quick questions:</p>

              <div className="border rounded p-4">
                <p className="font-semibold">Question 1:</p>
                <p>How many fingers do you have on both hands?</p>
                <div className="flex gap-2 mt-2">
                  <button className="border rounded px-3 py-1 text-sm">8</button>
                  <button className="border rounded px-3 py-1 text-sm">9</button>
                  <button className="border rounded px-3 py-1 text-sm bg-green-100 text-green-800 font-semibold">10</button>
                </div>
              </div>

              <div className="border rounded p-4">
                <p className="font-semibold">Question 2:</p>
                <p>Count the objects: 🍎🍎🍎</p>
                <div className="flex gap-2 mt-2">
                  <button className="border rounded px-3 py-1 text-sm">2</button>
                  <button className="border rounded px-3 py-1 text-sm bg-green-100 text-green-800 font-semibold">3</button>
                  <button className="border rounded px-3 py-1 text-sm">4</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="border rounded p-4 space-y-4">
            <h3 className="text-sm font-semibold">Chapter Progress</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Counting Objects</span>
                </div>
                <span className="text-xs text-green-800 bg-green-100 px-2 py-0.5 rounded">Current</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <PlayCircle className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500">Number Recognition</span>
                </div>
                <span className="text-xs border rounded px-2 py-0.5">Next</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <PlayCircle className="w-4 h-4" />
                <span className="text-sm">Writing Numbers</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <PlayCircle className="w-4 h-4" />
                <span className="text-sm">Number Games</span>
              </div>
            </div>
          </div>

          <div className="border rounded p-4 space-y-2">
            <h3 className="text-sm font-semibold">Learning Objectives</h3>
            <ul className="list-disc pl-4 text-sm text-gray-600 space-y-1">
              <li>Recognize numbers 1-9</li>
              <li>Count objects accurately</li>
              <li>Understand quantity concepts</li>
              <li>Practice number writing</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <Link href="/cbse/class-1/mathematics" className="inline-flex items-center gap-2 px-4 py-2 border rounded hover:bg-gray-100">
          <ArrowLeft className="w-4 h-4" /> Back to Mathematics
        </Link>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500">
          Next: Number Recognition <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
