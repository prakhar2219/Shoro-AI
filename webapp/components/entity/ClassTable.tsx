// components/classes/ClassTable.tsx

import { FC } from "react";
type ClassEntity = any; // Replace with actual ClassEntity type
import { ClassCard } from "./ClassCard";
import { EmptyState } from "@/components/shared/EmptyState";

interface ClassTableProps {
    items: ClassEntity[];
    onEdit: (item: ClassEntity) => void;
    onDelete: (item: ClassEntity) => void;
}

export const ClassTable: FC<ClassTableProps> = ({ items, onEdit, onDelete }) => {
    if (items.length === 0) {
        return <EmptyState title="No Classes Found" message="Try adding a new class." />;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {items.map((cls) => (
                <ClassCard
                    key={cls.id}
                    classItem={cls}
                    onEdit={() => onEdit(cls)}
                    onDelete={() => onDelete(cls)}
                />
            ))}
        </div>
    );
};
