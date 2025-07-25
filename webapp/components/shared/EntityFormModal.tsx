"use client"

import * as Dialog from "@radix-ui/react-dialog"
import { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

type EntityFormModalProps = {
    title: string
    description?: string
    trigger?: ReactNode
    children: ReactNode
    onSubmit?: () => void
    onClose?: () => void
    open?: boolean
    isSubmitting?: boolean
    submitLabel?: string
    onOpenChange?: (open: boolean) => void
}

export function EntityFormModal({
    title,
    description,
    trigger,
    children,
    onSubmit,
    onClose,
    isSubmitting = false,
    open = false,
    submitLabel = "Save",
    onOpenChange,
}: EntityFormModalProps) {
    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
                <Dialog.Content
                    className={cn(
                        "fixed z-50 left-1/2 top-1/2 w-[90vw] max-w-lg -translate-x-1/2 -translate-y-1/2",
                        "rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900",
                        "p-6 shadow-lg focus:outline-none"
                    )}
                >
                    {/* Title + Close Icon */}
                    <div className="flex justify-between items-start">
                        <Dialog.Title className="text-lg font-semibold dark:text-white">
                            {title}
                        </Dialog.Title>
                        <Dialog.Close asChild>
                            <button
                                onClick={onClose}
                                className="text-red-600 hover:text-red-800 p-1 rounded-md transition"
                                aria-label="Close"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </Dialog.Close>
                    </div>

                    {/* Description */}
                    {description && (
                        <Dialog.Description className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                            {description}
                        </Dialog.Description>
                    )}

                    {/* Form content */}
                    <div className="mt-4 space-y-4">{children}</div>

                    {/* Submit button */}
                    {onSubmit && (
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={onSubmit}
                                disabled={isSubmitting}
                                className={cn(
                                    "px-4 py-2 rounded-md text-sm bg-blue-600 text-white hover:bg-blue-700 transition",
                                    isSubmitting && "opacity-60 cursor-not-allowed"
                                )}
                            >
                                {submitLabel}
                            </button>
                        </div>
                    )}
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}
