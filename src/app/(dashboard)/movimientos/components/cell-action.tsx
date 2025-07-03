"use client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Copy } from "lucide-react";
import { MovementColumn } from "./columns";
import { toast } from "sonner";

interface CellActionProps {
    data: MovementColumn;
    onEdit: (id: string) => void;
}

export const CellAction: React.FC<CellActionProps> = ({ data, onEdit: handleEdit }) => {


    const onCopy = (id: string) => {
        navigator.clipboard.writeText(id);
        toast.success("ID del movimiento copiado al portapapeles.");
    };

    const onEdit = (id: string) => {
        handleEdit(id);
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menú</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => onCopy(data.id)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Copiar ID
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(data.id)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                    </DropdownMenuItem>
                    {/* Se podría agregar un botón de eliminar aquí en el futuro */}
                    {/* <DropdownMenuItem onClick={() => setOpen(true)}>
            <Trash className="mr-2 h-4 w-4" />
            Eliminar
          </DropdownMenuItem> */}
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
};