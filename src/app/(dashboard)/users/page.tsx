'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserTable, UserTableUser } from './components/UserTable';
import { UserFormDialog, UserFormData } from './components/UserFormDialog';
import { DeleteUserDialog } from './components/DeleteUserDialog';

interface Company {
    id: string;
    companyName: string;
}

interface Office {
    id: string;
    officeName: string;
    companyId: string;
}

const PAGE_SIZE = 10;

export default function UsersPage() {
    const [users, setUsers] = useState<UserTableUser[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [offices, setOffices] = useState<Office[]>([]);
    const [companyMap, setCompanyMap] = useState<Map<string, string>>(new Map());
    const [officeMap, setOfficeMap] = useState<Map<string, string>>(new Map());
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserFormData | null>(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500);
        
        return () => clearTimeout(timer);
    }, [search]);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE), search: debouncedSearch });
            const res = await fetch(`/api/users?${params.toString()}`);
            if (!res.ok) throw new Error('No se pudieron obtener los usuarios.');
            const data = await res.json();
            setUsers((data.users || []).map((u: any) => ({
                id: u.id,
                companyId: u.companyId,
                officeIds: u.officeIds || (u.userOffices ? u.userOffices.map((uo: any) => uo.officeId) : []),
                userName: u.userName,
                userEmail: u.userEmail,
                userStatus: u.userStatus,
                userRol: (
                    ['SUPER_ADMIN', 'SUPERVISOR_REGIONES', 'ENCARGADO_CASINO', 'ENCARGADO_RRHH'].includes(u.userRol as string)
                        ? (u.userRol as 'SUPER_ADMIN' | 'SUPERVISOR_REGIONES' | 'ENCARGADO_CASINO' | 'ENCARGADO_RRHH')
                        : 'ENCARGADO_CASINO'
                ),
            })));
            setTotalPages(data.totalPages || 1);
            setTotal(data.total || 0);
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setLoading(false);
        }
    }, [page, debouncedSearch]);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    useEffect(() => {
        const fetchRelatedData = async () => {
            try {
                const [companiesRes, officesRes] = await Promise.all([
                    fetch('/api/companies?page=1&pageSize=1000'),
                    fetch('/api/offices?page=1&pageSize=1000'),
                ]);
                if (!companiesRes.ok) throw new Error('No se pudieron obtener las empresas.');
                const { companies: companyList = [] } = await companiesRes.json();
                setCompanies(companyList.map((c: any) => ({ id: c.id, companyName: c.companyName || c.company_name })));
                setCompanyMap(new Map(companyList.map((c: any) => [c.id, c.companyName || c.company_name])));
                if (!officesRes.ok) throw new Error('No se pudieron obtener las oficinas.');
                const { offices: officeList = [] } = await officesRes.json();
                setOffices(officeList.map((o: any) => ({ id: o.id, officeName: o.officeName || o.office_name, companyId: o.companyId || o.company_id })));
                setOfficeMap(new Map(officeList.map((o: any) => [o.id, o.officeName || o.office_name])));
            } catch (e: any) {
                toast.error(e.message);
            }
        };
        fetchRelatedData();
    }, []);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => { setSearch(e.target.value); setPage(1); };

    const handleCreate = () => { setEditingUser(null); setIsFormOpen(true); };

    const handleEdit = (userId: string) => {
        const user = users.find(u => u.id === userId);
        if (user) {
            setEditingUser({
                ...user,
                userRol: (
                    ['SUPER_ADMIN', 'SUPERVISOR_REGIONES', 'ENCARGADO_CASINO', 'ENCARGADO_RRHH'].includes(user.userRol as string)
                        ? (user.userRol as 'SUPER_ADMIN' | 'SUPERVISOR_REGIONES' | 'ENCARGADO_CASINO' | 'ENCARGADO_RRHH')
                        : 'ENCARGADO_CASINO'
                ),
            });
            setIsFormOpen(true);
        }
    };

    const handleDeleteRequest = (userId: string) => {
        setDeleteId(userId);
        setIsDeleteOpen(true);
    };

    const handleFormSubmit = async (form: UserFormData) => {
        setActionLoading(true);
        try {
            const method = form.id ? 'PUT' : 'POST';
            // Mapear los campos al formato esperado por el backend
            const body: any = {
                user_name: form.userName,
                user_email: form.userEmail,
                user_status: form.userStatus,
                user_rol: form.userRol,
                company_id: form.companyId,
            };
            if (form.userPassword) body.user_password = form.userPassword;
            if (form.userRol === 'SUPERVISOR_REGIONES') {
                body.office_ids = form.officeIds;
            } else {
                body.office_id = form.officeId;
            }
            if (form.id) body.id = form.id;
            
            const res = await fetch('/api/users', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Error al guardar el usuario.');
            toast.success(`Usuario ${form.id ? 'actualizado' : 'creado'} con éxito.`);
            setIsFormOpen(false);
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
            const res = await fetch('/api/users', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: deleteId }) });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Error al eliminar el usuario.');
            toast.success('Usuario eliminado con éxito.');
            setDeleteId(null);
            setIsDeleteOpen(false);
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
                    <Input placeholder="Buscar usuario..." value={search} onChange={handleSearch} className="w-64" />
                    <Button onClick={handleCreate}><Plus className="mr-2 h-4 w-4" /> Nuevo Usuario</Button>
                </div>
            </div>
            <UserTable
                users={users}
                companyMap={companyMap}
                officeMap={officeMap}
                loading={loading}
                onEdit={handleEdit}
                onDelete={handleDeleteRequest}
            />
            <div className="flex justify-between items-center text-sm text-muted-foreground">
                <div>Total: {total} usuarios</div>
                <div className="flex items-center gap-2">
                    <span>Página {page} de {totalPages}</span>
                    <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Anterior</Button>
                    <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Siguiente</Button>
                </div>
            </div>
            <UserFormDialog
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                onSubmit={handleFormSubmit}
                loading={actionLoading}
                companies={companies}
                offices={offices}
                initialData={editingUser}
            />
            <DeleteUserDialog
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                onConfirm={handleDelete}
                loading={actionLoading}
            />
        </div>
    );
}