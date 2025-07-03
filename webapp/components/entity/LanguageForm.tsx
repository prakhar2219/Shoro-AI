// components/entity/LanguageForm.tsx

"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Language = {
    name: string;
    code: string;
    native_name: string;
    direction: "ltr" | "rtl";
    locale?: string;
    script?: string;
    ai_supported: boolean;
};

const languageSchema = z.object({
    name: z.string().min(1, "Name is required"),
    code: z.string().min(1, "Code is required"),
    native_name: z.string().min(1, "Native name is required"),
    direction: z.enum(["ltr", "rtl"]),
    locale: z.string().optional(),
    script: z.string().optional(),
    ai_supported: z.boolean().default(true),
});

type LanguageFormValues = z.infer<typeof languageSchema>;

type LanguageFormProps = {
    defaultValues?: Partial<LanguageFormValues>;
    onSubmit: (data: LanguageFormValues) => void;
};

export const LanguageForm = ({ defaultValues, onSubmit }: LanguageFormProps) => {
    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
        watch,
    } = useForm<LanguageFormValues>({
        resolver: zodResolver(languageSchema),
        defaultValues: {
            name: "",
            code: "",
            native_name: "",
            direction: "ltr",
            locale: "",
            script: "",
            ai_supported: true,
            ...defaultValues,
        },
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-1 py-2">
            <div>
                <Label className="block text-sm font-medium mb-1">Language Name</Label>
                <Input placeholder="English" {...register("name")} />
                {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>

            <div>
                <Label className="block text-sm font-medium mb-1">Language Code</Label>
                <Input placeholder="en" {...register("code")} />
                {errors.code && <p className="text-sm text-red-500">{errors.code.message}</p>}
            </div>

            <div>
                <Label className="block text-sm font-medium mb-1">Native Name</Label>
                <Input placeholder="English" {...register("native_name")} />
                {errors.native_name && <p className="text-sm text-red-500">{errors.native_name.message}</p>}
            </div>

            <div>
                <Label className="block text-sm font-medium mb-1">Direction</Label>
                <Select
                    onValueChange={(val) => setValue("direction", val as "ltr" | "rtl")}
                    defaultValue={watch("direction")}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select direction" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ltr">Left to Right (LTR)</SelectItem>
                        <SelectItem value="rtl">Right to Left (RTL)</SelectItem>
                    </SelectContent>
                </Select>
                {errors.direction && <p className="text-sm text-red-500">{errors.direction.message}</p>}
            </div>

            <div>
                <Label className="block text-sm font-medium mb-1">Locale (optional)</Label>
                <Input placeholder="en-US" {...register("locale")} />
            </div>

            <div>
                <Label className="block text-sm font-medium mb-1">Script (optional)</Label>
                <Input placeholder="Latin" {...register("script")} />
            </div>

            <div className="flex items-center gap-2">
                <Switch
                    checked={watch("ai_supported")}
                    onCheckedChange={(val) => setValue("ai_supported", val)}
                    id="ai_supported"
                />
                <Label htmlFor="ai_supported">AI Supported</Label>
            </div>

            <div className="pt-1 text-right">
                <Button type="submit">Save</Button>
            </div>
        </form>
    );
};
