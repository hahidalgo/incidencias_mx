import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

export type UserFormData = {
  id?: string;
  companyId: string;
  officeId?: string; // Para roles normales
  officeIds?: string[]; // Para SUPERVISOR_REGIONES
  userName: string;
  userEmail: string;
  userPassword?: string;
  userStatus: 'ACTIVE' | 'INACTIVE';
  userRol: 'SUPER_ADMIN' | 'SUPERVISOR_REGIONES' | 'ENCARGADO_CASINO' | 'ENCARGADO_RRHH';
};

interface Office {
  id: string;
  officeName: string;
  companyId: string;
}

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: UserFormData) => Promise<void>;
  loading: boolean;
  companies: { id: string; companyName: string }[];
  offices: Office[];
  initialData?: UserFormData | null;
}

const ROLE_OPTIONS = [
  { value: 'SUPER_ADMIN', label: 'Super Administrador' },
  { value: 'SUPERVISOR_REGIONES', label: 'Gerente de Zona' },
  { value: 'ENCARGADO_CASINO', label: 'RRHH Playcity' },
  { value: 'ENCARGADO_RRHH', label: 'Administrador de Personal' },
];

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Activo' },
  { value: 'INACTIVE', label: 'Inactivo' },
];

export const UserFormDialog: React.FC<UserFormDialogProps> = ({ open, onOpenChange, onSubmit, loading, companies, offices, initialData }) => {
  const [form, setForm] = useState<UserFormData>(
    initialData || {
      companyId: '',
      officeId: '',
      officeIds: [],
      userName: '',
      userEmail: '',
      userPassword: '',
      userStatus: 'ACTIVE',
      userRol: 'ENCARGADO_CASINO',
    }
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setForm(initialData);
    } else {
      setForm({
        companyId: '',
        officeId: '',
        officeIds: [],
        userName: '',
        userEmail: '',
        userPassword: '',
        userStatus: 'ACTIVE',
        userRol: 'ENCARGADO_CASINO',
      });
    }
  }, [initialData, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof UserFormData, value: any) => {
    if (name === 'userRol') {
      if (value === 'SUPERVISOR_REGIONES') {
        setForm((prev) => ({ ...prev, userRol: value, officeId: '', officeIds: [] }));
      } else {
        setForm((prev) => ({ ...prev, userRol: value, officeId: '', officeIds: undefined }));
      }
    } else if (name === 'officeIds') {
      setForm((prev) => ({ ...prev, officeIds: value }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (form.userRol === 'ENCARGADO_CASINO') {
      if (!form.companyId || !form.officeId) {
        setError('El RRHH Play City  debe estar asociado a una empresa y a una oficina.');

        return;
      }
    }
    if (form.userRol === 'SUPERVISOR_REGIONES') {
      if (!form.companyId) {
        setError('El Gerente de zona debe estar asociado a una empresa.');

        return;
      }
      if (!form.officeIds || form.officeIds.length === 0) {
        setError('El Gerente de zona debe estar asociado al menos a una oficina.');

        return;
      }
      if (form.officeIds.length > 6) {
        setError('El Gerente de zona no puede estar asociado a más de 5 oficinas.');
        
        return;
      }
    }
    await onSubmit(form);
  };

  // Filtrar oficinas según la empresa seleccionada
  const filteredOffices = form.companyId
    ? offices.filter(o => o.companyId === form.companyId)
    : offices;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{initialData ? 'Editar Usuario' : 'Nuevo Usuario'}</DialogTitle>
            {initialData && <DialogDescription>Deje la contraseña en blanco para no cambiarla.</DialogDescription>}
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="userName" className="text-right">Nombre</Label><Input id="userName" name="userName" value={form.userName} onChange={handleChange} required className="col-span-3" /></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="userEmail" className="text-right">Email</Label><Input id="userEmail" name="userEmail" type="email" value={form.userEmail} onChange={handleChange} required className="col-span-3" /></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="userPassword" className="text-right">Contraseña</Label><Input id="userPassword" name="userPassword" type="password" value={form.userPassword || ''} onChange={handleChange} required={!initialData} className="col-span-3" /></div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="userRol" className="text-right">Rol</Label>
              <Select onValueChange={value => handleSelectChange('userRol', value)} value={form.userRol}><SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger><SelectContent>{ROLE_OPTIONS.map(opt => (<SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>))}</SelectContent></Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="companyId" className="text-right">Empresa</Label>
              <Select required onValueChange={value => handleSelectChange('companyId', value)} value={form.companyId}><SelectTrigger className="col-span-3"><SelectValue placeholder="Selecciona una empresa" /></SelectTrigger><SelectContent>{companies.map(c => <SelectItem key={c.id} value={c.id}>{c.companyName}</SelectItem>)}</SelectContent></Select>
            </div>
            {/* Selector de oficina para SUPERVISOR_REGIONES */}
            {form.userRol === 'SUPERVISOR_REGIONES' && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="officeIds" className="text-right">Oficinas</Label>
                <select
                  multiple
                  className="col-span-3 border rounded px-2 py-1 min-h-[40px]"
                  value={form.officeIds || []}
                  onChange={e => {
                    const selected = Array.from(e.target.selectedOptions).map(opt => opt.value);
                    handleSelectChange('officeIds', selected);
                  }}
                >
                  {filteredOffices.map(o => (
                    <option key={o.id} value={o.id}>{o.officeName}</option>
                  ))}
                </select>
              </div>
            )}
            {/* Selector de oficina simple para otros roles */}
            {(form.userRol === 'ENCARGADO_CASINO' || form.userRol === 'SUPER_ADMIN' || form.userRol === 'ENCARGADO_RRHH') && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="officeId" className="text-right">Oficina</Label>
                <Select
                  required={form.userRol === 'ENCARGADO_CASINO'}
                  onValueChange={value => handleSelectChange('officeId', value)}
                  value={form.officeId || ''}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecciona una oficina" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredOffices.map(o => <SelectItem key={o.id} value={o.id}>{o.officeName}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            {error && <div className="col-span-4 text-red-600 text-sm text-center">{error}</div>}
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="userStatus" className="text-right">Status</Label>
              <Select onValueChange={value => handleSelectChange('userStatus', value)} value={form.userStatus}><SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger><SelectContent>{STATUS_OPTIONS.map(opt => (<SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>))}</SelectContent></Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading}>{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{initialData ? 'Guardar Cambios' : 'Crear Usuario'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 