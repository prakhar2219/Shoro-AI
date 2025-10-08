// components/shared/EmptyState.tsx

type EmptyStateProps = {
    title?: string
    message?: string
    action?: React.ReactNode
}

export function EmptyState({
    title = "No items found",
    message = "There’s nothing here yet. Try adding something.",
    action,
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg">
            <div className="text-lg font-medium text-zinc-800 dark:text-white mb-2">{title}</div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">{message}</p>
            {action}
        </div>
    )
}
