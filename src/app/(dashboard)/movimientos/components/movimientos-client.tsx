"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { MovementColumn, columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

const PAGE_SIZE = 10;

export const MovimientosClient = () => {
    const [data, setData] = useState<MovementColumn[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500);
        
        return () => clearTimeout(timer);
    }, [search]);

    const fetchMovements = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: String(page),
                pageSize: String(PAGE_SIZE),
                search: debouncedSearch,
            });
            const res = await fetch(`/api/movements?${params.toString()}`);
            if (!res.ok) throw new Error("No se pudieron obtener los movimientos.");

            const { movements, total, totalPages } = await res.json();

            const formattedMovements: MovementColumn[] = movements.map((item: any) => ({
                id: item.id,
                employeeCode: item.employee.employee_code,
                employeeType: item.employee.employee_type,
                employeeName: item.employee.employee_name,
                incidentCode: item.incident.incident_code,
                incidentName: item.incident.incident_name,
                date: format(new Date(item.incidence_date), "d 'de' MMMM 'de' yyyy", {
                    locale: es,
                }),
            }));

            setData(formattedMovements);
            setTotal(total || 0);
            setTotalPages(totalPages || 1);
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setLoading(false);
        }
    }, [page, debouncedSearch]);

    useEffect(() => {
        fetchMovements();
    }, [fetchMovements]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setPage(1);
    };

    return (
        <>
            <div className="flex items-center justify-between gap-4">
                <Heading
                    title={`Movimientos (${total})`}
                    description="Gestiona los movimientos de incidencias de los trabajadores"
                />
                <Button
                    onClick={() => console.log("Abriendo modal para agregar movimiento")}
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Agregar
                </Button>
            </div>
            <Separator />
            <div className="flex items-center py-4">
                <Input
                    placeholder="Filtrar por trabajador o incidencia..."
                    value={search}
                    onChange={handleSearch}
                    className="max-w-sm"
                />
            </div>
            <DataTable columns={columns} data={data} loading={loading} />
            <div className="flex justify-between items-center text-sm text-muted-foreground">
                <div>Total: {total} movimientos</div>
                <div className="flex items-center gap-2">
                    <span>Página {page} de {totalPages}</span>
                    <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || loading}>
                        Anterior
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || loading}>
                        Siguiente
                    </Button>
                </div>
            </div>
        </>
    );
};