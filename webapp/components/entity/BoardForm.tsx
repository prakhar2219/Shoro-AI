// components/entity/BoardForm.tsx

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type BoardInput = any

const boardSchema = z.object({
    name: z.string().min(1, "Board name is required"),})

type Props = {
    initialData?: BoardInput;
    countries: { id: string; name: string }[];
    onSubmit: (values: BoardInput) => void;
};

export const BoardForm = ({ initialData, countries, onSubmit }: Props) => {
    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<BoardInput>({
        resolver: zodResolver(boardSchema),
        defaultValues: initialData || { name: "", countryId: "" },
    });

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
        >
            <div>
                <Label htmlFor="name">Board Name</Label>
                <Input {...register("name")} placeholder="Enter board name" />
                {typeof errors.name?.message === "string" && (
                    <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
            </div>

            <div>
                <Label htmlFor="countryId">Country</Label>
                <Select
                    defaultValue={initialData?.countryId}
                    onValueChange={(value) => setValue("countryId", value)}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select Country" />
                    </SelectTrigger>
                    <SelectContent>
                        {countries.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                                {c.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {typeof errors.countryId?.message === "string" && (
                    <p className="text-sm text-red-500">{errors.countryId.message}</p>
                )}
            </div>

            <Button type="submit" className="w-full">
                {initialData ? "Update" : "Create"} Board
            </Button>
        </form>
    );
};
