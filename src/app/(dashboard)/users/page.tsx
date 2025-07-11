"use client";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import getCookie from "@/lib/getToken";

interface User {
  id: string;
  company_id: string;
  office_id: string;
  user_name: string;
  user_email: string;
  user_status: number;
  user_rol: number;
}

interface Company {
  id: string;
  company_name: string;
}

interface Office {
  id: string;
  office_name: string;
}

interface UserForm {
  company_id: string;
  office_id: string;
  user_name: string;
  user_email: string;
  user_password?: string;
  user_status: number;
  user_rol: number;
}

const initialForm: UserForm = {
  company_id: "",
  office_id: "",
  user_name: "",
  user_email: "",
  user_password: "",
  user_status: 1,
  user_rol: 2,
};
const PAGE_SIZE = 7;
const USER_ROLES = {
  111: "Admininistrador de Sistema",
  1: "Encargado de Oficina",
  2: "Supervisor de Oficinas",
  3: "Encargado de RRHH",
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [offices, setOffices] = useState<Office[]>([]);
  const [companyMap, setCompanyMap] = useState<Map<string, string>>(new Map());
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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [form, setForm] = useState<UserForm>(initialForm);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isConfirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);

    return () => clearTimeout(timer);
  }, [search]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
        search: debouncedSearch,
      });
      const res = await fetch(
        `http://localhost:3022/api/v1/users?${params.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("token")}`,
          },
        }
      );
      if (!res.ok) throw new Error("No se pudieron obtener los usuarios.");
      const data = await res.json();
      setUsers(data.data || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    const fetchRelatedData = async () => {
      try {
        const [companiesRes, officesRes] = await Promise.all([
          fetch("http://localhost:3022/api/v1/companies?page=1&pageSize=1000", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${getCookie("token")}`,
            },
          }),
          fetch("http://localhost:3022/api/v1/offices?page=1&pageSize=1000", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${getCookie("token")}`,
            },
          }),
        ]);

        if (!companiesRes.ok)
          throw new Error("No se pudieron obtener las empresas.");
        const { companies: companyList = [] } = await companiesRes.json();
        setCompanies(companyList);
        setCompanyMap(
          new Map(companyList.map((c: Company) => [c.id, c.company_name]))
        );

        if (!officesRes.ok)
          throw new Error("No se pudieron obtener las oficinas.");
        const { offices: officeList = [] } = await officesRes.json();
        setOffices(officeList);
        setOfficeMap(
          new Map(officeList.map((o: Office) => [o.id, o.office_name]))
        );
      } catch (e: any) {
        toast.error(e.message);
      }
    };
    fetchRelatedData();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const openCreate = () => {
    setIsEdit(false);
    setCurrentUser(null);
    setForm(initialForm);
    setIsModalOpen(true);
  };

  const openEdit = (user: User) => {
    setIsEdit(true);
    setCurrentUser(user);
    setForm({ ...user, user_password: "" });
    setIsModalOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof UserForm, value: string | number) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const method = isEdit ? "PUT" : "POST";
      const body: any = { ...form, id: isEdit ? currentUser?.id : undefined };
      if (!body.user_password) delete body.user_password;

      const res = await fetch("http://localhost:3022/api/v1/users", {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("token")}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Error al guardar el usuario.");

      toast.success(`Usuario ${isEdit ? "actualizado" : "creado"} con éxito.`);
      setIsModalOpen(false);
      fetchUsers();
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
      const res = await fetch("http://localhost:3022/api/v1/users", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("token")}`,
        },
        body: JSON.stringify({ id: deleteId }),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Error al eliminar el usuario.");

      toast.success("Usuario eliminado con éxito.");
      setDeleteId(null);
      setConfirmDeleteOpen(false);
      fetchUsers();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-4">
      <div className="flex items-center">
        <h2 className="text-3xl font-bold">Usuarios</h2>
        <div className="ml-auto flex items-center gap-2">
          <Input
            placeholder="Buscar usuario..."
            value={search}
            onChange={handleSearch}
            className="w-64"
          />
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" /> Nuevo Usuario
          </Button>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-blue-950 text-white hover:bg-blue-800">
              <TableHead className="text-white">Nombre</TableHead>
              <TableHead className="text-white">Email</TableHead>
              <TableHead className="text-white">Empresa</TableHead>
              <TableHead className="text-white">Oficina</TableHead>
              <TableHead className="text-white w-24">Rol</TableHead>
              <TableHead className="text-white w-24">Status</TableHead>
              <TableHead className="w-32 text-white text-right">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-24">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-24">
                  No se encontraron usuarios.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.user_name}
                  </TableCell>
                  <TableCell>{user.user_email}</TableCell>
                  <TableCell>
                    {companyMap.get(user.company_id) || "N/A"}
                  </TableCell>
                  <TableCell>
                    {officeMap.get(user.office_id) || "N/A"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={user.user_rol === 1 ? "secondary" : "outline"}
                    >
                      {USER_ROLES[user.user_rol as keyof typeof USER_ROLES] ||
                        "N/A"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.user_status === 1 ? "default" : "destructive"
                      }
                    >
                      {user.user_status === 1 ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEdit(user)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setDeleteId(user.id);
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
        <div>Total: {total} usuarios</div>
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
        <DialogContent className="sm:max-w-[480px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {isEdit ? "Editar Usuario" : "Nuevo Usuario"}
              </DialogTitle>
              {isEdit && (
                <DialogDescription>
                  Deje la contraseña en blanco para no cambiarla.
                </DialogDescription>
              )}
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="user_name" className="text-right">
                  Nombre
                </Label>
                <Input
                  id="user_name"
                  name="user_name"
                  value={form.user_name}
                  onChange={handleFormChange}
                  required
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="user_email" className="text-right">
                  Email
                </Label>
                <Input
                  id="user_email"
                  name="user_email"
                  type="email"
                  value={form.user_email}
                  onChange={handleFormChange}
                  required
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="user_password" className="text-right">
                  Contraseña
                </Label>
                <Input
                  id="user_password"
                  name="user_password"
                  type="password"
                  value={form.user_password || ""}
                  onChange={handleFormChange}
                  required={!isEdit}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="company_id" className="text-right">
                  Empresa
                </Label>
                <Select
                  required
                  onValueChange={(value) =>
                    handleSelectChange("company_id", value)
                  }
                  value={form.company_id}
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
                <Label htmlFor="user_rol" className="text-right">
                  Rol
                </Label>
                <Select
                  onValueChange={(value) =>
                    handleSelectChange("user_rol", Number(value))
                  }
                  value={String(form.user_rol)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(USER_ROLES).map(([key, value]) => (
                      <SelectItem key={key} value={key}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="user_status" className="text-right">
                  Status
                </Label>
                <Select
                  onValueChange={(value) =>
                    handleSelectChange("user_status", Number(value))
                  }
                  value={String(form.user_status)}
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
                {isEdit ? "Guardar Cambios" : "Crear Usuario"}
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
              ¿Estás seguro de que quieres eliminar este usuario?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente
              al usuario.
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
