"use client"

import { useState } from "react"
import { TipTapRenderer } from "./tiptap-renderer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface TipTapContentArrayProps {
  content: any[] | null | undefined
  className?: string
  showNavigation?: boolean
  showEmptyState?: boolean
}

export function TipTapContentArray({ 
  content, 
  className, 
  showNavigation = true, 
  showEmptyState = true 
}: TipTapContentArrayProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Handle empty or invalid content
  if (!content || !Array.isArray(content) || content.length === 0) {
    if (!showEmptyState) {
      return null
    }
    return (
      <div className={className}>
        <div className="text-gray-500 text-center py-8">
          <p>No content available.</p>
        </div>
      </div>
    )
  }

  const totalItems = content.length
  const currentContent = content[currentIndex]

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : totalItems - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev < totalItems - 1 ? prev + 1 : 0))
  }

  return (
    <div className={className}>
      {/* Navigation */}
      {showNavigation && totalItems > 1 && (
        <div className="flex items-center justify-between mb-4 p-4 bg-gray-50 rounded-lg">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPrevious}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {currentIndex + 1} of {totalItems}
            </Badge>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={goToNext}
            className="flex items-center gap-2"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Content */}
      <TipTapRenderer 
        content={currentContent} 
        showEmptyState={showEmptyState}
      />

      {/* Bottom Navigation */}
      {showNavigation && totalItems > 1 && (
        <div className="flex items-center justify-center mt-4 gap-2">
          {content.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex 
                  ? 'bg-blue-600' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to content ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
} 