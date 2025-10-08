import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export function LoadingOverlay({ className }: { className?: string }) {
    return (
        <div
            className={cn(
                "fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm",
                className
            )}
        >
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    )
}
