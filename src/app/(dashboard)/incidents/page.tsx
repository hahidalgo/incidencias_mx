'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Incident {
  id: string;
  incidentCode: string;
  incidentName: string;
  incidentStatus: string;
}

interface IncidentForm {
  incidentCode: string;
  incidentName: string;
  incidentStatus: string;
}

const initialForm: IncidentForm = { incidentCode: '', incidentName: '', incidentStatus: 'ACTIVE' };
const PAGE_SIZE = 7;

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentIncident, setCurrentIncident] = useState<Incident | null>(null);
  const [form, setForm] = useState<IncidentForm>(initialForm);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isConfirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    
    return () => clearTimeout(timer);
  }, [search]);

  const fetchIncidents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
        search: debouncedSearch,
      });
      const res = await fetch(`/api/incidents?${params.toString()}`);
      if (!res.ok) throw new Error('No se pudieron obtener las incidencias.');
      const data = await res.json();
      setIncidents(data.incidents || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const openCreate = () => {
    setIsEdit(false);
    setCurrentIncident(null);
    setForm(initialForm);
    setIsModalOpen(true);
  };

  const openEdit = (incident: Incident) => {
    setIsEdit(true);
    setCurrentIncident(incident);
    setForm({
      incidentCode: incident.incidentCode,
      incidentName: incident.incidentName,
      incidentStatus: incident.incidentStatus,
    });
    setIsModalOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof IncidentForm, value: string | number) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const method = isEdit ? 'PUT' : 'POST';
      // Transformar los campos a snake_case como espera el backend
      const body = isEdit
        ? {
            id: currentIncident?.id,
            incident_code: form.incidentCode,
            incident_name: form.incidentName,
            incident_status: form.incidentStatus,
          }
        : {
            incident_code: form.incidentCode,
            incident_name: form.incidentName,
            incident_status: form.incidentStatus,
          };

      const res = await fetch('/api/incidents', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al guardar la incidencia.');

      toast.success(`Incidencia ${isEdit ? 'actualizada' : 'creada'} con éxito.`);
      setIsModalOpen(false);
      fetchIncidents();
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
      const res = await fetch('/api/incidents', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deleteId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al eliminar la incidencia.');

      toast.success('Incidencia eliminada con éxito.');
      setDeleteId(null);
      setConfirmDeleteOpen(false);
      fetchIncidents();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-4">
      <div className="flex items-center">
        <h2 className="text-3xl font-bold">Incidencias</h2>
        <div className="ml-auto flex items-center gap-2">
          <Input placeholder="Buscar incidencia..." value={search} onChange={handleSearch} className="w-64" />
          <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> Nueva Incidencia</Button>
        </div>
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className='bg-blue-950 text-white hover:bg-blue-800'>
              <TableHead className="text-white w-32">Código</TableHead>
              <TableHead className='text-white'>Nombre</TableHead>
              <TableHead className="text-white w-32">Status</TableHead>
              <TableHead className="text-white w-32 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="text-center h-24">Cargando...</TableCell></TableRow>
            ) : incidents.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center h-24">No se encontraron incidencias.</TableCell></TableRow>
            ) : (
              incidents.map((incident) => (
                <TableRow key={incident.id}>
                  <TableCell className="font-mono text-sm">{incident.incidentCode}</TableCell>
                  <TableCell className="font-medium">{incident.incidentName}</TableCell>
                  <TableCell>
                    <Badge variant={incident.incidentStatus === 'ACTIVE' ? 'default' : 'destructive'}>
                      {incident.incidentStatus === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(incident)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => { setDeleteId(incident.id); setConfirmDeleteOpen(true); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <div>Total: {total} incidencias</div>
        <div className="flex items-center gap-2">
          <span>Página {page} de {totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Anterior</Button>
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Siguiente</Button>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader><DialogTitle>{isEdit ? 'Editar Incidencia' : 'Nueva Incidencia'}</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="incidentCode" className="text-right">Código</Label>
                <Input id="incidentCode" name="incidentCode" value={form.incidentCode} onChange={handleFormChange} required className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="incidentName" className="text-right">Nombre</Label>
                <Input id="incidentName" name="incidentName" value={form.incidentName} onChange={handleFormChange} required className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="incidentStatus" className="text-right">Status</Label>
                <Select onValueChange={(value) => handleSelectChange('incidentStatus', value)} value={form.incidentStatus}>
                  <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Activo</SelectItem>
                    <SelectItem value="INACTIVE">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={actionLoading}>
                {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? 'Guardar Cambios' : 'Crear Incidencia'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isConfirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro de que quieres eliminar esta incidencia?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer. Esto eliminará permanentemente la incidencia.</AlertDialogDescription>
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