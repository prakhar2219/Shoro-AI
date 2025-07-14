// app/admin/languages/page.tsx

"use client";

import { useEffect, useState, useCallback } from "react";
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

// Import language API functions
import { 
    getLanguages, 
    createLanguage, 
    updateLanguage, 
    deleteLanguage,
    searchLanguages,
    bulkCreateLanguages,
    getLanguageStats,
    ILanguage,
    ICreateLanguageRequest,
    IUpdateLanguageRequest
} from "@/lib/api/entities/language";

import { useToast } from "@/hooks/use-toast";
import { CsvSchema } from "@/components/shared/CsvUploadDialog";

// Language CSV schema configuration
const languageCsvSchema: CsvSchema = {
    title: "Upload Languages CSV",
    description: "Upload a CSV file containing language data. The file should have headers matching the column names.",
    fields: [
        {
            name: "code",
            type: "text",
            required: true,
            validation: (value) => {
                if (!value || value.toString().trim() === '') return "Language code is required";
                if (value.toString().length < 2) return "Language code must be at least 2 characters";
                return null;
            }
        },
        {
            name: "name",
            type: "text",
            required: true,
            validation: (value) => {
                if (!value || value.toString().trim() === '') return "Language name is required";
                return null;
            }
        },
        {
            name: "native_name",
            type: "text",
            required: true,
            validation: (value) => {
                if (!value || value.toString().trim() === '') return "Native name is required";
                return null;
            }
        },
        {
            name: "direction",
            type: "select",
            required: false,
            options: ["ltr", "rtl"],
            defaultValue: "ltr"
        },
        {
            name: "locale",
            type: "text",
            required: false
        },
        {
            name: "script",
            type: "text",
            required: false
        },
        {
            name: "ai_supported",
            type: "boolean",
            required: false,
            defaultValue: true
        }
    ],
    instructions: {
        required: ["code", "name", "native_name"],
        optional: ["direction", "locale", "script", "ai_supported"]
    }
};

