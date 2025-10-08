"use client"

import { useEffect } from "react"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import Link from "next/link"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md text-center space-y-8">
        <div className="flex justify-center">
          <AlertTriangle className="w-20 h-20 text-red-500 dark:text-red-300" />
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-2">Something went wrong!</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            We encountered an unexpected error. Don&apos;t worry, our team has been notified and we&apos;re working to fix it.
          </p>
        </div>

        <div className="bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded p-4 text-left text-sm text-red-800 dark:text-red-200">
          <p><strong>Error:</strong> {error.message || "An unexpected error occurred"}</p>
          {error.digest && (
            <p className="text-xs text-gray-500 mt-1">Error ID: {error.digest}</p>
          )}
        </div>

        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-500 transition"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  )
}
