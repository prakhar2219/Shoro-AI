// app/admin/languages/page.tsx

"use client";

import { useEffect, useState } from "react";
import { PageTitleWithActions } from "@/components/shared/PageTitleWithActions";
import { LanguageCard } from "@/components/entity/LanguageCard";
import { EntityFormModal } from "@/components/shared/EntityFormModal";
import { CsvUploadDialog } from "@/components/shared/CsvUploadDialog";
import { LanguageForm } from "@/components/entity/LanguageForm";

import { useLoading } from "@/hooks/use-loading";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { SearchBar } from "@/components/shared/SearchBar";

type Language = {
    id: string | number;
    name: string;
    code: string;
    native_name: string;
    direction: "ltr" | "rtl";
    locale?: string;
    script?: string;
    ai_supported: boolean;
};

// Dummy data
const initialLanguages: Language[] = [
    {
        id: 1,
        name: "English",
        code: "en",
        native_name: "English",
        direction: "ltr",
        locale: "en-US",
        script: "Latin",
        ai_supported: true,
    },
    {
        id: 2,
        name: "Arabic",
        code: "ar",
        native_name: "العربية",
        direction: "rtl",
        locale: "ar-SA",
        script: "Arabic",
        ai_supported: true,
    },
];

export default function LanguagesPage() {
    const [languages, setLanguages] = useState<Language[]>(initialLanguages);
    const [openForm, setOpenForm] = useState(false);
    const [editing, setEditing] = useState<Language | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Language | null>(null);
    const { isLoading, startLoading, stopLoading } = useLoading();
    const [searchTerm, setSearchTerm] = useState("");
    const [openCsvUpload, setOpenCsvUpload] = useState(false);

    const filteredLanguages = languages.filter((language) =>
        language.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Placeholder for API fetch
    const fetchLanguages = async () => {
        startLoading();
        // Replace with: const res = await getLanguages();
        // setLanguages(res || []);
        stopLoading();
    };

    useEffect(() => {
        // fetchLanguages();
    }, []);

    const handleCreateOrUpdate = async (data: any) => {
        if (editing?.id) {
            // await updateLanguage(editing.id, data);
        } else {
            // await createLanguage(data);
        }
        setOpenForm(false);
        setEditing(null);
        fetchLanguages();
    };

    const handleDelete = async () => {
        if (deleteTarget?.id) {
            // await deleteLanguage(deleteTarget.id);
            setDeleteTarget(null);
            fetchLanguages();
        }
    };

    const handleBulkUpload = async (rows: Language[]) => {
        // await bulkUploadEntities("language", rows);
        fetchLanguages();
    };

    return (
        <div className="p-4 sm:p-6 md:p-8">
            <PageTitleWithActions
                title="Languages"
                onAddClick={() => setOpenForm(true)}
                onImportClick={() => setOpenCsvUpload(true)}
            />

            <hr className="my-4" />
            <SearchBar
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search languages..."
                className="w-full"
            />
            <hr className="my-4" />

            {isLoading ? (
                <LoadingOverlay />
            ) : filteredLanguages.length === 0 ? (
                <EmptyState title="No languages found" />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                    {filteredLanguages.map((language) => (
                        <LanguageCard
                            key={language.id}
                            language={language}
                            onEdit={() => {
                                setEditing(language);
                                setOpenForm(true);
                            }}
                            onDelete={() => setDeleteTarget(language)}
                        />
                    ))}
                </div>
            )}

            {/* Modals and dialogs */}
            <EntityFormModal
                title={editing ? "Edit Language" : "Add Language"}
                open={openForm}
                onClose={() => {
                    setOpenForm(false);
                    setEditing(null);
                }}
                onOpenChange={setOpenForm}
            >
                <LanguageForm
                    defaultValues={editing || undefined}
                    onSubmit={handleCreateOrUpdate}
                />
            </EntityFormModal>

            <ConfirmationDialog
                open={!!deleteTarget}
                title="Delete Language"
                description={`Are you sure you want to delete "${deleteTarget?.name}"?`}
                onCancel={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
            />

            <CsvUploadDialog
                onUpload={handleBulkUpload}
                open={openCsvUpload}
                onOpenChange={setOpenCsvUpload}
            />
        </div>
    );
}
