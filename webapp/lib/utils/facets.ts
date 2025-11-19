type FacetFilterState = {
  [facet: string]: string[] // Each facet holds an array of selected values
}

// Toggle a value in a multi-select facet
export function toggleFacetValue(
    current: string[],
    value: string
): string[] {
    return current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value]
}

// Check if a facet value is currently active
export function isFacetActive(
    selected: string[] | undefined,
    value: string
): boolean {
    return selected?.includes(value) ?? false
}

// Clear all filters
export function clearAllFilters(): FacetFilterState {
    return {}
}

// Clear a specific facet
export function clearFacet(
    state: FacetFilterState,
    facetKey: keyof FacetFilterState
): FacetFilterState {
    const newState = { ...state }
    delete newState[facetKey]
    return newState
}

// Convert state to URLSearchParams string
export function createFilterQueryString(state: FacetFilterState): string {
    const searchParams = new URLSearchParams()
    for (const key in state) {
        const values = state[key]
        if (Array.isArray(values) && values.length > 0) {
            values.forEach((v) => searchParams.append(key, v))
        }
    }
    return searchParams.toString()
}

// Parse filters from URLSearchParams
export function parseFiltersFromURL(searchParams: URLSearchParams): FacetFilterState {
    const filters: FacetFilterState = {}

    searchParams.forEach((value, key) => {
        if (!filters[key]) filters[key] = []
        if (!filters[key].includes(value)) {
            filters[key].push(value)
        }
    })

    return filters
}

// Apply active filters to data items
export function applyFacetFilters<T extends Record<string, any>>(
    data: T[],
    activeFilters: FacetFilterState
): T[] {
    return data.filter((item) => {
        return Object.entries(activeFilters).every(([facet, values]) => {
            if (!Array.isArray(values) || values.length === 0) return true
            const itemValue = item[facet]

            if (Array.isArray(itemValue)) {
                return values.some((v) => itemValue.includes(v))
            }

            return values.includes(String(itemValue))
        })
    })
}
