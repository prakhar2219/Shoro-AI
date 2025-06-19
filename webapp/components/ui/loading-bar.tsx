"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Box, Progress } from "@chakra-ui/react"

export function LoadingBar() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const handleStart = () => setLoading(true)
    const handleComplete = () => setLoading(false)

    // For Next.js 13+ App Router with React 18
    let timeoutId: NodeJS.Timeout

    const handleRouteChange = () => {
      handleStart()
      timeoutId = setTimeout(handleComplete, 500)
    }

    // Cleanup function for React 18 strict mode
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      handleComplete()
    }
  }, [router])

  if (!loading) return null

  return (
    <Box position="fixed" top={0} left={0} right={0} zIndex={9999}>
      <Progress size="xs" isIndeterminate colorScheme="brand" />
    </Box>
  )
}
