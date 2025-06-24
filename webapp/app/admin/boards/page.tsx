// app/admin/boards/page.tsx

"use client";

import { useEffect, useState } from "react";
import { getBoards, createBoard, updateBoard, deleteBoard } from "@/lib/api/entities/boards";
import { getCountries } from "@/lib/api/entities/countries";
import { PageTitleWithActions } from "@/components/shared/PageTitleWithActions";
import { BoardCard } from "@/components/entity/BoardCard";
import { EntityFormModal } from "@/components/shared/EntityFormModal";
import { CsvUploadDialog } from "@/components/shared/CsvUploadDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { toast } from "sonner";
import { BoardForm } from "@/components/entity/BoardForm";
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";

type Board = any;
type BoardInput = any;

const initialBoards: Board[] = [
    { id: "1", name: "Board 1", countryName: "India" },
    { id: "2", name: "Board 2", countryName: "United States" },
    { id: "3", name: "Board 3", countryName: "Canada" },
];


export default function BoardAdminPage() {
    const [boards, setBoards] = useState<Board[]>([]);
    const [countries, setCountries] = useState<{ id: string; name: string }[]>([]);
    const [selected, setSelected] = useState<Board | null>(null);
    const [openModal, setOpenModal] = useState(false);
    const [openCsvDialog, setOpenCsvDialog] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Board | null>(null)

    useEffect(() => {
        fetchBoards();
        fetchCountries();
    }, []);

    const fetchBoards = async () => {
        // const result = await getBoards();
        setBoards(initialBoards);
    };

    const fetchCountries = async () => {
        const result = await getCountries();
        setCountries(result);
    };

    const handleSave = async (data: BoardInput) => {
        if (selected) {
            await updateBoard(selected.id, data);
            toast.success("Board updated");
        } else {
            await createBoard(data);
            toast.success("Board created");
        }
        fetchBoards();
        setOpenModal(false);
        setSelected(null);
    };

    const handleDelete = async () => {
        if (deleteTarget?.id) {
            await deleteBoard(deleteTarget.id)
            toast.success("Board deleted")
            setDeleteTarget(null)
            fetchBoards()
        }
    }

    return (
        <div className="p-6 space-y-6">
            <PageTitleWithActions
                title="Boards"
                onAddClick={() => {
                    setSelected(null);
                    setOpenModal(true);
                }}
                onImportClick={() => setOpenCsvDialog(true)}
            />

            {boards.length === 0 ? (
                <EmptyState title="No boards found" />
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {boards.map((board) => (
                        <BoardCard
                            key={board.id}
                            board={board}
                            onEdit={() => {
                                setSelected(board);
                                setOpenModal(true);
                            }}
                            onDelete={() => setDeleteTarget(board)}
                        />
                    ))}
                </div>
            )}

            <EntityFormModal
                title={selected ? "Edit Board" : "Add Board"}
                open={openModal}
                onOpenChange={setOpenModal}
            >
                <BoardForm
                    initialData={selected}
                    countries={countries}
                    onSubmit={handleSave}
                />
            </EntityFormModal>

            <ConfirmationDialog
                open={!!deleteTarget}
                title="Delete Board"
                description={`Are you sure you want to delete "${deleteTarget?.name}"?`}
                onCancel={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
            />

            <CsvUploadDialog
                open={openCsvDialog}
                onOpenChange={setOpenCsvDialog}
                title="board"
                onUpload={() => {
                    toast.success("CSV imported");
                    // fetchBoards();
                }}
            />
        </div>
    );
}
