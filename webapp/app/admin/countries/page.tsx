// app/admin/countries/page.tsx

"use client";

import { useEffect, useState } from "react";
import { PageTitleWithActions } from "@/components/shared/PageTitleWithActions";
import { CountryCard } from "@/components/entity/CountryCard";
import { EntityFormModal } from "@/components/shared/EntityFormModal";
import { CsvUploadDialog } from "@/components/shared/CsvUploadDialog";
import { CountryForm } from "@/components/entity/CountryForm";
import { getCountries, createCountry, updateCountry, deleteCountry } from "@/lib/api/entities/countries";
import { bulkUploadEntities } from "@/lib/api/bulk";

import { useLoading } from "@/hooks/use-loading";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { SearchBar } from "@/components/shared/SearchBar";

type Country = {
    id: string | number;
    name: string;
    code: string;
};

const initialCountries: Country[] = [
    { id: 1, name: "United States", code: "US" },
    { id: 2, name: "Canada", code: "CA" },
    { id: 3, name: "United Kingdom", code: "UK" },
    { id: 4, name: "Australia", code: "AU" },
    { id: 5, name: "India", code: "IN" },
    { id: 6, name: "Germany", code: "DE" },
    { id: 7, name: "France", code: "FR" },
    { id: 8, name: "Japan", code: "JP" },
    { id: 9, name: "China", code: "CN" },
    { id: 10, name: "Brazil", code: "BR" },
];

export default function CountriesPage() {
    const [countries, setCountries] = useState<Country[]>(initialCountries);
    const [openForm, setOpenForm] = useState(false);
    const [editing, setEditing] = useState<Country | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Country | null>(null);
    const { isLoading, startLoading, stopLoading } = useLoading();
    const [searchTerm, setSearchTerm] = useState("")
    const filteredCountries = countries.filter((country) =>
        country.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const [openCsvUpload, setOpenCsvUpload] = useState(false);


    const fetchCountries = async () => {
        startLoading();
        const res = await getCountries();
        setCountries(res || []);
        stopLoading();
    };

    useEffect(() => {
        // fetchCountries();
    }, []);

    const handleCreateOrUpdate = async (data: any) => {
        if (editing?.id) {
            await updateCountry(String(editing.id), data);
        } else {
            await createCountry(data);
        }
        setOpenForm(false);
        setEditing(null);
        fetchCountries();
    };

    const handleDelete = async () => {
        if (deleteTarget?.id) {
            await deleteCountry(deleteTarget.id);
            setDeleteTarget(null);
            fetchCountries();
        }
    };

    const handleBulkUpload = async (rows: Country[]) => {
        await bulkUploadEntities("country", rows);
        fetchCountries();
    };

    return (
        <div className="p-4 sm:p-6 md:p-8">
            <PageTitleWithActions
                title="Countries"
                onAddClick={() => setOpenForm(true)}
                onImportClick={() => setOpenCsvUpload(true)}
            />

            <hr className="my-4" />
            <SearchBar
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search countries..."
                className="w-full"
            />
            <hr className="my-4" />

            {isLoading ? (
                <LoadingOverlay />
            ) : filteredCountries.length === 0 ? (
                <EmptyState title="No countries found" />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                    {filteredCountries.map((country) => (
                        <CountryCard
                            key={country.id}
                            country={country}
                            onEdit={() => {
                                setEditing(country)
                                setOpenForm(true)
                            }}
                            onDelete={() => setDeleteTarget(country)}
                        />
                    ))}
                </div>
            )}

            {/* Modal and dialogs */}
            <EntityFormModal
                title={editing ? "Edit Country" : "Add Country"}
                open={openForm}
                onClose={() => {
                    setOpenForm(false)
                    setEditing(null)
                }}
                onOpenChange={setOpenForm}
            >
                <CountryForm
                    defaultValues={editing || undefined}
                    onSubmit={handleCreateOrUpdate}
                />
            </EntityFormModal>

            <ConfirmationDialog
                open={!!deleteTarget}
                title="Delete Country"
                description={`Are you sure you want to delete "${deleteTarget?.name}"?`}
                onCancel={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
            />
            <CsvUploadDialog 
            onUpload={()=>{}}
            open={openCsvUpload}
            onOpenChange={setOpenCsvUpload}
            />
        </div>
    )
}