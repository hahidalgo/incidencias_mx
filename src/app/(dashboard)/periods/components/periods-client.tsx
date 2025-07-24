"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { PeriodModal } from "./period-modal";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

// Definir un tipo para la respuesta de la API
export interface Period {
    id: string;
    periodName: string;
    periodStart: string;
    periodEnd: string;
    periodStatus: string;
    createdAt: string;
    updatedAt: string;
}

const PAGE_SIZE = 10;

export const PeriodsClient = () => {
    const [periods, setPeriods] = useState<Period[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPeriod, setEditingPeriod] = useState<Period | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletingPeriod, setDeletingPeriod] = useState<Period | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500);
        
        return () => clearTimeout(timer);
    }, [search]);

    const fetchPeriods = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: String(page),
                pageSize: String(PAGE_SIZE),
                search: debouncedSearch,
            });
            const res = await fetch(`/api/periods?${params.toString()}`);
            if (!res.ok) throw new Error("No se pudieron obtener los periodos.");
            const { periods, total, totalPages } = await res.json();
            setPeriods(periods);
            setTotal(total || 0);
            setTotalPages(totalPages || 1);
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setLoading(false);
        }
    }, [page, debouncedSearch]);

    useEffect(() => {
        fetchPeriods();
    }, [fetchPeriods]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setPage(1);
    };

    const handleCreate = () => {
        setEditingPeriod(null);
        setIsModalOpen(true);
    };

    const handleEdit = (id: string) => {
        const periodToEdit = periods.find(p => p.id === id);
        if (periodToEdit) {
            setEditingPeriod(periodToEdit);
            setIsModalOpen(true);
        }
    };

    const handleDelete = (id: string) => {
        const periodToDelete = periods.find(p => p.id === id);
        if (periodToDelete) {
            setDeletingPeriod(periodToDelete);
            setIsDeleteDialogOpen(true);
        }
    };

    const confirmDelete = async () => {
        if (!deletingPeriod) return;
        try {
            const res = await fetch('/api/periods', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: deletingPeriod.id }),
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'No se pudo eliminar el periodo.');
            }
            toast.success('Periodo eliminado correctamente.');
            fetchPeriods();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsDeleteDialogOpen(false);
            setDeletingPeriod(null);
        }
    };

    const columns = useMemo(() => [
        {
            accessorKey: "periodName",
            header: "Nombre del Periodo",
        },
        {
            accessorKey: "periodStart",
            header: "Inicio",
            cell: ({ row }: any) => format(new Date(row.original.periodStart), "d 'de' MMMM 'de' yyyy", { locale: es }),
        },
        {
            accessorKey: "periodEnd",
            header: "Fin",
            cell: ({ row }: any) => format(new Date(row.original.periodEnd), "d 'de' MMMM 'de' yyyy", { locale: es }),
        },
        {
            accessorKey: "periodStatus",
            header: "Estado",
        },
        {
            id: "actions",
            header: "Acciones",
            cell: ({ row }: any) => (
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(row.original.id)}>
                        Editar
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(row.original.id)}>
                        Eliminar
                    </Button>
                </div>
            ),
        },
    ], [periods]);

    return (
        <>
            <PeriodModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialData={editingPeriod}
                onSuccess={() => {
                    fetchPeriods();
                    setIsModalOpen(false);
                }}
            />
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>¿Eliminar periodo?</DialogTitle>
                    </DialogHeader>
                    <p>¿Estás seguro de que deseas eliminar el periodo "{deletingPeriod?.periodName}"?</p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                            Cancelar
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete}>
                            Eliminar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <div className="flex items-center">
                <Heading
                    title="Periodos"
                    description="Gestiona los periodos de Pagos"
                />
                <div className="ml-auto flex items-center gap-2">
                    <Input
                        placeholder="Filtrar por nombre de periodo..."
                        value={search}
                        onChange={handleSearch}
                        className="max-w-sm"
                    />
                    <Button onClick={handleCreate}>
                        <Plus className="mr-2 h-4 w-4" />
                        Agregar
                    </Button>
                </div>
            </div>
            <Separator />
            <DataTable columns={columns} data={periods} loading={loading} />
            <div className="flex justify-between items-center pt-4 text-sm text-muted-foreground">
                <div className="flex-1">
                    Total de {total} periodo(s).
                </div>
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