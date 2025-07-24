import { FC } from "react";
import { ChapterCard } from "./ChapterCard";
import { EmptyState } from "@/components/shared/EmptyState";

interface ChapterTableProps {
    items: any[];
    onEdit: (item: any) => void;
    onDelete: (item: any) => void;
}

export const ChapterTable: FC<ChapterTableProps> = ({ items, onEdit, onDelete }) => {
    if (!items || items.length === 0) {
        return <EmptyState title="No Chapters Found" message="Try adding a new chapter." />;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {items.map((chapter) => (
                <ChapterCard
                    key={chapter._id || chapter.id}
                    chapter={chapter}
                    onEdit={() => onEdit(chapter)}
                    onDelete={() => onDelete(chapter)}
                />
            ))}
        </div>
    );
}; 