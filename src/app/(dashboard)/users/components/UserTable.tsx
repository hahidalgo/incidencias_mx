import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2 } from 'lucide-react';

export type UserTableUser = {
  id: string;
  companyId: string;
  officeIds: string[]; // Cambiado de officeId: string
  userName: string;
  userEmail: string;
  userStatus: 'ACTIVE' | 'INACTIVE';
  userRol: 'SUPER_ADMIN' | 'SUPERVISOR_REGIONES' | 'ENCARGADO_CASINO' | 'ENCARGADO_RRHH';
};

interface UserTableProps {
  users: UserTableUser[];
  companyMap: Map<string, string>;
  officeMap: Map<string, string>;
  loading: boolean;
  onEdit: (userId: string) => void;
  onDelete: (userId: string) => void;
}

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Administrador',
  SUPERVISOR_REGIONES: 'Supervisor Regional',
  ENCARGADO_CASINO: 'Encargado de casino',
  ENCARGADO_RRHH: 'Encargado de RRHH',
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Activo',
  INACTIVE: 'Inactivo',
};

export const UserTable: React.FC<UserTableProps> = ({ users, companyMap, officeMap, loading, onEdit, onDelete }) => (
  <div className="border rounded-lg">
    <Table>
      <TableHeader>
        <TableRow className='bg-blue-950 text-white hover:bg-blue-800'>
          <TableHead className='text-white'>Nombre</TableHead>
          <TableHead className='text-white'>Email</TableHead>
          <TableHead className='text-white'>Empresa</TableHead>
          <TableHead className='text-white'>Oficina</TableHead>
          <TableHead className="text-white w-24">Rol</TableHead>
          <TableHead className="text-white w-24">Status</TableHead>
          <TableHead className="w-32 text-white text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <TableRow><TableCell colSpan={7} className="text-center h-24">Cargando...</TableCell></TableRow>
        ) : users.length === 0 ? (
          <TableRow><TableCell colSpan={7} className="text-center h-24">No se encontraron usuarios.</TableCell></TableRow>
        ) : (
          users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.userName}</TableCell>
              <TableCell>{user.userEmail}</TableCell>
              <TableCell>{companyMap.get(user.companyId) || 'N/A'}</TableCell>
              <TableCell>{
                user.officeIds && user.officeIds.length > 0
                  ? user.officeIds.map((oid) => officeMap.get(oid) || 'N/A').join(', ')
                  : 'N/A'
              }</TableCell>
              <TableCell><Badge variant={/*user.userRol === 'ADMIN' ? 'secondary' :*/ 'outline'}>{ROLE_LABELS[user.userRol] || user.userRol}</Badge></TableCell>
              <TableCell><Badge variant={user.userStatus === 'ACTIVE' ? 'default' : 'destructive'}>{STATUS_LABELS[user.userStatus] || user.userStatus}</Badge></TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" onClick={() => onEdit(user.id)}><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => onDelete(user.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  </div>
); 