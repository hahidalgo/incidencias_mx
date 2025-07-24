"use client";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import getCookie from "@/lib/getToken";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { MovementColumn, getColumns } from "./columns";
import { MovementModal } from "./movement-modal";

// Definir un tipo para la respuesta de la API mejora la seguridad de tipos y el autocompletado.
export interface Movement {
  id: string;
  employee: {
    id: string;
    employee_code: number;
    employee_type: string;
    employee_name: string;
  };
  incident: {
    id: string;
    incident_code: string;
    incident_name: string;
  };
  incidence_date: string;
  incidenceObservation: string;
}

const PAGE_SIZE = 10;

export const MovimientosClient = () => {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [formattedData, setFormattedData] = useState<MovementColumn[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMovement, setEditingMovement] = useState<Movement | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);

    return () => clearTimeout(timer);
  }, [search]);

  const fetchMovements = useCallback(async () => {
    setLoading(true);
    const token = getCookie("token");
    console.log("Token:", token);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
        search: debouncedSearch,
      });
      const res = await fetch(
        `http://localhost:3022/api/v1/movements?${params.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error("No se pudieron obtener los movimientos.");
      //console.log("Response:", await res.json());
      //const { movements, total, totalPages } = await res.json();
      const respuesta = await res.json();
      const movements: Movement[] = respuesta.data;
      const total = respuesta.total;
      const totalPages = respuesta.totalPages;
      setMovements(movements);
      const formattedMovements: MovementColumn[] = movements.map(
        (item: any) => ({
          id: item.id,
          employeeCode: item.employee.employeeCode ?? item.employee_code,
          employeeType:
            item.employee.employeeType ?? item.employee.employee_type,
          employeeName:
            item.employee.employeeName ?? item.employee.employee_name,
          incidentCode: item.incident.incidentCode ?? item.incident_code,
          incidentName:
            item.incident.incidentName ?? item.incident.incident_name,
          date: item.incidence_date
            ? (() => {
                try {
                  return format(new Date(item.incidence_date), "dd/MM/yyyy");
                } catch {
                  return "Sin fecha";
                }
              })()
            : "Sin fecha",
        })
      );

      setFormattedData(formattedMovements);
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

  const handleCreate = () => {
    setEditingMovement(null);
    setIsModalOpen(true);
  };

  const handleEdit = (id: string) => {
    const movementToEdit = movements.find((m) => m.id === id);
    if (movementToEdit) {
      setEditingMovement(movementToEdit);
      setIsModalOpen(true);
    }
  };

  const columns = useMemo(() => getColumns(handleEdit), [movements]);

  return (
    <>
      <MovementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingMovement}
        onSuccess={() => {
          fetchMovements();
          setIsModalOpen(false);
        }}
      />
      <div className="flex items-center">
        <Heading
          title={`Movimientos (${total})`}
          description="Gestiona los movimientos de incidencias de los trabajadores"
        />

        <div className="ml-auto flex items-center gap-2">
          <Input
            placeholder="Filtrar por trabajador o incidencia..."
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

      <DataTable columns={columns} data={formattedData} loading={loading} />
      <div className="flex justify-between items-center pt-4 text-sm text-muted-foreground">
        <div className="flex-1">Total de {total} movimiento(s).</div>
        <div className="flex items-center gap-2">
          <span>
            Página {page} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || loading}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </>
  );
};
