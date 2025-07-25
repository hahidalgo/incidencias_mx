"use client";

import getCookie from "@/lib/getToken";
import {
  AlarmClockIcon,
  CalendarSync,
  ChartNoAxesCombined,
  Coffee,
  FileSearchIcon,
  Megaphone,
  PenToolIcon,
  TentTree,
  WalletCardsIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Es una buena práctica definir una interfaz para los datos del usuario.
interface User {
  id: string;
  name: string;
  email: string;
}

const icons = {
  incidencias: (
    <WalletCardsIcon className="w-12 h-12 group-hover:scale-110 transition-transform" />
  ),
  vacaciones: (
    <TentTree className="w-12 h-12 group-hover:scale-110 transition-transform" />
  ),
  tiempolibre: (
    <Coffee className="w-12 h-12 group-hover:scale-110 transition-transform" />
  ),
  reportes: (
    <ChartNoAxesCombined className="w-12 h-12 group-hover:scale-110 transition-transform" />
  ),
  datos: (
    <FileSearchIcon className="w-12 h-12 group-hover:scale-110 transition-transform" />
  ),
  comunicados: (
    <Megaphone className="w-12 h-12 group-hover:scale-110 transition-transform" />
  ),
  nomina: (
    <CalendarSync className="w-12 h-12 group-hover:scale-110 transition-transform" />
  ),
};

const buttonRules = {
  incidencias: [1, 2, 3], // Solo Recursos Humanos
  datos: [2, 3], // Gerente y Administrador
  reportes: [2, 3], // Gerente y Administrador
};

export default function DashboardPage() {
  const cookieRol = getCookie("rol");
  const [user, setUser] = useState<User | null>(null);
  const [incidenciasCount, setIncidenciasCount] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const token = getCookie("token");
      const res = await fetch("http://localhost:3022/api/v1/auth/me", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        router.push("/login");
      }
    };
    checkSession();
  }, [router]);

  useEffect(() => {
    const fetchIncidenciasCount = async () => {
      try {
        // Obtener periodo actual
        const periodRes = await fetch(
          "http://localhost:3022/api/v1/periods/current",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${getCookie("token")}`,
            },
          }
        );
        console.log("periodRes", periodRes);

        if (!periodRes.ok) {
          setIncidenciasCount(0);

          return;
        }

        const respuestaPeriodo = await periodRes.json();
        // Contar movimientos activos de ese periodo
        const movRes = await fetch(
          `http://localhost:3022/api/v1/periods/filter/${respuestaPeriodo.period_name}/movements`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${getCookie("token")}`,
            },
          }
        );
        if (!movRes.ok) {
          setIncidenciasCount(0);

          return;
        }
        const movData = await movRes.json();
        setIncidenciasCount(movData.total || 0);
      } catch {
        setIncidenciasCount(0);
      }
    };
    fetchIncidenciasCount();
  }, []);

  const canAccessButton = (button: keyof typeof buttonRules) => {
    const rol = Number(cookieRol);

    return buttonRules[button]?.includes(rol);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Cargando...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbfafe]">
      {/* Header */}
      <main className="mx-auto py-8">
        {/* Novedades */}
        <section className="mb-8 px-8">
          <h2 className="flex items-center gap-2 text-[#0047BA] text-base font-semibold mb-4">
            <AlarmClockIcon className="w-6 h-6" />
            Novedades
          </h2>
          <div className="flex gap-6">
            <div className="bg-[#0047BA] rounded-xl shadow-md px-8 py-6 flex flex-col items-center text-white w-56">
              <Megaphone className="w-12 h-12" />
              <span className="text-2xl font-bold">
                {incidenciasCount !== null ? incidenciasCount : "..."}
              </span>
              <span className="text-base font-medium mt-1">
                Nuevas incidencias
              </span>
            </div>
          </div>
        </section>

        {/* Registra */}
        <section className="mb-8 bg-white px-8 py-6">
          <h2 className="flex items-center gap-2 text-[#0047BA] text-base font-semibold mb-4">
            <PenToolIcon className="w-6 h-6" />
            Incidencias
          </h2>
          <div className="flex justify-normal gap-6    text-[#f39200]">
            {canAccessButton("incidencias") && (
              <CardButton
                icon={"incidencias"}
                label="Incidencias"
                source="/movimientos"
              />
            )}
            {canAccessButton("datos") && (
              <CardButton icon={"datos"} label="Revisión" source="/review" />
            )}
            {canAccessButton("reportes") && (
              <CardButton
                icon={"reportes"}
                label="Generar cvs"
                source="/generate-disk"
              />
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

interface CardButtonProps {
  icon: keyof typeof icons;
  label: string;
  source?: string;
}

function CardButton({ icon, label, source }: CardButtonProps) {
  const SelectedIcon = icons[icon];
  const router = useRouter();

  const handleClick = () => {
    if (source) {
      router.push(source);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={!source}
      className="text-[#f39200] flex flex-col items-center justify-center w-40 h-28 bg-white rounded-xl shadow-sm border border-[#ececec] hover:shadow-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#3b3bb3] group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-sm"
    >
      <div className="mb-2">{SelectedIcon}</div>
      <span className="text-gray-500 text-base group-hover:text-[#0047BA]">
        {label}
      </span>
    </button>
  );
}
