"use client";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

interface Employee {
  id: string;
  office_id: string;
  employee_code: number;
  employee_name: string;
  employee_type: "SIND" | "CONF";
  employee_status: number;
  office_name?: string | null; // Campo opcional para el nombre de la oficina
}

interface Office {
  id: string;
  office_name: string;
}

interface EmployeeForm {
  office_id: string;
  employee_code: string; // Usamos string para el input, convertimos al enviar
  employee_name: string;
  employee_type: "SIND" | "CONF";
  employee_status: number;
}

const initialForm: EmployeeForm = {
  office_id: "",
  employee_code: "",
  employee_name: "",
  employee_type: "SIND",
  employee_status: 1,
};
const PAGE_SIZE = 7;

export default function EmployeesPage() {
  const cookieRol = getCookie("rol");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [offices, setOffices] = useState<Office[]>([]);
  const [officeMap, setOfficeMap] = useState<Map<string, string>>(new Map());

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const [form, setForm] = useState<EmployeeForm>(initialForm);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isConfirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [selectedOffice, setSelectedOffice] = useState("all"); // Valor inicial 'all'

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);

    return () => clearTimeout(timer);
  }, [search]);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
        search: debouncedSearch,
      });
      const res = await fetch(
        `http://localhost:3022/api/v1/employees?${params.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("token")}`, // Asegúrate de manejar el token correctamente
          },
        }
      );
      if (!res.ok) throw new Error("No se pudieron obtener los empleados.");
      const data = await res.json();
      setEmployees(data.data || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, selectedOffice]); // Agregar selectedOffice como dependencia

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  useEffect(() => {
    const fetchOffices = async () => {
      try {
        const res = await fetch(
          "http://localhost:3022/api/v1/offices?page=1&pageSize=1000",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${getCookie("token")}`, // Asegúrate de manejar el token correctamente
            },
          }
        ); // Fetch all offices
        if (!res.ok) throw new Error("No se pudieron obtener las oficinas.");
        const data = await res.json();
        const officeData = data.data || [];
        setOffices(officeData);
        setOfficeMap(
          new Map(officeData.map((o: Office) => [o.id, o.office_name]))
        );
      } catch (e: any) {
        toast.error(e.message);
      }
    };
    fetchOffices();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const openCreate = () => {
    setIsEdit(false);
    setCurrentEmployee(null);
    setForm(initialForm);
    setIsModalOpen(true);
  };

  const openEdit = (employee: Employee) => {
    setIsEdit(true);
    setCurrentEmployee(employee);
    setForm({
      office_id: employee.office_id,
      employee_code: String(employee.employee_code),
      employee_name: employee.employee_name,
      employee_type: employee.employee_type,
      employee_status: Number(employee.employee_status),
    });
    setIsModalOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (
    name: keyof EmployeeForm,
    value: string | number
  ) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const method = isEdit ? "PUT" : "POST";
      // Usar camelCase para el body
      const body = isEdit
        ? {
            id: currentEmployee?.id,
            office_id: form.office_id,
            employee_code: Number(form.employee_code),
            employee_name: form.employee_name,
            employee_type: form.employee_type,
            employee_status: Number(form.employee_status),
          }
        : {
            office_id: form.office_id,
            employee_code: Number(form.employee_code),
            employee_name: form.employee_name,
            employee_type: form.employee_type,
            employee_status: Number(form.employee_status),
          };

      const res = await fetch("http://localhost:3022/api/v1/employees", {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("token")}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Error al guardar el empleado.");

      toast.success(`Empleado ${isEdit ? "actualizado" : "creado"} con éxito.`);
      setIsModalOpen(false);
      fetchEmployees();
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
      const res = await fetch("http://localhost:3022/api/v1/employees", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("token")}`,
        },
        body: JSON.stringify({ id: deleteId }),
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Error al eliminar el empleado.");

      toast.success("Empleado eliminado con éxito.");
      setDeleteId(null);
      setConfirmDeleteOpen(false);
      fetchEmployees();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-4">
      <div className="flex items-center">
        <h2 className="text-3xl font-bold">Empleados</h2>
        <div className="ml-auto flex items-center gap-2">
          <Input
            placeholder="Buscar empleado..."
            value={search}
            onChange={handleSearch}
            className="w-64"
          />
          {/* Select para filtrar por oficina */}
          {Number(cookieRol) === 1 && (
            <Select
              value={selectedOffice}
              onValueChange={(value) => {
                setSelectedOffice(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Filtrar por oficina" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las oficinas</SelectItem>
                {offices.map((o) => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.office_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {Number(cookieRol) === 1 && (
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" /> Nuevo Empleado
            </Button>
          )}
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-blue-950 text-white hover:bg-blue-800">
              <TableHead className="text-white w-24">Código</TableHead>
              <TableHead className="text-white">Nombre</TableHead>
              <TableHead className="text-white">Oficina</TableHead>
              <TableHead className="text-white w-32">Tipo</TableHead>
              <TableHead className="text-white w-32">Status</TableHead>
              <TableHead className="text-white w-32 text-right">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24">
                  No se encontraron empleados.
                </TableCell>
              </TableRow>
            ) : (
              employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-mono text-sm">
                    {employee.employee_code}
                  </TableCell>
                  <TableCell className="font-medium">
                    {employee.employee_name}
                  </TableCell>
                  <TableCell>
                    {employee.office_name ??
                      officeMap.get(employee.office_id) ??
                      "N/A"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        employee.employee_type === "SIND"
                          ? "outline"
                          : "secondary"
                      }
                    >
                      {employee.employee_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        Number(employee.employee_status) === 1
                          ? "default"
                          : "destructive"
                      }
                    >
                      {Number(employee.employee_status) === 1
                        ? "Activo"
                        : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEdit(employee)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setDeleteId(employee.id);
                        setConfirmDeleteOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEdit(employee)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    {Number(cookieRol) === 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setDeleteId(employee.id);
                          setConfirmDeleteOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <div>Total: {total} empleados</div>
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
                {isEdit ? "Editar Empleado" : "Nuevo Empleado"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="employee_code" className="text-right">
                  Código
                </Label>
                <Input
                  id="employee_code"
                  name="employee_code"
                  type="number"
                  value={form.employee_code}
                  onChange={handleFormChange}
                  required
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="employee_name" className="text-right">
                  Nombre
                </Label>
                <Input
                  id="employee_name"
                  name="employee_name"
                  value={form.employee_name}
                  onChange={handleFormChange}
                  required
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="office_id" className="text-right">
                  Oficina
                </Label>
                <Select
                  required
                  onValueChange={(value) =>
                    handleSelectChange("office_id", value)
                  }
                  value={form.office_id}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecciona una oficina" />
                  </SelectTrigger>
                  <SelectContent>
                    {offices.map((o) => (
                      <SelectItem key={o.id} value={o.id}>
                        {o.office_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="employee_type" className="text-right">
                  Tipo
                </Label>
                <Select
                  onValueChange={(value: "SIND" | "CONF") =>
                    handleSelectChange("employee_type", value)
                  }
                  value={form.employee_type}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SIND">Sindicalizado</SelectItem>
                    <SelectItem value="CONF">Confianza</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="employee_status" className="text-right">
                  Status
                </Label>
                <Select
                  onValueChange={(value) =>
                    handleSelectChange("employee_status", Number(value))
                  }
                  value={String(form.employee_status)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Activo</SelectItem>
                    <SelectItem value="2">Inactivo</SelectItem>
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
              {Number(cookieRol) === 1 && (
                <Button type="submit" disabled={actionLoading}>
                  {actionLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isEdit ? "Guardar Cambios" : "Crear Empleado"}
                </Button>
              )}
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
              ¿Estás seguro de que quieres eliminar este empleado?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente
              al empleado.
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
