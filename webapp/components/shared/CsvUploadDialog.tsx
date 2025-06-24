// components/shared/CsvUploadDialog.tsx
"use client"

import * as Dialog from "@radix-ui/react-dialog"
import { useState, ChangeEvent } from "react"
import { cn } from "@/lib/utils"
import Papa from "papaparse"

type CsvUploadDialogProps = {
    open?: boolean
    trigger?: React.ReactNode
    title?: string
    onUpload: (rows: any[]) => void
    schema?: any 
    onOpenChange?: (open: boolean) => void
}

export function CsvUploadDialog({ trigger, title = "Upload CSV", onUpload, schema, open = false, onOpenChange }: CsvUploadDialogProps) {
    const [parsedRows, setParsedRows] = useState<any[]>([])
    const [error, setError] = useState<string | null>(null)

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (result) => {
                const rows = result.data as any[]
                if (schema) {
                    try {
                        const validated = rows.map((row, index) =>
                            schema.parse(row) // can wrap in safeParse for per-row error handling
                        )
                        setParsedRows(validated)
                        setError(null)
                    } catch (err: any) {
                        setError("CSV validation failed. Please check format.")
                        console.error(err)
                    }
                } else {
                    setParsedRows(rows)
                    setError(null)
                }
            },
            error: () => {
                setError("Failed to parse CSV.")
            },
        })
    }

    const handleUpload = () => {
        onUpload(parsedRows)
    }

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
                <Dialog.Content
                    className={cn(
                        "fixed z-50 left-1/2 top-1/2 w-[90vw] max-w-xl -translate-x-1/2 -translate-y-1/2",
                        "rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900",
                        "p-6 shadow-lg focus:outline-none"
                    )}
                >
                    <Dialog.Title className="text-lg font-semibold dark:text-white">{title}</Dialog.Title>

                    <div className="mt-4">
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-zinc-700 dark:text-zinc-200 file:bg-blue-600 file:text-white file:rounded-md file:px-4 file:py-2 file:cursor-pointer file:hover:bg-blue-700"
                        />
                    </div>

                    {error && (
                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
                    )}

                    {parsedRows.length > 0 && (
                        <div className="mt-4 text-sm text-zinc-600 dark:text-zinc-300">
                            Parsed {parsedRows.length} rows successfully.
                        </div>
                    )}

                    <div className="mt-6 flex justify-end gap-2">
                        <Dialog.Close asChild>
                            <button
                                className="px-4 py-2 rounded-md text-sm bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-100 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition"
                            >
                                Cancel
                            </button>
                        </Dialog.Close>
                        <button
                            onClick={handleUpload}
                            disabled={!parsedRows.length}
                            className={cn(
                                "px-4 py-2 rounded-md text-sm bg-green-600 text-white hover:bg-green-700 transition",
                                !parsedRows.length && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            Upload
                        </button>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}
