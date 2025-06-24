"use client"

import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const classSchema = z.object({
    name: z.string().min(1, "Class name is required"),
    code: z.string().optional(),
})

type ClassFormValues = z.infer<typeof classSchema>

type ClassFormProps = {
    defaultValues?: ClassFormValues
    onSubmit: (data: ClassFormValues) => void
}

export const ClassForm = ({ defaultValues, onSubmit }: ClassFormProps) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ClassFormValues>({
        resolver: zodResolver(classSchema),
        defaultValues: defaultValues || {
            name: "",
            code: "",
        },
    })

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
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
                <Label className="block text-sm font-medium mb-1">Class Code</Label>
                <Input
                    placeholder="Optional code"
                    {...register("code")}
                />
                {errors.code && (
                    <p className="text-sm text-red-500">{errors.code.message}</p>
                )}
            </div>

            <div className="pt-1 text-right">
                <Button type="submit">Save</Button>
            </div>
        </form>
    )
}
