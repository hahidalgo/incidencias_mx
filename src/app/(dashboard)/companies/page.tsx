"use client";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

//import { Button } from '@/registry/new-york-v4/ui/button';
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
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

interface Company {
  id: string;
  company_name: string;
  company_status: number;
}

interface CompanyForm {
  company_name: string;
  company_status: number;
}

const initialForm: CompanyForm = { company_name: "", company_status: 1 };
const PAGE_SIZE = 10;

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [form, setForm] = useState<CompanyForm>(initialForm);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isConfirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_MS_INCIDENCIAS_URL;

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);

    return () => clearTimeout(timer);
  }, [search]);

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    const token = getCookie("token");
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
        search: debouncedSearch,
      });
      const res = await fetch(`${apiUrl}companies?${params.toString()}`, {
        cache: "no-store",
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("No se pudieron obtener las compañías.");
      const data = await res.json();
      setCompanies(data.data || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const openCreate = () => {
    setIsEdit(false);
    setCurrentCompany(null);
    setForm(initialForm);
    setIsModalOpen(true);
  };

  const openEdit = (company: Company) => {
    setIsEdit(true);
    setCurrentCompany(company);
    setForm({
      company_name: company.company_name,
      company_status: company.company_status,
    });
    setIsModalOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (
    name: keyof CompanyForm,
    value: string | number
  ) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    const token = getCookie("token");
    try {
      const method = isEdit ? "PUT" : "POST";
      const body = isEdit ? { ...form, id: currentCompany?.id } : form;

      const res = await fetch(`${apiUrl}companies`, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Error al guardar la compañía.");

      toast.success(`Compañía ${isEdit ? "actualizada" : "creada"} con éxito.`);
      setIsModalOpen(false);
      fetchCompanies();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setActionLoading(true);
    const token = getCookie("token");
    try {
      const res = await fetch(`${apiUrl}companies`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: deleteId }),
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Error al eliminar la compañía.");

      toast.success("Compañía eliminada con éxito.");
      setDeleteId(null);
      setConfirmDeleteOpen(false);
      fetchCompanies();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-4">
      <div className="flex items-center">
        <Heading
          title="Compañías"
          description="Gestiona las empresas del Grupo Ollamani"
        />
        <div className="ml-auto flex items-center gap-2">
          <Input
            placeholder="Buscar compañía..."
            value={search}
            onChange={handleSearch}
            className="w-64"
          />
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" /> Nueva Compañía
          </Button>
        </div>
      </div>
      <Separator />
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-blue-950 text-white hover:bg-blue-800">
              <TableHead className="text-white">Nombre</TableHead>
              <TableHead className="w-32 text-white">Status</TableHead>
              <TableHead className="text-white w-32 text-right">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center h-24">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : companies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center h-24">
                  No se encontraron compañías.
                </TableCell>
              </TableRow>
            ) : (
              companies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell className="font-medium">
                    {company.company_name}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        Number(company.company_status) === 1
                          ? "default"
                          : "destructive"
                      }
                    >
                      {Number(company.company_status) === 1
                        ? "Activo"
                        : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEdit(company)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setDeleteId(company.id);
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
        <div>Total: {total} compañías</div>
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

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {isEdit ? "Editar Compañía" : "Nueva Compañía"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="company_name" className="text-right">
                  Nombre
                </Label>
                <Input
                  id="company_name"
                  name="company_name"
                  value={form.company_name}
                  onChange={handleFormChange}
                  required
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="company_status" className="text-right">
                  Status
                </Label>
                <Select
                  onValueChange={(value) =>
                    handleSelectChange("company_status", Number(value))
                  }
                  value={String(form.company_status)}
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
                {isEdit ? "Guardar Cambios" : "Crear Compañía"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isConfirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Estás seguro de que quieres eliminar esta compañía?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente
              la compañía y todas sus oficinas y empleados asociados.
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
