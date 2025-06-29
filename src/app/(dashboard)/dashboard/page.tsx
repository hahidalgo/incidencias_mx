'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlarmClockIcon, Megaphone, PenToolIcon, SearchIcon, WalletCardsIcon, TentTree, Coffee, ChartNoAxesCombined, FileSearchIcon, CalendarSync } from 'lucide-react';

const icons = {
  incidencias: <WalletCardsIcon className="w-12 h-12 group-hover:scale-110 transition-transform" />,
  vacaciones: <TentTree className="w-12 h-12 group-hover:scale-110 transition-transform" />,
  tiempolibre: <Coffee className="w-12 h-12 group-hover:scale-110 transition-transform" />,
  reportes: <ChartNoAxesCombined className="w-12 h-12 group-hover:scale-110 transition-transform" />,
  datos: <FileSearchIcon className="w-12 h-12 group-hover:scale-110 transition-transform" />,
  comunicados: <Megaphone className="w-12 h-12 group-hover:scale-110 transition-transform" />,
  nomina: <CalendarSync className="w-12 h-12 group-hover:scale-110 transition-transform" />,
};

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // En una implementación real, obtendrías la información del usuario desde el contexto o localStorage
    // Por ahora, simulamos que el usuario está logueado
    setUser({
      name: 'Jessica',
      email: 'jessica.he@ollamani.com.mx',
    });
  }, []);

  const handleLogout = () => {
    // Aquí limpiarías la sesión
    router.push('/login');
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
      <main className="max-w-5xl mx-auto py-8 px-4">

        {/* Novedades */}
        <section className="mb-8">
          <h2 className="flex items-center gap-2 text-[#0e2655] text-base font-semibold mb-4">
            <AlarmClockIcon className="w-6 h-6" />
            Novedades
          </h2>
          <div className="flex gap-6">
            <div className="bg-[#0e2655] rounded-xl shadow-md px-8 py-6 flex flex-col items-center text-white w-56">
              <Megaphone className="w-12 h-12" />
              <span className="text-2xl font-bold">02</span>
              <span className="text-base font-medium mt-1">Nuevas incidencias</span>
            </div>
          </div>
        </section>

        {/* Registra */}
        <section className="mb-8 bg-white rounded-xl shadow-md px-8 py-6" >
          <h2 className="flex items-center gap-2 text-[#0e2655] text-base font-semibold mb-4">
            <PenToolIcon className="w-6 h-6" />
            Registra
          </h2>
          <div className="flex gap-6 flex-wrap  text-[#f39200]">
            <CardButton icon={"incidencias"} label="Incidencias" />
            <CardButton icon={"vacaciones"} label="Vacaciones" />
            <CardButton icon={"tiempolibre"} label="Tiempo Libre" />
          </div>
        </section>

        {/* Consulta */}
        <section className="mb-8">
          <h2 className="flex items-center gap-2 text-[#0e2655] text-base font-semibold mb-4">
            <SearchIcon className="w-6 h-6" />
            Consulta
          </h2>
          <div className="flex gap-6 flex-wrap">
            <CardButton icon={"reportes"} label="Reportes" />
            <CardButton icon={"datos"} label="Datos Maestros" />
            <CardButton icon={"comunicados"} label="Comunicados" />
            <CardButton icon={"nomina"} label="Recibos de Nómina" />
          </div>
        </section>
      </main>
    </div>
  );
}

function CardButton({ icon, label }: { icon: keyof typeof icons; label: string }) {
  const SelectedIcon = icons[icon];
  
  return (
    <button className="text-[#f39200] flex flex-col items-center justify-center w-40 h-28 bg-white rounded-xl shadow-sm border border-[#ececec] hover:shadow-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#3b3bb3] group">
      <div className="mb-2">
        {SelectedIcon}
      </div>
      <span className="text-gray-500 text-base group-hover:text-[#0e2655]">{label}</span>
    </button>
  );
} 