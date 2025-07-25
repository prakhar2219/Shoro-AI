// components/boards/BoardTable.tsx

import { FC } from "react";

import { BoardCard } from "./BoardCard";

import { EmptyState } from "@/components/shared/EmptyState";
import { SkeletonTable } from "../ui/skeleton-table";

type Board = any

interface BoardTableProps {
    boards: Board[];
    loading?: boolean;
    onEdit: (board: Board) => void;
    onDelete: (boardId: string) => void;
}

export const BoardTable: FC<BoardTableProps> = ({
    boards,
    loading = false,
    onEdit,
    onDelete,
}) => {
    if (loading) return <SkeletonTable />;

    if (!boards.length)
        return (
            <EmptyState
                title="No Boards Found"
                message="Start by adding a new board or importing via CSV."
            />
        );

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {boards.map((board) => (
                <BoardCard
                    key={board.id}
                    board={board}
                    onEdit={() => onEdit(board)}
                    onDelete={() => onDelete(board.id)}
                />
            ))}
        </div>
    );
};
