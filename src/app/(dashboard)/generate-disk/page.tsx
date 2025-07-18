"use client";
import React, { useCallback, useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/new-york-v4/ui/table";
import { toast } from "sonner";

const PAGE_SIZE = 10;

interface Period {
  id: string;
  periodName: string;
  periodStart: string;
  periodEnd: string;
  periodStatus: string;
}

export default function GenerateDiskPage() {
  const [periods, setPeriods] = useState<Period[]>([]);
  const [counts, setCounts] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchPeriods = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
      });
      const res = await fetch(`/api/periods?${params.toString()}`, { cache: "no-store" });
      if (!res.ok) throw new Error("No se pudieron obtener los periodos.");
      const data = await res.json();
      setPeriods(data.periods || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
      // Obtener conteo de movimientos por periodo
      const countsRes = await fetch(`/api/generate-disk/counts?ids=${data.periods.map((p: Period) => p.id).join(",")}`);
      if (countsRes.ok) {
        const countsData = await countsRes.json();
        setCounts(countsData.counts || {});
      } else {
        setCounts({});
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchPeriods();
  }, [fetchPeriods]);

  const handleDownload = async (periodId: string, periodName: string) => {
    try {
      const res = await fetch(`/api/generate-disk/download?periodId=${periodId}`);
      if (!res.ok) throw new Error("No se pudo generar el archivo");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      const now = new Date();
      const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
      const time = `${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}`;
      const dateTimeString = `${date}-${time}`;
      a.href = url;
      a.download = `periodo${periodName}_${dateTimeString}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Archivo descargado");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-4">
      <div className="flex items-center">
        <Heading
          title="Generar Disco"
          description="Visualiza los periodos y descarga los movimientos asociados"
        />
      </div>
      <Separator />
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre del periodo</TableHead>
              <TableHead>Fecha inicio</TableHead>
              <TableHead>Fecha fin</TableHead>
              <TableHead>Movimientos asociados</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5}>Cargando...</TableCell>
              </TableRow>
            ) : periods.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>No hay periodos</TableCell>
              </TableRow>
            ) : (
              periods.map((period) => (
                <TableRow key={period.id}>
                  <TableCell>{period.periodName}</TableCell>
                  <TableCell>{new Date(period.periodStart).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(period.periodEnd).toLocaleDateString()}</TableCell>
                  <TableCell>{counts[period.id] ?? 0}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="icon" onClick={() => handleDownload(period.id,period.periodName)}>
                      <Download className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-between items-center mt-4">
        <span>
          Página {page} de {totalPages} ({total} periodos)
        </span>
        <div className="flex gap-2">
          <Button variant="outline" disabled={page === 1} onClick={() => setPage(page - 1)}>
            Anterior
          </Button>
          <Button variant="outline" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
} 