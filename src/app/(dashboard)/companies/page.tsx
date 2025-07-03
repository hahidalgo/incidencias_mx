'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { SquarePen, Trash, Plus  } from 'lucide-react';
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow, } from "@/components/ui/table"

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
interface Company {
  id: string;
  company_name: string;
  company_status: number;
  created_at: string;
  updated_at: string;
}

const initialForm = { company_name: '', company_status: 1 };

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(7);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [form, setForm] = useState<{ company_name: string; company_status: number }>(initialForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        search,
      });
      const res = await fetch(`/api/companies?${params.toString()}`);
      if (!res.ok) throw new Error('Sin resultados');
      const data = await res.json();
      setCompanies(data.companies);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

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

  const openEdit = (company: Company) => {
    setForm({ company_name: company.company_name, company_status: company.company_status });
    setIsEdit(true);
    setEditId(company.id);
    setShowModal(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === 'company_status' ? Number(value) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const method = isEdit ? 'PUT' : 'POST';
      const body = isEdit ? { ...form, id: editId } : form;
      const res = await fetch('/api/companies', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Error al guardar compañía');
      setShowModal(false);
      setForm(initialForm);
      fetchCompanies();
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
      const res = await fetch('/api/companies', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deleteId }),
      });
      if (!res.ok) throw new Error('Error al eliminar compañía');
      setDeleteId(null);
      setConfirmDelete(false);
      fetchCompanies();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ fontWeight: 'bold', fontSize: '2rem', marginRight: '1rem' }}>Empresas</h2>
        <Button className='bg-blue-900 text-white' onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Plus className='text-white' />
        </Button>
        <div className='flex-1'  />
        <label style={{ fontSize: 20, color: '#666', marginRight: 8 }}>Buscar:</label>
        <input type="text" value={search} onChange={handleSearch} style={{ border: '1px solid #aaa', borderRadius: 4, padding: '4px 8px', fontSize: 16 }} />
      </div>
      {loading ? (
        <div className='text-center text-gray-700 p-2 font-bold'>Cargando...</div>
      ) : error ? (
        <div  className='text-center text-red-700 p-2 font-bold' >{error}</div>
      ) : (
        <>
        <Table className='table-auto border-collapse border border-gray-300'>
          <TableHeader>
            <TableRow className='text-white text-center' style={{ background: '#11224C'}}>
              <TableHead className="w-[25px] text-white text-center font-bold">{''}</TableHead>
              <TableHead className='text-white font-bold'>Nombre</TableHead>
              <TableHead className='text-white text-center font-bold'>Status</TableHead>
              <TableHead className=" w-[150px] text-whitetext-center font-bold">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companies.map((companies)=>(
              <TableRow key={companies.id}>
                <TableCell className="w-[25px] text-center">{''}</TableCell>
                <TableCell>{companies.company_name}</TableCell>
                <TableCell className="text-center"> 
                  <Badge className="text-center text-white" style={{ background: companies.company_status === 1 ? '#218838' : '#C82333',}}>
                    
                      {companies.company_status === 1 ? 'ACTIVO' : 'INACTIVO'}
                    </Badge>
                </TableCell>
                <TableCell className="flex flex-wrap items-center gap-2 md:flex-row justify-center">
                  <Button title="Editar" onClick={() => openEdit(companies)} className='bg-blue-700 text-white'>
                    <SquarePen size={16} className='text-white' />
                  </Button>
                  <Button title="Eliminar" onClick={() => { setDeleteId(companies.id); setConfirmDelete(true); }}  className='bg-red-700 text-white'>
                    <Trash size={16} color="white" />
                  </Button> 
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>



          {/* Paginación */}

          
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: 16, gap: 8 }}>
            <Button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} variant="ghost"
                    style={{ padding: '4px 12px', borderRadius: 4, border: '0px solid #11224C', background: page === 1 ? '#eee' : '#11224C', color: page === 1 ? '#888' : 'white', cursor: page === 1 ? 'not-allowed' : 'pointer' }}>
              Anterior
            </Button>
            <span style={{ fontSize: 14 }}>Página {page} de {totalPages}</span>
            <Button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} variant="ghost"
                    style={{ padding: '4px 12px', borderRadius: 4, border: '0px solid #11224C', background: page === totalPages ? '#eee' : '#11224C', color: page === totalPages ? '#888' : 'white', cursor: page === totalPages ? 'not-allowed' : 'pointer' }}>Siguiente</Button>
          </div>
          <div style={{ textAlign: 'right', color: '#666', fontSize: 14, marginTop: 4 }}>Total: {total} empresas</div>
        </> 
      )}

      {/* Modal Crear/Editar */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <form onSubmit={handleSubmit} style={{ background: 'white', padding: 32, borderRadius: 8, minWidth: 320, boxShadow: '0 2px 16px rgba(0,0,0,0.15)' }}>
            <h3 style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 16 }}>{isEdit ? 'Editar empresa' : 'Nueva empresa'}</h3>
            <div style={{ marginBottom: 16 }}>
              <label>Nombre:</label>
              <input name="company_name" value={form.company_name} onChange={handleFormChange} required style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #aaa', marginTop: 4 }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label>Status:</label>
              <select name="company_status" value={form.company_status} onChange={handleFormChange} style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #aaa', marginTop: 4 }}>
                <option value={1}>ACTIVO</option>
                <option value={0}>INACTIVO</option>
              </select>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <Button type="button" onClick={() => setShowModal(false)} className='bg-gray-300 text-black'  >Cancelar</Button>
              <Button type="submit" className='bg-blue-900 text-white font-bold' >{isEdit ? 'Guardar' : 'Crear'}</Button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Confirmar Eliminar */}
      {confirmDelete && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: 32, borderRadius: 8, minWidth: 320, boxShadow: '0 2px 16px rgba(0,0,0,0.15)' }}>
            <h3 style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 16 }}>¿Eliminar la empresa ?</h3>
            <p>Esta acción no se puede deshacer.</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
              <Button type="button" onClick={() => { setDeleteId(null); setConfirmDelete(false); }} className='bg-gray-300 text-black'>Cancelar</Button>
              <Button type="button" onClick={handleDelete} className='bg-red-700 text-white'>Eliminar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );  
} 