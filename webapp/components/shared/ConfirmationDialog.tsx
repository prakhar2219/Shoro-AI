// components/shared/ConfirmationDialog.tsx
"use client"

import * as AlertDialog from "@radix-ui/react-alert-dialog"

type ConfirmationDialogProps = {
    trigger?: React.ReactNode
    title?: string
    open?: boolean
    description?: string
    confirmText?: string
    cancelText?: string
    onConfirm: () => void
    onCancel: () => void
}

export function ConfirmationDialog({
    open,
    trigger,
    title = "Are you sure?",
    description = "This action cannot be undone.",
    confirmText = "Delete",
    cancelText = "Cancel",
    onConfirm,
    onCancel,
}: ConfirmationDialogProps) {
    return (
        <AlertDialog.Root open={open}>
            <AlertDialog.Trigger asChild>{trigger}</AlertDialog.Trigger>
            <AlertDialog.Portal>
                <AlertDialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
                <AlertDialog.Content className="fixed z-50 left-1/2 top-1/2 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-6 shadow-xl">
                    <AlertDialog.Title className="text-lg font-semibold text-zinc-900 dark:text-white">{title}</AlertDialog.Title>
                    <AlertDialog.Description className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                        {description}
                    </AlertDialog.Description>
                    <div className="mt-6 flex justify-end gap-3">
                        <AlertDialog.Cancel asChild>
                            <button
                                onClick={onCancel}
                                className="px-4 py-2 text-sm rounded-md bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-300 dark:hover:bg-zinc-600">
                                {cancelText}
                            </button>
                        </AlertDialog.Cancel>
                        <AlertDialog.Action asChild>
                            <button
                                onClick={onConfirm}
                                className="px-4 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700"
                            >
                                {confirmText}
                            </button>
                        </AlertDialog.Action>
                    </div>
                </AlertDialog.Content>
            </AlertDialog.Portal>
        </AlertDialog.Root>
    )
}
