"use client";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import getCookie from "@/lib/getToken";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/new-york-v4/ui/table";
import { Download } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

const PAGE_SIZE = 20;

interface Period {
  id: string;
  period_name: string;
  period_start: string;
  period_end: string;
  period_status: number;
  movements_count: number;
}

export default function GenerateDiskPage() {
  const [periods, setPeriods] = useState<Period[]>([]);
  const [counts, setCounts] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const apiUrl = process.env.NEXT_PUBLIC_MS_INCIDENCIAS_URL;
  const fetchPeriods = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
      });

      const res = await fetch(
        `${apiUrl}periods/with-movements?${params.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("token")}`,
          },
        }
      );
      if (!res.ok) throw new Error("No se pudieron obtener los periodos.");
      const data = await res.json();
      setPeriods(data.periods || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
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
      const res = await fetch(`${apiUrl}periods/generate/csv`, {
        method: "POST",
        body: JSON.stringify({
          period: periodName,
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("token")}`,
        },
      });
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
                  <TableCell>{period.period_name}</TableCell>
                  <TableCell>
                    {new Date(period.period_start).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {new Date(period.period_end).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{period.movements_count}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        handleDownload(period.id, period.period_name)
                      }
                    >
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
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}
