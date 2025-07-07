'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';

import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

//import { Button } from '@/registry/new-york-v4/ui/button';
import { Input } from '@/registry/new-york-v4/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/registry/new-york-v4/ui/table';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/registry/new-york-v4/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/registry/new-york-v4/ui/alert-dialog';
import { Badge } from '@/registry/new-york-v4/ui/badge';
import { Label } from '@/registry/new-york-v4/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/registry/new-york-v4/ui/select';

interface Office {
  id: string;
  company_id: string;
  office_name: string;
  office_status: number;
}

interface Company {
  id: string;
  company_name: string;
}

interface OfficeForm {
  company_id: string;
  office_name: string;
  office_status: number;
}

const initialForm: OfficeForm = { company_id: '', office_name: '', office_status: 1 };
const PAGE_SIZE = 7;

export default function OfficesPage() {
  const [offices, setOffices] = useState<Office[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyMap, setCompanyMap] = useState<Map<string, string>>(new Map());

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentOffice, setCurrentOffice] = useState<Office | null>(null);
  const [form, setForm] = useState<OfficeForm>(initialForm);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isConfirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    
    return () => clearTimeout(timer);
  }, [search]);

  const fetchOffices = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
        search: debouncedSearch,
      });
      const res = await fetch(`/api/offices?${params.toString()}`);
      if (!res.ok) throw new Error('No se pudieron obtener las oficinas.');
      const data = await res.json();
      setOffices(data.offices || []);
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
        const res = await fetch('/api/companies?page=1&pageSize=1000'); // Fetch all companies
        if (!res.ok) throw new Error('No se pudieron obtener las empresas.');
        const data = await res.json();
        const companyData = data.companies || [];
        setCompanies(companyData);
        setCompanyMap(new Map(companyData.map((c: Company) => [c.id, c.company_name])));
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
      company_id: office.company_id,
      office_name: office.office_name,
      office_status: office.office_status,
    });
    setIsModalOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof OfficeForm, value: string | number) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const method = isEdit ? 'PUT' : 'POST';
      const url = '/api/offices';
      const body = isEdit ? { ...form, id: currentOffice?.id } : form;

      const res = await fetch('/api/offices', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al guardar la oficina.');

      toast.success(`Oficina ${isEdit ? 'actualizada' : 'creada'} con éxito.`);
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
      const res = await fetch('/api/offices', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deleteId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al eliminar la oficina.');

      toast.success('Oficina eliminada con éxito.');
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
          <Input placeholder="Buscar oficina..." value={search} onChange={handleSearch} className="w-64" />
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" /> Nueva Oficina
          </Button>
        </div>
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className='bg-blue-950 text-white hover:bg-blue-800'>
              <TableHead className="w-24 text-white">ID</TableHead>
              <TableHead className='text-white'>Nombre</TableHead>
              <TableHead className='text-white'>Empresa</TableHead>
              <TableHead className="w-32 text-white">Status</TableHead>
              <TableHead className="w-32 text-white text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center h-24">Cargando...</TableCell></TableRow>
            ) : offices.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center h-24">No se encontraron oficinas.</TableCell></TableRow>
            ) : (
              offices.map((office) => (
                <TableRow key={office.id}>
                  <TableCell className="font-mono text-xs">{office.id.slice(0, 8)}</TableCell>
                  <TableCell className="font-medium">{office.office_name}</TableCell>
                  <TableCell>{companyMap.get(office.company_id) || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant={office.office_status === 1 ? 'default' : 'destructive'}>
                      {office.office_status === 1 ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(office)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => { setDeleteId(office.id); setConfirmDeleteOpen(true); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
          <span>Página {page} de {totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Anterior</Button>
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Siguiente</Button>
        </div>
      </div>

      {/* Modal Crear/Editar */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{isEdit ? 'Editar Oficina' : 'Nueva Oficina'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="company_id" className="text-right">Empresa</Label>
                <Select required onValueChange={(value) => handleSelectChange('company_id', value)} value={form.company_id}>
                  <SelectTrigger className="col-span-3"><SelectValue placeholder="Selecciona una empresa" /></SelectTrigger>
                  <SelectContent>{companies.map(c => <SelectItem key={c.id} value={c.id}>{c.company_name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="office_name" className="text-right">Nombre</Label>
                <Input id="office_name" name="office_name" value={form.office_name} onChange={handleFormChange} required className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="office_status" className="text-right">Status</Label>
                <Select onValueChange={(value) => handleSelectChange('office_status', Number(value))} value={String(form.office_status)}>
                  <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Activo</SelectItem>
                    <SelectItem value="0">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={actionLoading}>
                {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? 'Guardar Cambios' : 'Crear Oficina'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Confirmar Eliminar */}
      <AlertDialog open={isConfirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro de que quieres eliminar esta oficina?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer. Esto eliminará permanentemente la oficina de los servidores.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteId(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={actionLoading} className="bg-destructive hover:bg-destructive/90">
              {actionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 