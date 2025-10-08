import { Skeleton } from "@/components/ui/skeleton"

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
    return (
        <div className="space-y-2 rounded-md border p-4">
            {[...Array(rows)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-1/6" />
                </div>
            ))}
        </div>
    )
}
