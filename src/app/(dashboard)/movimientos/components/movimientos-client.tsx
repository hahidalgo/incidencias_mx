"use client";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { MovementColumn, columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";

interface MovimientosClientProps {
    data: MovementColumn[];
}

export const MovimientosClient: React.FC<MovimientosClientProps> = ({
    data,
}) => {
    const router = useRouter();

    return (
        <>
            <div className="flex items-center justify-between">
                <Heading
                    title={`Movimientos (${data.length})`}
                    description="Gestiona los movimientos de incidencias de los trabajadores"
                />
                <Button
                    onClick={() => console.log("Abriendo modal para agregar movimiento")}
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Agregar Nuevo
                </Button>
            </div>
            <Separator />
            <DataTable searchKey="employeeName" columns={columns} data={data} />
        </>
    );
};