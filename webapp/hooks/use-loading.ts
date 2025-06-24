import { useState, useCallback } from "react"

export function useLoading(defaultState = false) {
    const [isLoading, setIsLoading] = useState(defaultState)

    const startLoading = useCallback(() => setIsLoading(true), [])
    const stopLoading = useCallback(() => setIsLoading(false), [])

    return { isLoading, startLoading, stopLoading }
}
