"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";

export type MovementColumn = {
    id: string;
    employeeCode: number;
    employeeName: string;
    incidentCode: string;
    employeeType: string;
    incidentName: string;
    date: string;
};

export const getColumns = (
    onEdit: (id: string) => void
): ColumnDef<MovementColumn>[] => [
        {
            accessorKey: "employeeCode",
            header: "Código",
        },
        {
            accessorKey: "employeeName",
            header: "Trabajador",
        },
        {
            accessorKey: "employeeType",
            header: "Tipo",
        },
        {
            accessorKey: "incidentFull",
            header: "Incidencia",
            cell: ({ row }) => `${row.original.incidentCode} - ${row.original.incidentName}`,
        },
        {
            accessorKey: "date",
            header: "Fecha",
        },
        {
            id: "actions",
            cell: ({ row }) => <CellAction data={row.original} onEdit={onEdit} />,
        },
    ];