// components/shared/PageTitleWithActions.tsx
import { Button } from "@/components/ui/button"
import { Plus, Upload } from "lucide-react"

interface PageTitleWithActionsProps {
    title: string
    onAddClick?: () => void
    onImportClick?: () => void
}

export function PageTitleWithActions({
    title,
    onAddClick,
    onImportClick,
}: PageTitleWithActionsProps) {
    return (
        <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold dark:text-white">{title}</h1>
            <div className="flex gap-2">
                {onImportClick && (
                    <Button variant="outline" onClick={onImportClick}>
                        <Upload className="w-4 h-4 mr-2" />
                        Import CSV
                    </Button>
                )}
                {onAddClick && (
                    <Button onClick={onAddClick}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add
                    </Button>
                )}
            </div>
        </div>
    )
}
