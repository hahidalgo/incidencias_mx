'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlarmClockIcon, Megaphone, PenToolIcon, SearchIcon, WalletCardsIcon, TentTree, Coffee, ChartNoAxesCombined, FileSearchIcon, CalendarSync } from 'lucide-react';

// Es una buena práctica definir una interfaz para los datos del usuario.
interface User {
  id: string;
  name: string;
  email: string;
}

const icons = {
  incidencias: <WalletCardsIcon className="w-12 h-12 group-hover:scale-110 transition-transform" />,
  vacaciones: <TentTree className="w-12 h-12 group-hover:scale-110 transition-transform" />,
  tiempolibre: <Coffee className="w-12 h-12 group-hover:scale-110 transition-transform" />,
  reportes: <ChartNoAxesCombined className="w-12 h-12 group-hover:scale-110 transition-transform" />,
  datos: <FileSearchIcon className="w-12 h-12 group-hover:scale-110 transition-transform" />,
  comunicados: <Megaphone className="w-12 h-12 group-hover:scale-110 transition-transform" />,
  nomina: <CalendarSync className="w-12 h-12 group-hover:scale-110 transition-transform" />,
};

// Reglas de visibilidad por rol
const buttonRules = {
  incidencias: ['SUPER_ADMIN', 'ENCARGADO_RRHH', 'SUPERVISOR_REGIONES', 'ENCARGADO_CASINO'],
  datos: ['SUPER_ADMIN', 'ENCARGADO_RRHH', 'SUPERVISOR_REGIONES'],
  reportes: ['SUPER_ADMIN', 'ENCARGADO_RRHH'],
};

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [incidenciasCount, setIncidenciasCount] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        router.push('/login');
      }
    };
    checkSession();
  }, [router]);

  useEffect(() => {
    const fetchIncidenciasCount = async () => {
      try {
        // Obtener periodo actual
        const periodRes = await fetch('/api/periods/current');
        if (!periodRes.ok) {
          setIncidenciasCount(0);
          
          return;
        }
        const period = await periodRes.json();
        // Contar movimientos activos de ese periodo
        const movRes = await fetch(`/api/movements?page=1&pageSize=1&periodId=${period.id}`);
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

  // Función para verificar permisos de botones
  const canAccessButton = (button: keyof typeof buttonRules) => {
    if (!user || !(user as any).userRol) return false;
    
    return buttonRules[button].includes((user as any).userRol);
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
              <span className="text-2xl font-bold">{incidenciasCount !== null ? incidenciasCount : '...'}</span>
              <span className="text-base font-medium mt-1">Nuevas incidencias</span>
            </div>
          </div>
        </section>

        {/* Registra */}
        <section className="mb-8 bg-white px-8 py-6" >
          <h2 className="flex items-center gap-2 text-[#0047BA] text-base font-semibold mb-4">
            <PenToolIcon className="w-6 h-6" />
            Incidencias
          </h2>
          <div className="flex justify-normal gap-6    text-[#f39200]">
            {canAccessButton('incidencias') && <CardButton icon={"incidencias"} label="Incidencias" source="/movimientos" />}
            {canAccessButton('datos') && <CardButton icon={"datos"} label="Revisión" source="/review" />}
            {canAccessButton('reportes') && <CardButton icon={"reportes"} label="Generar cvs" source="/generate-disk" />}
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
      <div className="mb-2">
        {SelectedIcon}
      </div>
      <span className="text-gray-500 text-base group-hover:text-[#0047BA]">{label}</span>
    </button>
  );
}