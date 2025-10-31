"use client"

import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RichTextEditor } from "@/components/rich-text-editor"
import { LanguageSelector } from "@/components/shared/LanguageSelector"
import { useState, useEffect } from "react"
import { getLanguages } from "@/lib/api/entities/language"

const classSchema = z.object({
    name: z.string().min(1, "Class name is required"),
    grade: z.coerce.number().min(1, "Grade is required"),
    board_id: z.string().min(1, "Board is required"),
    language_id: z.string().min(1, "Language is required"),
})

type ClassFormValues = z.infer<typeof classSchema>

type ClassFormProps = {
    defaultValues?: Partial<ClassFormValues> & { content?: string; board?: any; supported_language_ids?: string[] }
    onSubmit: (data: ClassFormValues & { content: string; supported_language_ids: string[] }) => void
    boards: { id: string; name: string }[]
    loading?: boolean
}

export const ClassForm = ({ defaultValues, onSubmit, boards, loading = false }: ClassFormProps) => {
    const [content, setContent] = useState(
        (typeof defaultValues?.content === 'string' ? defaultValues.content : '')
    )
    const [supportedLanguageIds, setSupportedLanguageIds] = useState<string[]>(
        defaultValues?.supported_language_ids || []
    )
    const [languages, setLanguages] = useState<any[]>([])
    
    // Fetch languages on mount
    useEffect(() => {
        getLanguages().then((langs: any) => {
            const languagesArray = Array.isArray(langs) 
                ? langs 
                : Array.isArray(langs?.data) 
                ? langs.data 
                : [];
            setLanguages(languagesArray);
        }).catch(() => setLanguages([]));
    }, []);
    
    // Check if we're adding from a parent board
    const isAddingFromParent = Boolean(defaultValues?.board);
    const parentBoard = defaultValues?.board;

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm<ClassFormValues>({
        resolver: zodResolver(classSchema),
        defaultValues: {
            name: defaultValues?.name || "",
            grade: defaultValues?.grade || 1,
            board_id: defaultValues?.board_id || boards[0]?.id || "",
            language_id: defaultValues?.language_id || "",
        },
    })

    const watchedBoardId = watch("board_id")

    // Reset form when defaultValues change (for editing different classes)
    useEffect(() => {
        console.log('ClassForm useEffect - defaultValues changed:', defaultValues);
        console.log('ClassForm useEffect - boards:', boards);
        console.log('ClassForm useEffect - languages loaded:', languages.length);
        if (defaultValues) {
            console.log('Resetting form with defaultValues:', defaultValues);
            const formData = {
                name: defaultValues.name || "",
                grade: defaultValues.grade || 1,
                board_id: defaultValues.board_id || boards[0]?.id || "",
                language_id: defaultValues.language_id || "",
            };
            console.log('Form data to reset with (including language_id):', formData);
            console.log('language_id value being set:', formData.language_id);
            reset(formData)
            setContent(typeof defaultValues.content === 'string' ? defaultValues.content : '')
            setSupportedLanguageIds(defaultValues.supported_language_ids || [])
            console.log('Form reset complete. Current language_id from watch:', watch('language_id'));
        } else {
            console.log('Resetting form with empty values');
            const emptyFormData = {
                name: "",
                grade: 1,
                board_id: boards[0]?.id || "",
                language_id: "",
            };
            console.log('Empty form data:', emptyFormData);
            reset(emptyFormData)
            setContent('')
            setSupportedLanguageIds([])
        }
    }, [defaultValues, boards, reset])

    // Cleanup effect to reset form when component unmounts
    useEffect(() => {
        return () => {
            console.log('ClassForm unmounting, resetting form');
            reset({
                name: "",
                grade: 1,
                board_id: "",
                language_id: "",
            });
            setContent('');
        };
    }, [reset]);

    // Handle boards array changes
    useEffect(() => {
        console.log('Boards array changed:', boards);
        if (boards.length > 0 && !watchedBoardId) {
            console.log('Setting default board_id to first available board');
            setValue('board_id', boards[0].id);
        }
    }, [boards, watchedBoardId, setValue]);

    // Initialize form when boards become available
    useEffect(() => {
        if (boards.length > 0 && !defaultValues && !watchedBoardId) {
            console.log('Initializing form with first available board');
            setValue('board_id', boards[0].id);
        }
    }, [boards, defaultValues, watchedBoardId, setValue]);

    // Ensure language is preselected on edit if missing in the form state
    useEffect(() => {
        const currentLang = watch('language_id');
        if (!currentLang && defaultValues?.language_id) {
            setValue('language_id', defaultValues.language_id);
        }
    }, [defaultValues?.language_id, setValue, watch]);

    // Ensure board_id is always valid
    useEffect(() => {
        if (watchedBoardId && boards.length > 0 && !boards.some(b => b.id === watchedBoardId)) {
            console.log('Invalid board_id detected, resetting to first available board');
            setValue('board_id', boards[0].id);
        }
    }, [watchedBoardId, boards, setValue]);

    // Ensure we have a valid board_id
    const validBoardId = watchedBoardId && boards.some(b => b.id === watchedBoardId) ? watchedBoardId : boards[0]?.id || ""

    // Validate form before submission
    const isFormValid = () => {
        const formValues = watch();
        const hasValidBoard = formValues.board_id && boards.some(b => b.id === formValues.board_id);
        return formValues.name && formValues.grade && hasValidBoard && boards.length > 0;
    }

    // Get validation errors
    const getValidationErrors = () => {
        const errors = [];
        const formValues = watch();
        
        if (!formValues.name) errors.push('Class name is required');
        if (!formValues.grade) errors.push('Grade is required');
        if (!formValues.board_id) errors.push('Board selection is required');
        if (formValues.board_id && !boards.some(b => b.id === formValues.board_id)) errors.push('Selected board is invalid');
        if (boards.length === 0) errors.push('No boards available');
        
        return errors;
    }

    const handleFormSubmit = (data: ClassFormValues) => {
        // Ensure board_id is valid before submitting
        const submitData = {
            ...data,
            board_id: data.board_id || boards[0]?.id || "",
            content,
            supported_language_ids: supportedLanguageIds
        };
        
        // Final validation
        if (!submitData.board_id || !boards.some(b => b.id === submitData.board_id)) {
            console.error('Invalid board_id:', submitData.board_id);
            console.error('Available boards:', boards);
            return;
        }
        
        console.log('Submitting form data:', submitData);
        onSubmit(submitData)
    }
    
    const handleSupportedLanguagesChange = (value: string) => {
        setSupportedLanguageIds((prev) => {
            const exists = prev.includes(value);
            return exists
                ? prev.filter((id) => id !== value)
                : [...prev, value];
        });
    };

    const handleContentChange = (html: string) => {
        setContent(html)
    }

    return (
        <form
            onSubmit={handleSubmit(handleFormSubmit)}
            className="space-y-4 px-1 py-2"
        >
            <div>
                <Label className="block text-sm font-medium mb-1">Class Name</Label>
                <Input
                    placeholder="Eg. 10th Grade"
                    {...register("name")}
                />
                {errors.name && (
                    <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
            </div>

            <div>
                <Label className="block text-sm font-medium mb-1">Grade</Label>
                <Input
                    type="number"
                    min={1}
                    {...register("grade", { valueAsNumber: true })}
                    placeholder="Eg. 10"
                />
                {errors.grade && (
                    <p className="text-sm text-red-500">{errors.grade.message}</p>
                )}
            </div>

            <div>
                <Label className="block text-sm font-medium mb-1">Board</Label>
                {isAddingFromParent && parentBoard ? (
                    <Input
                        value={parentBoard.name}
                        disabled
                        className="bg-gray-100"
                    />
                ) : boards.length === 0 ? (
                    <div className="text-sm text-red-500">No boards available. Please add boards first.</div>
                ) : (
                    <Select
                        value={validBoardId}
                        onValueChange={value => setValue("board_id", value)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select Board" />
                        </SelectTrigger>
                        <SelectContent>
                            {boards.map((b) => (
                                <SelectItem key={b.id} value={b.id}>
                                    {b.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
                {errors.board_id && (
                    <p className="text-sm text-red-500">{errors.board_id.message}</p>
                )}
            </div>

            <div>
                <Label className="block text-sm font-medium mb-1">Language</Label>
                <LanguageSelector
                    value={watch("language_id")}
                    onValueChange={value => setValue("language_id", value)}
                    placeholder="Select Language"
                    required
                />
                {errors.language_id && (
                    <p className="text-sm text-red-500">{errors.language_id.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label>Supported Languages</Label>
                <div className="flex flex-wrap gap-2">
                    {languages.map((lang) => (
                        <Button
                            key={lang._id}
                            type="button"
                            variant={supportedLanguageIds.includes(lang._id) ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleSupportedLanguagesChange(lang._id)}
                        >
                            {lang.name}
                        </Button>
                    ))}
                </div>
            </div>

            <div>
                <Label className="block text-sm font-medium mb-1">Content</Label>
                <RichTextEditor value={content} onChange={handleContentChange} />
            </div>

            {/* Debug section - remove in production */}
            {process.env.NODE_ENV === 'development' && (
                <div className="p-4 bg-gray-100 rounded text-xs">
                    <h4 className="font-semibold mb-2">Debug Info:</h4>
                    <p>Watched Board ID: {watchedBoardId}</p>
                    <p>Valid Board ID: {validBoardId}</p>
                    <p>Available Boards: {boards.map(b => `${b.name}(${b.id})`).join(', ')}</p>
                    <p>Form Values: {JSON.stringify(watch(), null, 2)}</p>
                </div>
            )}

            <div className="pt-1 text-right">
                <Button 
                    type="submit" 
                    disabled={loading || !isFormValid()}
                >
                    {loading ? "Saving..." : "Save"}
                </Button>
                {!isFormValid() && (
                    <div className="text-sm text-red-500 mt-2 text-left">
                        {getValidationErrors().map((error, index) => (
                            <p key={index}>{error}</p>
                        ))}
                    </div>
                )}
            </div>
        </form>
    )
}
