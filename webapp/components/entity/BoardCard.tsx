// components/entity/BoardCard.tsx

type Board = any;
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Props {
    board: Board;
    onEdit: () => void;
    onDelete: () => void;
}

export const BoardCard = ({ board, onEdit, onDelete }: Props) => {
    return (
        <Card className="p-4 flex items-start justify-between dark:bg-muted/30 bg-white shadow-sm border rounded-2xl">
            <div>
                <h3 className="text-lg font-semibold text-foreground">{board.name}</h3>
                {board.countryName && (
                    <p className="text-sm text-muted-foreground">
                        Country: {board.countryName}
                    </p>
                )}
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
