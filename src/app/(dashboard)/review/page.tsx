"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

const periods = [
    { value: "2024-07", label: "Julio 2024" },
    { value: "2024-06", label: "Junio 2024" },
];

const offices = [
    { value: "all", label: "Todas las oficinas" },
    { value: "cdmx", label: "CDMX" },
    { value: "gdl", label: "Guadalajara" },
];

type RowData = {
  periodo: string;
  oficina: string;
  nroIncidencias: number;
  preAprobado: any;
  aprobado: any;
};

const data: RowData[] = [
    {
        periodo: "Julio 2024",
        oficina: "CDMX",
        nroIncidencias: 12,
        preAprobado: { fecha: "2024-07-18", usuario: "Juan Pérez" },
        aprobado: { fecha: "2024-07-19", usuario: "Ana López" },
    },
    {
        periodo: "Julio 2024",
        oficina: "Guadalajara",
        nroIncidencias: 7,
        preAprobado: null,
        aprobado: null,
    },
    {
        periodo: "Julio 2024",
        oficina: "Guadalajara",
        nroIncidencias: 7,
        preAprobado: { fecha: "2024-07-18", usuario: "Juan Pérez" },
        aprobado: null,
    },
];

// Simulación de incidencias (en la práctica, esto vendría de la API)
const allIncidencias = [
  { id: 1, periodo: "Julio 2024", oficina: "CDMX", codigo: "INC001", nombre: "Falta injustificada", status: "Pendiente" },
  { id: 2, periodo: "Julio 2024", oficina: "CDMX", codigo: "INC002", nombre: "Retardo", status: "Pendiente" },
  { id: 3, periodo: "Julio 2024", oficina: "Guadalajara", codigo: "INC003", nombre: "Permiso sin goce", status: "Pendiente" },
];

// Simulación de rol de usuario actual
// Usa los valores del enum Role de schema.prisma
const userRole: string = "SUPERVISOR_REGIONES"; // Cambia a "ENCARGADO_RRHH" o "SUPER_ADMIN" para probar otros roles

