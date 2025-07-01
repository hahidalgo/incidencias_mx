'use client';
import React, { useEffect, useState } from 'react';

interface User {
    id: string;
    user_name: string;
    user_email: string;
    company_id: string;
    office_id: string;
    user_status: number;
    user_rol: number;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize] = useState(7); // Para que se vea como tu tabla
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

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

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontWeight: 'bold', fontSize: '2rem', marginRight: '1rem' }}>Usuarios</h2>
                <button style={{ background: '#11224C', color: 'white', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, border: 'none', cursor: 'pointer' }}>+</button>
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
                                <th style={{ padding: '8px' }}>Status</th>
                                <th style={{ padding: '8px' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length === 0 ? (
                                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>No hay usuarios</td></tr>
                            ) : users.map((user, idx) => (
                                <tr key={user.id} style={{ background: idx % 2 === 0 ? '#F5F6FA' : 'white' }}>
                                    <td style={{ fontWeight: 'bold', color: '#888', padding: '8px', textAlign: 'center' }}>{user.id.slice(0, 4)}</td>
                                    <td style={{ padding: '8px' }}>{user.user_name}</td>
                                    <td style={{ padding: '8px' }}>{user.user_email}</td>
                                    <td style={{ padding: '8px' }}>{user.company_id}</td>
                                    <td style={{ padding: '8px' }}>{user.office_id}</td>
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
                                        <button style={{ width: 24, height: 24, borderRadius: 4, background: '#3B4256', border: 'none' }} />
                                        <button style={{ width: 24, height: 24, borderRadius: 4, background: '#218838', border: 'none' }} />
                                        <button style={{ width: 24, height: 24, borderRadius: 4, background: '#C82333', border: 'none' }} />
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
        </div>
    );
} 