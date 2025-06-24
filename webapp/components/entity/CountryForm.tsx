// components/entity/CountryForm.tsx

"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "../ui/label";

type Country = any; // Replace with actual Country type if available

const countrySchema = z.object({
    name: z.string().min(1, "Name is required"),
    code: z.string().min(1, "Code is required"),
});

type CountryFormValues = z.infer<typeof countrySchema>;

type CountryFormProps = {
    defaultValues?: Country;
    onSubmit: (data: CountryFormValues) => void;
};

export const CountryForm = ({ defaultValues, onSubmit }: CountryFormProps) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<CountryFormValues>({
        resolver: zodResolver(countrySchema),
        defaultValues: defaultValues || {
            name: "",
            code: "",
        },
    });

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4 px-1 py-2"
        >
            <div>
                <Label className="block text-sm font-medium mb-1">Country Name</Label>
                <Input
                    placeholder="India"
                    {...register("name")}
                />
                {errors.name && (
                    <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
            </div>

            <div>
                <Label className="block text-sm font-medium mb-1">Country Code</Label>
                <Input
                    placeholder="IN"
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
    );
};