export default function LanguagesPage() {
    const [languages, setLanguages] = useState<ILanguage[]>([]);
    const [openForm, setOpenForm] = useState(false);
    const [editing, setEditing] = useState<ILanguage | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<ILanguage | null>(null);
    const { isLoading, startLoading, stopLoading } = useLoading();
    const [searchTerm, setSearchTerm] = useState("");
    const [openCsvUpload, setOpenCsvUpload] = useState(false);
    const [stats, setStats] = useState<{ total: number; aiSupported: number; ltrCount: number; rtlCount: number } | null>(null);
    const { toast } = useToast();

    // Debounced search function
    const debouncedSearch = useCallback(
        (() => {
            let timeoutId: NodeJS.Timeout;
            return (query: string) => {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    handleSearch(query);
                }, 300);
            };
        })(),
        []
    );

    // Fetch languages from API
    const fetchLanguages = async () => {
        try {
            startLoading();
            const res = await getLanguages();
            setLanguages(res || []);
        } catch (error: any) {
            console.error('Error fetching languages:', error);
            toast({
                title: "Error",
                description: error.response?.data?.error || "Failed to fetch languages. Please try again.",
                variant: "destructive",
            });
        } finally {
            stopLoading();
        }
    };

    // Fetch language statistics
    const fetchStats = async () => {
        try {
            const statsData = await getLanguageStats();
            setStats(statsData);
        } catch (error) {
            console.error('Error fetching language stats:', error);
        }
    };

    // Search languages
    const handleSearch = async (query: string) => {
        if (!query.trim()) {
            fetchLanguages();
            return;
        }
        
        try {
            startLoading();
            const res = await searchLanguages(query);
            setLanguages(res || []);
        } catch (error: any) {
            console.error('Error searching languages:', error);
            toast({
                title: "Error",
                description: error.response?.data?.error || "Failed to search languages. Please try again.",
                variant: "destructive",
            });
        } finally {
            stopLoading();
        }
    };

    useEffect(() => {
        fetchLanguages();
        fetchStats();
    }, []);

    const handleCreateOrUpdate = async (data: ICreateLanguageRequest | IUpdateLanguageRequest) => {
        try {
            startLoading();
            if (editing?.code) {
                await updateLanguage(editing.code, data as IUpdateLanguageRequest);
                toast({
                    title: "Success",
                    description: "Language updated successfully.",
                });
            } else {
                await createLanguage(data as ICreateLanguageRequest);
                toast({
                    title: "Success",
                    description: "Language created successfully.",
                });
            }
            setOpenForm(false);
            setEditing(null);
            fetchLanguages();
            fetchStats(); // Refresh stats after changes
        } catch (error: any) {
            console.error('Error creating/updating language:', error);
            const errorMessage = error.response?.data?.error || "Failed to save language. Please try again.";
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            stopLoading();
        }
    };

    const handleDelete = async () => {
        if (deleteTarget?.code) {
            try {
                startLoading();
                await deleteLanguage(deleteTarget.code);
                toast({
                    title: "Success",
                    description: "Language deleted successfully.",
                });
                setDeleteTarget(null);
                fetchLanguages();
                fetchStats(); // Refresh stats after deletion
            } catch (error: any) {
                console.error('Error deleting language:', error);
                const errorMessage = error.response?.data?.error || "Failed to delete language. Please try again.";
                toast({
                    title: "Error",
                    description: errorMessage,
                    variant: "destructive",
                });
            } finally {
                stopLoading();
            }
        }
    };

    const handleBulkUpload = async (rows: any[]) => {
        try {
            startLoading();
            
            // Transform the validated rows to match the API expectations
            const languagesData: ICreateLanguageRequest[] = rows.map(row => ({
                code: row.code,
                name: row.name,
                native_name: row.native_name,
                direction: row.direction,
                locale: row.locale || '',
                script: row.script || '',
                ai_supported: row.ai_supported
            }));

            await bulkCreateLanguages(languagesData);
            toast({
                title: "Success",
                description: `${languagesData.length} languages uploaded successfully.`,
            });
            fetchLanguages();
            fetchStats(); // Refresh stats after bulk upload
        } catch (error: any) {
            console.error('Error bulk uploading languages:', error);
            const errorMessage = error.response?.data?.error || "Failed to upload languages. Please try again.";
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            stopLoading();
        }
    };

    const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
        debouncedSearch(value);
    };

    return (
        <div className="p-4 sm:p-6 md:p-8">
            <PageTitleWithActions
                title="Languages"
                onAddClick={() => setOpenForm(true)}
                onImportClick={() => setOpenCsvUpload(true)}
            />

            {/* Statistics */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-card p-4 rounded-lg border">
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <div className="text-sm text-muted-foreground">Total Languages</div>
                    </div>
                    <div className="bg-card p-4 rounded-lg border">
                        <div className="text-2xl font-bold">{stats.aiSupported}</div>
                        <div className="text-sm text-muted-foreground">AI Supported</div>
                    </div>
                    <div className="bg-card p-4 rounded-lg border">
                        <div className="text-2xl font-bold">{stats.ltrCount}</div>
                        <div className="text-sm text-muted-foreground">LTR Languages</div>
                    </div>
                    <div className="bg-card p-4 rounded-lg border">
                        <div className="text-2xl font-bold">{stats.rtlCount}</div>
                        <div className="text-sm text-muted-foreground">RTL Languages</div>
                    </div>
                </div>
            )}

            <hr className="my-4" />
            <SearchBar
                value={searchTerm}
                onChange={handleSearchInputChange}
                placeholder="Search languages by name, code, or native name..."
                className="w-full"
            />
            <hr className="my-4" />

            {isLoading ? (
                <LoadingOverlay />
            ) : languages.length === 0 ? (
                <EmptyState title="No languages found" />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                    {languages.map((language) => (
                        <LanguageCard
                            key={language._id || language.code}
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
                description={`Are you sure you want to delete "${deleteTarget?.name}" (${deleteTarget?.code})?`}
                onCancel={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
            />

            <CsvUploadDialog
                schema={languageCsvSchema}
                onUpload={handleBulkUpload}
                open={openCsvUpload}
                onOpenChange={setOpenCsvUpload}
            />
        </div>
    );
}
