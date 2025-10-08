// components/entity/LanguageCard.tsx

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Language = {
    code: string;
    name: string;
    native_name: string;
    direction: "ltr" | "rtl";
    locale?: string;
    script?: string;
    ai_supported: boolean;
};

interface Props {
    language: Language;
    onEdit: () => void;
    onDelete: () => void;
}

export const LanguageCard = ({ language, onEdit, onDelete }: Props) => {
    return (
        <Card className="p-4 flex items-start justify-between dark:bg-muted/30 bg-white shadow-sm border rounded-2xl">
            <div>
                <h3 className="text-lg font-semibold text-foreground">
                    {language.name} ({language.native_name})
                </h3>
                <p className="text-sm text-muted-foreground">Code: {language.code}</p>
                {language.locale && (
                    <p className="text-sm text-muted-foreground">Locale: {language.locale}</p>
                )}
                {language.script && (
                    <p className="text-sm text-muted-foreground">Script: {language.script}</p>
                )}
                <p className="text-sm text-muted-foreground">
                    Direction: {language.direction.toUpperCase()}
                </p>
                <p className="text-sm text-muted-foreground">
                    AI Supported: {language.ai_supported ? "Yes" : "No"}
                </p>
            </div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
                    <DropdownMenuItem onClick={onDelete} className="text-red-600">
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </Card>
    );
};