export default function ReviewPage() {
    const [selectedPeriodo, setSelectedPeriodo] = useState(periods[0].value);
    const [selectedOficina, setSelectedOficina] = useState(offices[0].value);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalPeriodo, setModalPeriodo] = useState(selectedPeriodo);
    const [modalOficina, setModalOficina] = useState(selectedOficina);
    const [error, setError] = useState("");
    const [preAprobarOpen, setPreAprobarOpen] = useState(false);
    const [preAprobarRow, setPreAprobarRow] = useState<RowData | null>(null);
    const [preAprobarLoading, setPreAprobarLoading] = useState(false);
    const [notificarLoading, setNotificarLoading] = useState(false);
    const [aprobarOpen, setAprobarOpen] = useState(false);
    const [aprobarRow, setAprobarRow] = useState<RowData | null>(null);
    const [aprobarLoading, setAprobarLoading] = useState(false);
    const [notificarSupLoading, setNotificarSupLoading] = useState(false);

    function handleOpenModal() {
        setModalPeriodo(selectedPeriodo);
        setModalOficina(selectedOficina);
        setError("");
        setModalOpen(true);
    }

    function handleAprobarModal(e: React.FormEvent) {
        e.preventDefault();
        // Verificar duplicados
        const existe = data.some(
            (row) =>
                row.periodo === periods.find(p => p.value === modalPeriodo)?.label &&
                row.oficina === offices.find(o => o.value === modalOficina)?.label
        );
        if (existe) {
            setError("Ya existe un registro con ese Periodo y Oficina.");
            return;
        }
        // Aquí iría la lógica para guardar la aprobación
        setModalOpen(false);
        setError("");
        // Mostrar feedback o actualizar datos según sea necesario
    }

    function handleRowClick(row: RowData) {
        if (userRole === "SUPERVISOR_REGIONES") {
            setPreAprobarRow(row);
            setPreAprobarOpen(true);
        } else if (userRole === "ENCARGADO_RRHH" || userRole === "SUPER_ADMIN") {
            setAprobarRow(row);
            setAprobarOpen(true);
        }
    }

    function handlePreAprobar() {
        setPreAprobarLoading(true);
        setTimeout(() => {
            setPreAprobarLoading(false);
            setPreAprobarOpen(false);
            // Aquí iría la lógica real de pre-aprobación
        }, 1200);
    }

    function handleNotificar() {
        setNotificarLoading(true);
        setTimeout(() => {
            setNotificarLoading(false);
            setPreAprobarOpen(false);
            // Aquí iría la lógica real de notificación
        }, 1200);
    }

    function handleAprobar() {
        setAprobarLoading(true);
        setTimeout(() => {
            setAprobarLoading(false);
            setAprobarOpen(false);
            // Aquí iría la lógica real de aprobación
        }, 1200);
    }

    function handleNotificarSup() {
        setNotificarSupLoading(true);
        setTimeout(() => {
            setNotificarSupLoading(false);
            setAprobarOpen(false);
            // Aquí iría la lógica real de notificación al Supervisor de Zona
        }, 1200);
    }

    const puedeAprobar = userRole === "SUPERVISOR_REGIONES" || userRole === "ENCARGADO_RRHH";

    const filteredData = data.filter(
        (row) =>
            (selectedPeriodo === periods[0].value || row.periodo === periods.find(p => p.value === selectedPeriodo)?.label) &&
            (selectedOficina === "all" || row.oficina === offices.find(o => o.value === selectedOficina)?.label)
    );

    return (
        <div className="p-8 space-y-6">
            <h1 className="text-2xl font-bold">Aprobación de Incidencias</h1>
            <div className="flex flex-wrap gap-4 items-end">
                <div>
                    <label className="block text-sm font-medium mb-1">Periodo</label>
                    <select
                        className="border rounded px-2 py-1"
                        value={selectedPeriodo}
                        onChange={e => setSelectedPeriodo(e.target.value)}
                    >
                        {periods.map((period) => (
                            <option key={period.value} value={period.value}>
                                {period.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Oficina</label>
                    <select
                        className="border rounded px-2 py-1"
                        value={selectedOficina}
                        onChange={e => setSelectedOficina(e.target.value)}
                    >
                        {offices.map((office) => (
                            <option key={office.value} value={office.value}>
                                {office.label}
                            </option>
                        ))}
                    </select>
                </div>
                <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                    <DialogTrigger asChild>
                        <Button className="ml-auto" onClick={handleOpenModal} disabled={!puedeAprobar}>
                            Iniciar aprobación
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <form onSubmit={handleAprobarModal} className="space-y-4">
                            <DialogHeader>
                                <DialogTitle>Iniciar Aprobación</DialogTitle>
                            </DialogHeader>
                            <div>
                                <Label htmlFor="modal-periodo">Periodo</Label>
                                <select
                                    id="modal-periodo"
                                    className="border rounded px-2 py-1 w-full mt-1"
                                    value={modalPeriodo}
                                    onChange={e => setModalPeriodo(e.target.value)}
                                    required
                                >
                                    {periods.map((period) => (
                                        <option key={period.value} value={period.value}>
                                            {period.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <Label htmlFor="modal-oficina">Oficina</Label>
                                <select
                                    id="modal-oficina"
                                    className="border rounded px-2 py-1 w-full mt-1"
                                    value={modalOficina}
                                    onChange={e => setModalOficina(e.target.value)}
                                    required
                                >
                                    {offices.filter(o => o.value !== "all").map((office) => (
                                        <option key={office.value} value={office.value}>
                                            {office.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {error && <div className="text-red-600 text-sm">{error}</div>}
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline" type="button">Cancelar</Button>
                                </DialogClose>
                                <Button type="submit">Aceptar</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>PERIODO</TableHead>
                            <TableHead>OFICINA</TableHead>
                            <TableHead>NRO. INCIDENCIAS</TableHead>
                            <TableHead>PreAprobado</TableHead>
                            <TableHead>APROBADO</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredData.map((row: RowData, idx) => (
                            <TableRow key={idx}>
                                <TableCell>{row.periodo}</TableCell>
                                <TableCell>{row.oficina}</TableCell>
                                <TableCell>{row.nroIncidencias}</TableCell>
                                <TableCell>
                                    {["SUPER_ADMIN", "SUPERVISOR_REGIONES", "ENCARGADO_RRHH"].includes(userRole) ? (
                                        <span onClick={() => { setPreAprobarRow(row); setPreAprobarOpen(true); }} className="cursor-pointer">
                                            {row.preAprobado ? (
                                                <Badge variant="default" className="bg-sky-500 text-white">
                                                    {`Preaprobado el ${row.preAprobado.fecha} por ${row.preAprobado.usuario}`}
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary" className="bg-gray-300 text-gray-700">
                                                    Sin Pre-Aprobación
                                                </Badge>
                                            )}
                                        </span>
                                    ) : (
                                        row.preAprobado ? (
                                            <Badge variant="default" className="bg-sky-500 text-white">
                                                {`Preaprobado el ${row.preAprobado.fecha} por ${row.preAprobado.usuario}`}
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary" className="bg-gray-300 text-gray-700">
                                                Sin Pre-Aprobación
                                            </Badge>
                                        )
                                    )}
                                </TableCell>
                                <TableCell>
                                    {["SUPER_ADMIN", "SUPERVISOR_REGIONES", "ENCARGADO_RRHH"].includes(userRole) ? (
                                        <span onClick={() => { setAprobarRow(row); setAprobarOpen(true); }} className="cursor-pointer">
                                            <Badge
                                                variant={row.aprobado ? 'default' : 'secondary'}
                                                className={`cursor-pointer ${row.aprobado ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-700'}`}
                                            >
                                                {row.aprobado
                                                    ? `Aprobado el ${row.aprobado.fecha} por ${row.aprobado.usuario}`
                                                    : 'Sin Aprobación'}
                                            </Badge>
                                        </span>
                                    ) : (
                                        row.aprobado ? (
                                            <Badge variant="default" className="bg-green-500 text-white">
                                                {`Aprobado el ${row.aprobado.fecha} por ${row.aprobado.usuario}`} NOO
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary" className="bg-gray-300 text-gray-700">
                                                Sin Aprobación  NOO
                                            </Badge>
                                        )
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            {/* Modal de Pre-Aprobación */}
            <Dialog open={preAprobarOpen} onOpenChange={setPreAprobarOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Pre-Aprobar Incidencias</DialogTitle>
                    </DialogHeader>
                    {preAprobarRow && (
                        <>
                            <div className="mb-2 text-sm text-muted-foreground">
                                <b>Periodo:</b> {preAprobarRow.periodo} <b>Oficina:</b> {preAprobarRow.oficina}
                            </div>
                            <div className="border rounded-lg overflow-x-auto mb-4">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Código</TableHead>
                                            <TableHead>Nombre</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {allIncidencias.filter(
                                            inc => inc.periodo === preAprobarRow.periodo && inc.oficina === preAprobarRow.oficina
                                        ).map(inc => (
                                            <TableRow key={inc.id}>
                                                <TableCell>{inc.codigo}</TableCell>
                                                <TableCell>{inc.nombre}</TableCell>
                                                <TableCell>{inc.status}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleNotificar} variant="outline" disabled={notificarLoading}>
                                    {notificarLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Notificar a Encargado Playcity
                                </Button>
                                <Button onClick={handlePreAprobar} disabled={preAprobarLoading}>
                                    {preAprobarLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Pre-Aprobar
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
            {/* Modal de Aprobación RRHH */}
            <Dialog open={aprobarOpen} onOpenChange={setAprobarOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Aprobar Incidencias</DialogTitle>
                    </DialogHeader>
                    {aprobarRow && (
                        <>
                            <div className="mb-2 text-sm text-muted-foreground">
                                <b>Periodo:</b> {aprobarRow.periodo} <b>Oficina:</b> {aprobarRow.oficina}
                            </div>
                            <div className="border rounded-lg overflow-x-auto mb-4">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Código</TableHead>
                                            <TableHead>Nombre</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {allIncidencias.filter(
                                            inc => inc.periodo === aprobarRow.periodo && inc.oficina === aprobarRow.oficina
                                        ).map(inc => (
                                            <TableRow key={inc.id}>
                                                <TableCell>{inc.codigo}</TableCell>
                                                <TableCell>{inc.nombre}</TableCell>
                                                <TableCell>{inc.status}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleNotificarSup} variant="outline" disabled={notificarSupLoading}>
                                    {notificarSupLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Notificar a Supervisor de Zona
                                </Button>
                                <Button onClick={handleAprobar} disabled={aprobarLoading}>
                                    {aprobarLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Aprobar
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
} 