"use client"

import { useEffect, useState } from "react"
import {
    getClasses,
    createClass,
    updateClass,
    deleteClass,
} from "@/lib/api/entities/classes"
import { bulkUploadEntities } from "@/lib/api/bulk"
import { PageTitleWithActions } from "@/components/shared/PageTitleWithActions"
import { CsvUploadDialog } from "@/components/shared/CsvUploadDialog"
import { EmptyState } from "@/components/shared/EmptyState"
import { EntityFormModal } from "@/components/shared/EntityFormModal"
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog"
import { ClassForm } from "@/components/entity/ClassForm"
import { ClassCard } from "@/components/entity/ClassCard"
import { useLoading } from "@/hooks/use-loading"
import { toast } from "sonner"

type ClassEntity = {
    id: string
    name: string
    code?: string
}

type ClassEntityInput = {
    name: string
    code?: string
}

const initialClasses: ClassEntity[] = [
    { id: "1", name: "Math 101", code: "MTH101" },
    { id: "2", name: "History 201", code: "HIS201" },
    { id: "3", name: "Science 301", code: "SCI301" },
]

export default function AdminClassesPage() {
    const [classes, setClasses] = useState<ClassEntity[]>([])
    const [formOpen, setFormOpen] = useState(false)
    const [csvDialogOpen, setCsvDialogOpen] = useState(false)
    const [editing, setEditing] = useState<ClassEntity | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<ClassEntity | null>(null)
    const { isLoading, startLoading, stopLoading } = useLoading()

    const fetchData = async () => {
        startLoading()
        // const data = await getClasses()
        setClasses(initialClasses)
        stopLoading()
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleSave = async (data: ClassEntityInput) => {
        startLoading()
        try {
            if (editing) {
                await updateClass(editing.id, data)
                toast.success("Class updated")
            } else {
                await createClass(data)
                toast.success("Class created")
            }
            fetchData()
        } catch (err) {
            toast.error("Something went wrong")
        } finally {
            stopLoading()
            setFormOpen(false)
            setEditing(null)
        }
    }

    const handleDelete = async () => {
        if (!deleteTarget) return
        startLoading()
        try {
            await deleteClass(deleteTarget.id)
            toast.success("Class deleted")
            fetchData()
        } catch (err) {
            toast.error("Delete failed")
        } finally {
            stopLoading()
            setDeleteTarget(null)
        }
    }

    const handleBulkUpload = async (rows: ClassEntityInput[]) => {
        try {
            await bulkUploadEntities("class", rows)
            toast.success("CSV Imported")
            fetchData()
        } catch (err) {
            toast.error("CSV upload failed")
        }
    }

    return (
        <div className="p-6 space-y-6">
            <PageTitleWithActions
                title="Classes"
                onAddClick={() => {
                    setEditing(null)
                    setFormOpen(true)
                }}
                onImportClick={() => setCsvDialogOpen(true)}
            />

            {classes.length === 0 ? (
                <EmptyState title="No Classes Found" message="Try adding a new class." />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {classes.map((cls) => (
                        <ClassCard
                            key={cls.id}
                            classItem={cls}
                            onEdit={() => {
                                setEditing(cls)
                                setFormOpen(true)
                            }}
                            onDelete={() => setDeleteTarget(cls)}
                        />
                    ))}
                </div>
            )}

            <EntityFormModal
                title={editing ? "Edit Class" : "Add Class"}
                open={formOpen}
                onOpenChange={setFormOpen}
            >
                <ClassForm defaultValues={editing || undefined} onSubmit={handleSave} />
            </EntityFormModal>

            <CsvUploadDialog
                open={csvDialogOpen}
                onOpenChange={setCsvDialogOpen}
                title="class"
                onUpload={handleBulkUpload}
            />

            <ConfirmationDialog
                open={!!deleteTarget}
                title="Delete Class"
                description={`Are you sure you want to delete "${deleteTarget?.name}"?`}
                onCancel={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
            />
        </div>
    )
}
