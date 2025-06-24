// components/classes/ClassCard.tsx

import { FC } from "react";
import { EntityCard } from "@/components/shared/EntityCard";

type ClassEntity = any;

interface ClassCardProps {
    classItem: ClassEntity;
    onEdit: () => void;
    onDelete: () => void;
}

export const ClassCard: FC<ClassCardProps> = ({ classItem, onEdit, onDelete }) => {
    return (
        <EntityCard
            title={classItem.name}
            subtitle={`Code: ${classItem.code ?? "—"}`}
            onEdit={onEdit}
            onDelete={onDelete}
        />
    );
};
