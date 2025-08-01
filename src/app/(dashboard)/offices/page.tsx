"use client";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

//import { Button } from '@/registry/new-york-v4/ui/button';
import getCookie from "@/lib/getToken";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/registry/new-york-v4/ui/alert-dialog";
import { Badge } from "@/registry/new-york-v4/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/registry/new-york-v4/ui/dialog";
import { Input } from "@/registry/new-york-v4/ui/input";
import { Label } from "@/registry/new-york-v4/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/new-york-v4/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/new-york-v4/ui/table";

interface Office {
  id: string;
  companyId: string;
  company_name: string;
  office_status: string;
  office_name: string;
}

interface Company {
  id: string;
  company_name: string;
}

interface OfficeForm {
  companyId: string;
  office_name: string;
  office_status: number;
}

const initialForm: OfficeForm = {
  companyId: "",
  office_name: "",
  office_status: 1,
};
const PAGE_SIZE = 10;

export default function OfficesPage() {
  const [offices, setOffices] = useState<Office[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyMap, setCompanyMap] = useState<Map<string, string>>(new Map());

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentOffice, setCurrentOffice] = useState<Office | null>(null);
  const [form, setForm] = useState<OfficeForm>(initialForm);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isConfirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_MS_INCIDENCIAS_URL;

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);

    return () => clearTimeout(timer);
  }, [search]);

  const fetchOffices = useCallback(async () => {
    setLoading(true);
    const token = getCookie("token");
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
        search: debouncedSearch,
      });
      const res = await fetch(`${apiUrl}offices?${params.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("No se pudieron obtener las oficinas.");
      const data = await res.json();
      setOffices(data.data || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchOffices();
  }, [fetchOffices]);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await fetch(`${apiUrl}companies?page=1&pageSize=1000`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("token")}`,
          },
        }); // Fetch all companies
        if (!res.ok) throw new Error("No se pudieron obtener las empresas.");
        const data = await res.json();
        const companyData = data.data || [];
        console.log("companyData", companyData);
        setCompanies(companyData);
        setCompanyMap(
          new Map(companyData.map((c: Company) => [c.id, c.company_name]))
        );
      } catch (e: any) {
        toast.error(e.message);
      }
    };
    fetchCompanies();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const openCreate = () => {
    setIsEdit(false);
    setCurrentOffice(null);
    setForm(initialForm);
    setIsModalOpen(true);
  };

  const openEdit = (office: Office) => {
    setIsEdit(true);
    setCurrentOffice(office);
    setForm({
      companyId: office.companyId,
      office_name: office.office_name,
      office_status: Number(office.office_status),
    });
    setIsModalOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (
    name: keyof OfficeForm,
    value: string | number
  ) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const method = isEdit ? "PUT" : "POST";
      const url = `${apiUrl}offices`;
      // Transformar los campos a snake_case como espera el backend
      const body = isEdit
        ? {
            id: currentOffice?.id,
            company_id: form.companyId,
            office_name: form.office_name,
            office_status: Number(form.office_status),
          }
        : {
            company_id: form.companyId,
            office_name: form.office_name,
            office_status: Number(form.office_status),
          };

      const res = await fetch(`${apiUrl}offices`, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("token")}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Error al guardar la oficina.");

      toast.success(`Oficina ${isEdit ? "actualizada" : "creada"} con éxito.`);
      setIsModalOpen(false);
      fetchOffices();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${apiUrl}offices`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("token")}`,
        },
        body: JSON.stringify({ id: deleteId }),
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Error al eliminar la oficina.");

      toast.success("Oficina eliminada con éxito.");
      setDeleteId(null);
      fetchOffices();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-4">
      <div className="flex items-center">
        <h2 className="text-3xl font-bold">Oficinas</h2>
        <div className="ml-auto flex items-center gap-2">
          <Input
            placeholder="Buscar oficina..."
            value={search}
            onChange={handleSearch}
            className="w-64"
          />
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" /> Nueva Oficina
          </Button>
        </div>
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-blue-950 text-white hover:bg-blue-800">
              <TableHead className="text-white">Nombre</TableHead>
              <TableHead className="text-white">Empresa</TableHead>
              <TableHead className="w-32 text-white">Status</TableHead>
              <TableHead className="w-32 text-white text-right">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : offices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24">
                  No se encontraron oficinas.
                </TableCell>
              </TableRow>
            ) : (
              offices.map((office) => (
                <TableRow key={office.id}>
                  <TableCell className="font-medium">
                    {office.company_name}
                  </TableCell>
                  <TableCell>{office.office_name || "N/A"}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        Number(office.office_status) === 1
                          ? "default"
                          : "destructive"
                      }
                    >
                      {Number(office.office_status) === 1
                        ? "Activo"
                        : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEdit(office)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setDeleteId(office.id);
                        setConfirmDeleteOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <div>Total: {total} oficinas</div>
        <div className="flex items-center gap-2">
          <span>
            Página {page} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Siguiente
          </Button>
        </div>
      </div>

      {/* Modal Crear/Editar */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {isEdit ? "Editar Oficina" : "Nueva Oficina"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="companyId" className="text-right">
                  Empresa
                </Label>
                <Select
                  required
                  onValueChange={(value) =>
                    handleSelectChange("companyId", value)
                  }
                  value={form.companyId}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecciona una empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.company_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="officeName" className="text-right">
                  Nombre
                </Label>
                <Input
                  id="officeName"
                  name="officeName"
                  value={form.office_name}
                  onChange={handleFormChange}
                  required
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="office_status" className="text-right">
                  Status
                </Label>
                <Select
                  onValueChange={(value) =>
                    handleSelectChange("office_status", value)
                  }
                  value={String(form.office_status)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Activo</SelectItem>
                    <SelectItem value="0">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={actionLoading}>
                {actionLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEdit ? "Guardar Cambios" : "Crear Oficina"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Confirmar Eliminar */}
      <AlertDialog
        open={isConfirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Estás seguro de que quieres eliminar esta oficina?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente
              la oficina de los servidores.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteId(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={actionLoading}
              className="bg-destructive hover:bg-destructive/90"
            >
              {actionLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Eliminar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
