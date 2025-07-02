'use client';
import React, { useEffect, useState } from 'react';

interface User {
    id: string;
    user_name: string;
    user_email: string;
    user_status: number;
    user_rol: number;
    company_id: string;
    office_id: string;
    created_at: string;
    updated_at: string;
}

interface Company { id: string; company_name: string; }
interface Office { id: string; office_name: string; }

const initialForm = { user_name: '', user_email: '', user_status: 1, user_rol: 1, company_id: '', office_id: '', user_password: '' };

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize] = useState(7);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [form, setForm] = useState<any>(initialForm);
    const [editId, setEditId] = useState<string | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [companies, setCompanies] = useState<Company[]>([]);

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({
                page: String(page),
                pageSize: String(pageSize),
                search,
            });
            const res = await fetch(`/api/users?${params.toString()}`);
            if (!res.ok) throw new Error('Error al obtener usuarios');
            const data = await res.json();
            setUsers(data.users);
            setTotalPages(data.totalPages);
            setTotal(data.total);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, search]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setPage(1);
    };

    const openCreate = () => {
        setForm(initialForm);
        setIsEdit(false);
        setEditId(null);
        setShowModal(true);
    };

    const openEdit = (user: User) => {
        setForm({
            user_name: user.user_name,
            user_email: user.user_email,
            user_status: user.user_status,
            user_rol: user.user_rol,
            company_id: user.company_id,
            office_id: user.office_id,
            user_password: '',
        });
        setIsEdit(true);
        setEditId(user.id);
        setShowModal(true);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm((prev: any) => ({ ...prev, [name]: name === 'user_status' || name === 'user_rol' ? Number(value) : value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const method = isEdit ? 'PUT' : 'POST';
            const body = isEdit ? { ...form, id: editId } : form;
            if (isEdit) delete body.user_password;
            const res = await fetch('/api/users', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (!res.ok) throw new Error('Error al guardar usuario');
            setShowModal(false);
            setForm(initialForm);
            fetchUsers();
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/users', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: deleteId }),
            });
            if (!res.ok) throw new Error('Error al eliminar usuario');
            setDeleteId(null);
            setConfirmDelete(false);
            fetchUsers();
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontWeight: 'bold', fontSize: '2rem', marginRight: '1rem' }}>Usuarios</h2>
                <button onClick={openCreate} style={{ background: '#11224C', color: 'white', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, border: 'none', cursor: 'pointer' }}>+</button>
                <div style={{ flex: 1 }} />
                <label style={{ fontSize: 20, color: '#666', marginRight: 8 }}>Buscar:</label>
                <input type="text" value={search} onChange={handleSearch} style={{ border: '1px solid #aaa', borderRadius: 4, padding: '4px 8px', fontSize: 16 }} />
            </div>
            {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>Cargando...</div>
            ) : error ? (
                <div style={{ color: 'red', textAlign: 'center', padding: '2rem' }}>{error}</div>
            ) : (
                <>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'inherit' }}>
                        <thead>
                            <tr style={{ background: '#11224C', color: 'white' }}>
                                <th style={{ padding: '8px' }}>ID</th>
                                <th style={{ padding: '8px' }}>Nombre</th>
                                <th style={{ padding: '8px' }}>E-mail</th>
                                <th style={{ padding: '8px' }}>Empresa</th>
                                <th style={{ padding: '8px' }}>Oficina</th>
                                <th style={{ padding: '8px' }}>Rol</th>
                                <th style={{ padding: '8px' }}>Status</th>
                                <th style={{ padding: '8px' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length === 0 ? (
                                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem' }}>No hay usuarios</td></tr>
                            ) : users.map((user, idx) => (
                                <tr key={user.id} style={{ background: idx % 2 === 0 ? '#F5F6FA' : 'white' }}>
                                    <td style={{ fontWeight: 'bold', color: '#888', padding: '8px', textAlign: 'center' }}>{user.id.slice(0, 4)}</td>
                                    <td style={{ padding: '8px' }}>{user.user_name}</td>
                                    <td style={{ padding: '8px' }}>{user.user_email}</td>
                                    <td style={{ padding: '8px' }}>{user.company_id}</td>
                                    <td style={{ padding: '8px' }}>{user.office_id}</td>
                                    <td style={{ padding: '8px' }}>{user.user_rol}</td>
                                    <td style={{ padding: '8px' }}>
                                        <span style={{
                                            background: user.user_status === 1 ? '#218838' : '#C82333',
                                            color: 'white',
                                            borderRadius: 8,
                                            padding: '2px 16px',
                                            fontWeight: 'bold',
                                            fontSize: 16,
                                        }}>
                                            {user.user_status === 1 ? 'ACTIVO' : 'INACTIVO'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '8px', display: 'flex', gap: 8 }}>
                                        <button title="Editar" onClick={() => openEdit(user)} style={{ width: 24, height: 24, borderRadius: 4, background: '#218838', border: 'none', cursor: 'pointer' }} />
                                        <button title="Eliminar" onClick={() => { setDeleteId(user.id); setConfirmDelete(true); }} style={{ width: 24, height: 24, borderRadius: 4, background: '#C82333', border: 'none', cursor: 'pointer' }} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {/* Paginación */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: 16, gap: 8 }}>
                        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '4px 12px', borderRadius: 4, border: '1px solid #11224C', background: page === 1 ? '#eee' : '#11224C', color: page === 1 ? '#888' : 'white', cursor: page === 1 ? 'not-allowed' : 'pointer' }}>Anterior</button>
                        <span style={{ fontWeight: 'bold', fontSize: 16 }}>Página {page} de {totalPages}</span>
                        <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: '4px 12px', borderRadius: 4, border: '1px solid #11224C', background: page === totalPages ? '#eee' : '#11224C', color: page === totalPages ? '#888' : 'white', cursor: page === totalPages ? 'not-allowed' : 'pointer' }}>Siguiente</button>
                    </div>
                    <div style={{ textAlign: 'right', color: '#666', fontSize: 14, marginTop: 4 }}>Total: {total} usuarios</div>
                </>
            )}
            {/* Modal Crear/Editar */}
            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <form onSubmit={handleSubmit} style={{ background: 'white', padding: 32, borderRadius: 8, minWidth: 320, boxShadow: '0 2px 16px rgba(0,0,0,0.15)' }}>
                        <h3 style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 16 }}>{isEdit ? 'Editar usuario' : 'Nuevo usuario'}</h3>
                        <div style={{ marginBottom: 16 }}>
                            <label>Nombre:</label>
                            <input name="user_name" value={form.user_name} onChange={handleFormChange} required style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #aaa', marginTop: 4 }} />
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <label>Email:</label>
                            <input name="user_email" type="email" value={form.user_email} onChange={handleFormChange} required style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #aaa', marginTop: 4 }} />
                        </div>
                        {!isEdit && (
                            <div style={{ marginBottom: 16 }}>
                                <label>Contraseña:</label>
                                <input name="user_password" type="password" value={form.user_password} onChange={handleFormChange} required style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #aaa', marginTop: 4 }} />
                            </div>
                        )}
                        <div style={{ marginBottom: 16 }}>
                            <label>Empresa:</label>
                            <input name="company_id" value={form.company_id} onChange={handleFormChange} required style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #aaa', marginTop: 4 }} />
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <label>Oficina:</label>
                            <input name="office_id" value={form.office_id} onChange={handleFormChange} required style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #aaa', marginTop: 4 }} />
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <label>Rol:</label>
                            <input name="user_rol" type="number" value={form.user_rol} onChange={handleFormChange} required style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #aaa', marginTop: 4 }} />
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <label>Status:</label>
                            <select name="user_status" value={form.user_status} onChange={handleFormChange} style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #aaa', marginTop: 4 }}>
                                <option value={1}>ACTIVO</option>
                                <option value={0}>INACTIVO</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                            <button type="button" onClick={() => setShowModal(false)} style={{ padding: '6px 16px', borderRadius: 4, border: '1px solid #888', background: '#eee', color: '#333' }}>Cancelar</button>
                            <button type="submit" style={{ padding: '6px 16px', borderRadius: 4, border: 'none', background: '#11224C', color: 'white', fontWeight: 'bold' }}>{isEdit ? 'Guardar' : 'Crear'}</button>
                        </div>
                    </form>
                </div>
            )}
            {/* Modal Confirmar Eliminar */}
            {confirmDelete && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', padding: 32, borderRadius: 8, minWidth: 320, boxShadow: '0 2px 16px rgba(0,0,0,0.15)' }}>
                        <h3 style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 16 }}>¿Eliminar usuario?</h3>
                        <p>Esta acción no se puede deshacer.</p>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
                            <button type="button" onClick={() => { setDeleteId(null); setConfirmDelete(false); }} style={{ padding: '6px 16px', borderRadius: 4, border: '1px solid #888', background: '#eee', color: '#333' }}>Cancelar</button>
                            <button type="button" onClick={handleDelete} style={{ padding: '6px 16px', borderRadius: 4, border: 'none', background: '#C82333', color: 'white', fontWeight: 'bold' }}>Eliminar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 