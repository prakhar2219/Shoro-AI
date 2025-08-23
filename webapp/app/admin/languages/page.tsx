// app/admin/languages/page.tsx

"use client";

import React, { useEffect, useState, useCallback } from "react";
import { EntityFormModal } from "@/components/shared/EntityFormModal";
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";
import { LanguageForm } from "@/components/entity/LanguageForm";
import { LanguageCard } from "@/components/entity/LanguageCard";
import { CsvUploadDialog } from "@/components/shared/CsvUploadDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Plus, Upload, Download } from "lucide-react";
import { getLanguages, getLanguagesWithPagination, searchLanguages, getLanguageStats, createLanguage, updateLanguage, deleteLanguage, bulkCreateLanguages } from "@/lib/api/entities/language";
import { ICreateLanguageRequest, IUpdateLanguageRequest, ILanguage } from "@/lib/api/entities/language";
import { AdminPageLayout } from "@/components/shared/AdminPageLayout";
import { StatisticsSection } from "@/components/shared/StatisticsSection";
import { useAdminPage } from "@/hooks/use-admin-page";
import { useToast } from "@/hooks/use-toast";
import { ColumnDef } from "@tanstack/react-table";

export default function LanguagesPage() {
    const [languages, setLanguages] = useState<ILanguage[]>([]);
    const [openForm, setOpenForm] = useState(false);
    const [editing, setEditing] = useState<ILanguage | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<ILanguage | null>(null);
    const [openCsvUpload, setOpenCsvUpload] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [stats, setStats] = useState<{ total: number } | null>(null);
    const { toast } = useToast();

    // Wrap fetchData in useCallback to prevent infinite loop
    const fetchLanguagesData = useCallback(async (pageNum: number, size: number, search: string) => {
        if (search && search.trim()) {
            const res = await searchLanguages(search);
            return {
                data: res || [],
                totalPages: 1,
                total: res?.length || 0,
            };
        } else {
            const res = await getLanguagesWithPagination(pageNum, size, search);
            return {
                data: res.data || [],
                totalPages: res.totalPages || 1,
                total: res.total || 0,
            };
        }
    }, []);

    // Use the custom hook for common admin page functionality
    const {
        data: languagesData,
        searchTerm,
        page,
        setPage,
        pageSize,
        totalPages,
        isLoading: isDataLoading,
        handleSearchInputChange,
        handlePageSizeChange,
        fetchPaginatedData,
    } = useAdminPage<ILanguage>({
        fetchData: fetchLanguagesData,
        pageSize: 15
    });

    // Fetch language statistics
    const fetchStats = async () => {
        try {
            const statsData = await getLanguageStats();
            setStats({ total: statsData.total });
        } catch (error) {
            console.error('Error fetching language stats:', error);
        }
    };

    // Fetch stats on mount
    useEffect(() => {
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
            fetchPaginatedData(page, pageSize, searchTerm);
            fetchStats();
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
                fetchPaginatedData(page, pageSize, searchTerm);
                fetchStats();
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
            await bulkCreateLanguages(rows);
            toast({
                title: "Success",
                description: `${rows.length} languages uploaded successfully.`,
            });
            setOpenCsvUpload(false);
            fetchPaginatedData(page, pageSize, searchTerm);
            fetchStats();
        } catch (error: any) {
            console.error('Error uploading languages:', error);
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

    const startLoading = () => setIsLoading(true);
    const stopLoading = () => setIsLoading(false);

    const columns: ColumnDef<ILanguage>[] = [
        {
            accessorKey: "name",
            header: "Name",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <span className="font-medium">{row.getValue("name")}</span>
                    {row.original.ai_supported && (
                        <Badge variant="default" className="text-xs">AI Supported</Badge>
                    )}
                </div>
            ),
        },
        {
            accessorKey: "code",
            header: "Code",
            cell: ({ row }) => (
                <Badge variant="outline" className="font-mono">
                    {row.getValue("code")}
                </Badge>
            ),
        },
        {
            accessorKey: "native_name",
            header: "Native Name",
            cell: ({ row }) => (
                <span className="text-sm text-gray-600">
                    {row.getValue("native_name") || "-"}
                </span>
            ),
        },
        {
            accessorKey: "is_active",
            header: "Status",
            cell: ({ row }) => (
                <Badge variant="default" className="text-xs">
                    Active
                </Badge>
            ),
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <div className="flex gap-1">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                            setEditing(row.original);
                            setOpenForm(true);
                        }}
                    >
                        <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDeleteTarget(row.original)}
                    >
                        <Trash2 className="h-3 w-3" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <AdminPageLayout
            title="Languages"
            onAddClick={() => setOpenForm(true)}
            searchTerm={searchTerm}
            onSearchChange={handleSearchInputChange}
            searchPlaceholder="Search languages..."
            pageSize={pageSize}
            onPageSizeChange={handlePageSizeChange}
            page={page}
            setPage={setPage}
            totalPages={totalPages}
            isLoading={isLoading}
            data={languagesData}
            columns={columns}
            emptyStateTitle="No languages found"
            emptyStateMessage="Get started by creating your first language."
            emptyStateAction={
                <Button onClick={() => setOpenForm(true)}>
                    Create Language
                </Button>
            }
        >
            {/* Statistics Section */}
            <StatisticsSection
                title="Language Statistics"
                stats={stats}
            />

            {/* Action Buttons */}
            <div className="flex gap-2 mb-4">
                <Button
                    variant="outline"
                    onClick={() => setOpenCsvUpload(true)}
                    disabled={isLoading}
                >
                    <Upload className="h-4 w-4 mr-2" />
                    Bulk Upload
                </Button>
                <Button
                    variant="outline"
                    onClick={() => {
                        // Download CSV template
                        const csvContent = "name,code,native_name,is_active\nEnglish,en,English,true\nSpanish,es,Español,true";
                        const blob = new Blob([csvContent], { type: 'text/csv' });
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'languages_template.csv';
                        a.click();
                        window.URL.revokeObjectURL(url);
                    }}
                >
                    <Download className="h-4 w-4 mr-2" />
                    Download Template
                </Button>
            </div>

            {/* Language Form Modal */}
            <EntityFormModal
                open={openForm}
                onOpenChange={setOpenForm}
                title={editing ? "Edit Language" : "Create Language"}
            >
                <LanguageForm
                    onSubmit={handleCreateOrUpdate}
                    defaultValues={editing || undefined}
                />
            </EntityFormModal>

            {/* Delete Confirmation */}
            <ConfirmationDialog
                open={!!deleteTarget}
                onCancel={() => setDeleteTarget(null)}
                title="Delete Language"
                description="Are you sure you want to delete this language? This action cannot be undone."
                onConfirm={handleDelete}
            />

            {/* CSV Upload Dialog */}
            <CsvUploadDialog
                open={openCsvUpload}
                onOpenChange={setOpenCsvUpload}
                onUpload={handleBulkUpload}
                title="Upload Languages"
                schema={{
                    title: "Upload Languages",
                    description: "Upload a CSV file with language data. The file should have columns: name, code, native_name, is_active",
                    fields: [
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
                            name: "native_name",
                            type: "text",
                            required: true,
                            validation: (value) => {
                                if (!value || value.toString().trim() === '') return "Native name is required";
                                return null;
                            }
                        },
                        {
                            name: "is_active",
                            type: "boolean",
                            required: false,
                            defaultValue: true
                        }
                    ],
                    instructions: {
                        required: ["name", "code", "native_name"],
                        optional: ["is_active"]
                    }
                }}
            />
        </AdminPageLayout>
    );
}
