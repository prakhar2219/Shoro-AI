"use client"

import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RichTextEditor } from "@/components/rich-text-editor"
import { useState } from "react"

const classSchema = z.object({
    name: z.string().min(1, "Class name is required"),
    grade: z.coerce.number().min(1, "Grade is required"),
    board_id: z.string().min(1, "Board is required"),
})

type ClassFormValues = z.infer<typeof classSchema>

type ClassFormProps = {
    defaultValues?: Partial<ClassFormValues> & { content?: any }
    onSubmit: (data: ClassFormValues & { content: any }) => void
    boards: { id: string; name: string }[]
    loading?: boolean
}

export const ClassForm = ({ defaultValues, onSubmit, boards, loading = false }: ClassFormProps) => {
    const [content, setContent] = useState(
        Array.isArray(defaultValues?.content) ? defaultValues.content[0] : defaultValues?.content || { type: 'doc', content: [] }
    )

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<ClassFormValues>({
        resolver: zodResolver(classSchema),
        defaultValues: defaultValues || {
            name: "",
            grade: 1,
            board_id: boards[0]?.id || "",
        },
    })

    const handleFormSubmit = (data: ClassFormValues) => {
        onSubmit({ ...data, content })
    }

    const handleContentChange = (json: any) => {
        setContent(json)
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
                <Select
                    value={defaultValues?.board_id || boards[0]?.id || ""}
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
                {errors.board_id && (
                    <p className="text-sm text-red-500">{errors.board_id.message}</p>
                )}
            </div>

            <div>
                <Label className="block text-sm font-medium mb-1">Content</Label>
                <RichTextEditor value={content} onChange={handleContentChange} />
            </div>

            <div className="pt-1 text-right">
                <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
            </div>
        </form>
    )
}
