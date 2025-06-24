// utils/csv-utils.ts

/**
 * Parses a CSV string and returns an array of objects.
 * Assumes the first row is headers.
 */
export function parseCSV(csvText: string): Record<string, string>[] {
    const [headerLine, ...lines] = csvText.trim().split("\n")
    const headers = headerLine.split(",").map(h => h.trim())

    return lines.map(line => {
        const values = line.split(",").map(v => v.trim())
        const entry: Record<string, string> = {}
        headers.forEach((header, i) => {
            entry[header] = values[i] ?? ""
        })
        return entry
    })
}

/**
 * Converts an array of objects into a CSV string.
 */
export function convertToCSV(data: Record<string, any>[]): string {
    if (!data.length) return ""

    const headers = Object.keys(data[0])
    const csvRows = [headers.join(",")]

    for (const row of data) {
        const values = headers.map(header => {
            const cell = row[header]
            // Escape quotes and commas in values
            const escaped = typeof cell === "string"
                ? `"${cell.replace(/"/g, '""')}"`
                : cell
            return escaped
        })
        csvRows.push(values.join(","))
    }

    return csvRows.join("\n")
}

/**
 * Triggers a download of a CSV file in the browser.
 */
export function downloadCSV(data: Record<string, any>[], filename = "data.csv") {
    const csv = convertToCSV(data)
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}

/**
 * Returns header names from a CSV string.
 */
export function getCSVHeaders(csvText: string): string[] {
    const [headerLine] = csvText.trim().split("\n")
    return headerLine.split(",").map(h => h.trim())
}
