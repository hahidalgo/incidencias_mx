"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import getCookie from "@/lib/getToken";
import { Loader2 } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

const offices = [
  { value: "all", label: "Todas las oficinas" },
  { value: "cdmx", label: "CDMX" },
  { value: "gdl", label: "Guadalajara" },
];

interface Office {
  id: string;
  companyId: string;
  company_name: string;
  office_status: string;
  office_name: string;
}

type RowData = {
  period: string;
  office: string;
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
/*
// Simulación de incidencias (en la práctica, esto vendría de la API
const allIncidencias = [
  {
    id: 1,
    periodo: "Julio 2024",
    oficina: "CDMX",
    codigo: "INC001",
    nombre: "Falta injustificada",
    status: "Pendiente",
  },
  {
    id: 2,
    periodo: "Julio 2024",
    oficina: "CDMX",
    codigo: "INC002",
    nombre: "Retardo",
    status: "Pendiente",
  },
  {
    id: 3,
    periodo: "Julio 2024",
    oficina: "Guadalajara",
    codigo: "INC003",
    nombre: "Permiso sin goce",
    status: "Pendiente",
  },
];
*/
// Simulación de rol de usuario actual
// Usa los valores del enum Role de schema.prisma
const userRole: string = "SUPERVISOR_REGIONES"; // Cambia a "ENCARGADO_RRHH" o "SUPER_ADMIN" para probar otros roles
const PAGE_SIZE = 52;
export default function ReviewPage() {
  const periodo = getCookie("periodo");
  const rol = getCookie("rol");
  const [selectedPeriodo, setSelectedPeriodo] = useState<string>("");
  const [selectedOficina, setSelectedOficina] = useState<string>("");
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

  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [debouncedSearchOffice, setDebouncedSearchOffice] = useState("");

  const [movement, setMovement] = useState<any[]>([{}]);
  const [currentPeriod, setCurrentPeriod] = useState<any[]>([]);
  const [currentOficina, setCurrentOficina] = useState<any[]>([]);
  const [approvalsBulk, setApprovalsBulk] = useState<any[]>([]);
  const apiUrl = process.env.NEXT_PUBLIC_MS_INCIDENCIAS_URL;

  const fetchMovementForPeriodo = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
        search: String(periodo),
      });
      const selectedPeriods =
        debouncedSearch !== "" ? debouncedSearch : periodo;
      const selectedOficina =
        debouncedSearchOffice !== "" ? debouncedSearchOffice : "";

      const res = await fetch(
        `${apiUrl}approvals/movements/filter?period=${String(selectedPeriods)}&office=${String(selectedOficina)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("token")}`,
          },
        }
      );
      if (!res.ok) throw new Error("No se pudieron obtener los periodos.");
      const response = await res.json();
      setMovement(response.movements);
      //setTotal(total || 0);
      //setTotalPages(totalPages || 1);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, debouncedSearchOffice]);

  useEffect(() => {
    fetchMovementForPeriodo();
  }, [fetchMovementForPeriodo]);

  useEffect(() => {
    const fetchPeriod = async () => {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
        search: debouncedSearch,
      });
      const res = await fetch(`${apiUrl}periods?${params.toString()} `, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("token")}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentPeriod(data.periods);
      } else {
        setCurrentPeriod([]);
      }
    };
    fetchPeriod();
  }, []);

  const fetchOffices = useCallback(async () => {
    setLoading(true);
    const token = getCookie("token");
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
        search: debouncedSearch,
      });
      const res = await fetch(`${apiUrl}offices?${params.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("No se pudieron obtener las oficinas.");
      const data = await res.json();
      setCurrentOficina(data.data || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchOffices();
  }, [fetchOffices]);

  function handleOpenModal() {
    setModalPeriodo(selectedPeriodo);
    setModalOficina(selectedOficina);
    setError("");
    setModalOpen(true);
  }

  async function handleAprobarModal(e: React.FormEvent) {
    e.preventDefault();
    setPreAprobarLoading(true);
    const idOffice = movement.find(
      (mov) => mov.office === selectedOficina
    )?.officeId;
    try {
      const res = await fetch(`${apiUrl}approvals/movements/approve-bulk`, {
        method: "PUT",
        body: JSON.stringify({
          period: selectedPeriodo,
          office: idOffice,
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("token")}`,
        },
      });
      if (!res.ok) throw new Error("No se pudieron obtener los periodos.");
      const response = await res.json();
      console.log("response", response);
      console.log("response", response);
      if (response.updatedCount === 0) {
        console.log("response", response.updatedCount);
        toast.error(response.message);
      }
      setApprovalsBulk(response);
      //setTotal(total || 0);
      //setTotalPages(totalPages || 1);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }

    setTimeout(() => {
      setPreAprobarLoading(false);
      setPreAprobarOpen(false);
      // Aquí iría la lógica real de pre-aprobación
    }, 1200);
  }

  /*
  function handleRowClick(row: RowData) {
    if (userRole === "SUPERVISOR_REGIONES") {
      setPreAprobarRow(row);
      setPreAprobarOpen(true);
    } else if (userRole === "ENCARGADO_RRHH" || userRole === "SUPER_ADMIN") {
      setAprobarRow(row);
      setAprobarOpen(true);
    }
  }
 */
  async function handlePreAprobar() {
    setPreAprobarLoading(true);
    const idOffice = movement.find(
      (mov) => mov.office === selectedOficina
    )?.officeId;
    try {
      const res = await fetch(`${apiUrl}approvals/movements/approve-bulk`, {
        method: "PUT",
        body: JSON.stringify({
          period: selectedPeriodo,
          office: idOffice,
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("token")}`,
        },
      });
      if (!res.ok) throw new Error("No se pudieron obtener los periodos.");
      const response = await res.json();
      console.log("response", response);
      if (response.updatedCount === 0) {
        console.log("response", response.updatedCount);
        toast.error(response.message);
      }
      setApprovalsBulk(response);
      //setTotal(total || 0);
      //setTotalPages(totalPages || 1);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }

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

  async function handleAprobar() {
    setAprobarLoading(true);
    const idOffice = movement.find(
      (mov) => mov.office === selectedOficina
    )?.officeId;
    try {
      const res = await fetch(`${apiUrl}approvals/movements/approve-bulk`, {
        method: "PUT",
        body: JSON.stringify({
          period: selectedPeriodo,
          office: idOffice,
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("token")}`,
        },
      });
      if (!res.ok) throw new Error("No se pudieron obtener los periodos.");
      const response = await res.json();
      console.log("response", response);
      if (response.updatedCount === 0) {
        console.log("response", response.updatedCount);
        toast.error(response.message);
      }
      setApprovalsBulk(response);
      //setTotal(total || 0);
      //setTotalPages(totalPages || 1);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
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

  function handleSearchForPeriods(
    _evento: React.ChangeEvent<HTMLSelectElement>
  ) {
    console.log("_evento", _evento.target.value);
    setDebouncedSearch(_evento.target.value);
    setSelectedPeriodo(_evento.target.value);
  }

  function handleSearchForOffice(
    _evento: React.ChangeEvent<HTMLSelectElement>
  ) {
    console.log("_evento", _evento.target.value);
    setDebouncedSearchOffice(_evento.target.value);
    setSelectedOficina(_evento.target.value);
  }

  const puedeAprobar =
    userRole === "SUPERVISOR_REGIONES" || userRole === "ENCARGADO_RRHH";

  /*
  const filteredData = data.filter(
    (row) =>
      (selectedPeriodo === periods[0].value ||
        row.periodo ===
          periods.find((p) => p.value === selectedPeriodo)?.label) &&
      (selectedOficina === "all" ||
        row.oficina === offices.find((o) => o.value === selectedOficina)?.label)
  );
*/

  console.log("selectedPeriodo", selectedPeriodo);
  console.log("selectedOficina", selectedOficina);

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Aprobación de Incidencias</h1>
      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium mb-1">Periodo</label>
          <select
            className="border rounded px-2 py-1"
            value={currentPeriod.find((p) => p.value === periodo)?.period_name}
            onChange={(e) => handleSearchForPeriods(e)}
          >
            {currentPeriod.map((period) => (
              <option key={period.period_name} value={period.period_name}>
                {period.period_name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Oficina</label>
          <select
            className="border rounded px-2 py-1"
            value={selectedOficina}
            onChange={(e) => handleSearchForOffice(e)}
          >
            {currentOficina.map((office) => (
              <option key={office.id} value={office.id}>
                {office.office_name}
              </option>
            ))}
          </select>
        </div>
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogTrigger asChild>
            <Button
              className="ml-auto"
              onClick={handleOpenModal}
              disabled={!puedeAprobar}
            >
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
                  value={currentPeriod}
                  onChange={(e) => setSelectedPeriodo(e.target.value)}
                  required
                >
                  {currentPeriod.map((period) => (
                    <option key={period.period_name} value={period.period_name}>
                      {period.period_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="modal-oficina">Oficina</Label>
                <select
                  id="modal-oficina"
                  className="border rounded px-2 py-1 w-full mt-1"
                  value={selectedOficina}
                  onChange={(e) => setSelectedOficina(e.target.value)}
                  required
                >
                  {currentOficina.map((office) => (
                    <option key={office.office_name} value={office.office_name}>
                      {office.office_name}
                    </option>
                  ))}
                </select>
              </div>
              {error && <div className="text-red-600 text-sm">{error}</div>}
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" type="button">
                    Cancelar
                  </Button>
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
            {movement.map((row: RowData, idx) => (
              <TableRow key={idx}>
                <TableCell>{row.period}</TableCell>
                <TableCell>{row.office}</TableCell>
                <TableCell>{row.nroIncidencias}</TableCell>
                <TableCell>
                  {[
                    "4", //SUPER_ADMIN
                    "3", //SUPERVISOR_REGIONES
                    "2", //ENCARGADO_RRHH
                  ].includes(rol ?? "") ? (
                    <span
                      onClick={() => {
                        setPreAprobarRow(row);
                        setPreAprobarOpen(true);
                        setSelectedOficina(row.office);
                        setSelectedPeriodo(row.period);
                      }}
                      className="cursor-pointer"
                    >
                      {row.preAprobado ? (
                        <Badge
                          variant="default"
                          className="bg-sky-500 text-white"
                        >
                          {`${row.preAprobado}`}
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="bg-gray-300 text-gray-700"
                        >
                          Sin Pre-Aprobación
                        </Badge>
                      )}
                    </span>
                  ) : row.preAprobado ? (
                    <Badge variant="default" className="bg-sky-500 text-white">
                      {`${row.preAprobado}`}
                    </Badge>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="bg-gray-300 text-gray-700"
                    >
                      Sin Pre-Aprobación
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {[
                    "4", //SUPER_ADMIN
                    "3", //SUPERVISOR_REGIONES
                    "2", //ENCARGADO_RRHH
                  ].includes(rol ?? "") ? (
                    <span
                      onClick={() => {
                        setPreAprobarRow(row);
                        setPreAprobarOpen(true);
                        setSelectedOficina(row.office);
                        setSelectedPeriodo(row.period);
                      }}
                      className="cursor-pointer"
                    >
                      <Badge
                        variant={row.aprobado ? "default" : "secondary"}
                        className={`cursor-pointer ${row.aprobado ? "bg-green-500 text-white" : "bg-gray-300 text-gray-700"}`}
                      >
                        {row.aprobado ? `${row.aprobado}` : "Sin Aprobación"}
                      </Badge>
                    </span>
                  ) : row.aprobado ? (
                    <Badge
                      variant="default"
                      className="bg-green-500 text-white"
                    >
                      {`Aprobado el ${row.aprobado.fecha} por ${row.aprobado.usuario}`}{" "}
                      NOO
                    </Badge>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="bg-gray-300 text-gray-700"
                    >
                      Sin Aprobación NOO
                    </Badge>
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
                <b>Periodo:</b> {selectedPeriodo} <b>Oficina:</b>{" "}
                {selectedOficina}
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
                    {movement
                      .filter(
                        (mov) =>
                          (!selectedPeriodo ||
                            mov.period === selectedPeriodo) &&
                          (!selectedOficina || mov.office === selectedOficina)
                      )
                      .map((mov) =>
                        mov.movementsGroup.map((inc: any) => (
                          <TableRow key={inc.id}>
                            <TableCell>{inc.incidentCode}</TableCell>
                            <TableCell>{inc.employee?.employeeName}</TableCell>
                            <TableCell>{inc.approvalStatus}</TableCell>
                          </TableRow>
                        ))
                      )}
                  </TableBody>
                </Table>
              </div>
              <DialogFooter>
                <Button variant="outline" type="button">
                  Cancelar
                </Button>
                <Button onClick={handlePreAprobar} disabled={preAprobarLoading}>
                  {preAprobarLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}{" "}
                  Pre-Aprobar
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
                <b>Periodo:</b> {selectedPeriodo} <b>Oficina:</b>{" "}
                {selectedOficina}
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
                    {movement
                      .filter(
                        (mov) =>
                          (!selectedPeriodo ||
                            mov.period === selectedPeriodo) &&
                          (!selectedOficina || mov.office === selectedOficina)
                      )
                      .map((mov) =>
                        mov.movementsGroup.map((inc: any) => (
                          <TableRow key={inc.id}>
                            <TableCell>{inc.incidentCode}</TableCell>
                            <TableCell>{inc.employee?.employeeName}</TableCell>
                            <TableCell>{inc.approvalStatus}</TableCell>
                          </TableRow>
                        ))
                      )}
                  </TableBody>
                </Table>
              </div>
              <DialogFooter>
                <Button variant="outline" type="button">
                  Cancelar
                </Button>
                <Button onClick={handleAprobar} disabled={aprobarLoading}>
                  {aprobarLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}{" "}
                  Aprobar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
