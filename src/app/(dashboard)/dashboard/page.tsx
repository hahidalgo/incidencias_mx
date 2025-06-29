'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/registry/new-york-v4/ui/card';
import { Button } from '@/registry/new-york-v4/ui/button';
import { useRouter } from 'next/navigation';

const icons = {
  incidencias: '/images/icons/incidencias.svg',
  vacaciones: '/images/icons/vacaciones.svg',
  tiempolibre: '/images/icons/tiempo-libre.svg',
  reportes: '/images/icons/reportes.svg',
  datos: '/images/icons/datos-maestros.svg',
  comunicados: '/images/icons/comunicados.svg',
  nomina: '/images/icons/recibos-nomina.svg',
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
    <div className="min-h-screen bg-[#fafaff]">
      {/* Header */}
      

      <main className="max-w-5xl mx-auto py-8 px-4">
        {/* Novedades */}
        <section className="mb-8">
          <h2 className="flex items-center gap-2 text-[#18306a] text-base font-semibold mb-4">
            <Image src="/images/icons/clock.svg" alt="Novedades" width={20} height={20} />
            Novedades
          </h2>
          <div className="flex gap-6">
            <div className="bg-[#3b3bb3] rounded-xl shadow-md px-8 py-6 flex flex-col items-center text-white w-56">
              <Image src="/images/icons/megafono.svg" alt="Incidencias" width={32} height={32} className="mb-2" />
              <span className="text-2xl font-bold">02</span>
              <span className="text-base font-medium mt-1">Nuevas incidencias</span>
            </div>
          </div>
        </section>

        {/* Registra */}
        <section className="mb-8">
          <h2 className="flex items-center gap-2 text-[#18306a] text-base font-semibold mb-4">
            <Image src="/images/icons/edit.svg" alt="Registra" width={20} height={20} />
            Registra
          </h2>
          <div className="flex gap-6 flex-wrap">
            <CardButton icon={icons.incidencias} label="Incidencias" />
            <CardButton icon={icons.vacaciones} label="Vacaciones" />
            <CardButton icon={icons.tiempolibre} label="Tiempo Libre" />
          </div>
        </section>

        {/* Consulta */}
        <section className="mb-8">
          <h2 className="flex items-center gap-2 text-[#18306a] text-base font-semibold mb-4">
            <Image src="/images/icons/search.svg" alt="Consulta" width={20} height={20} />
            Consulta
          </h2>
          <div className="flex gap-6 flex-wrap">
            <CardButton icon={icons.reportes} label="Reportes" />
            <CardButton icon={icons.datos} label="Datos Maestros" />
            <CardButton icon={icons.comunicados} label="Comunicados" />
            <CardButton icon={icons.nomina} label="Recibos de Nómina" />
          </div>
        </section>
      </main>
    </div>
  );
}

function CardButton({ icon, label }: { icon: string; label: string }) {
  return (
    <button className="flex flex-col items-center justify-center w-40 h-28 bg-white rounded-xl shadow-sm border border-[#ececec] hover:shadow-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#3b3bb3] group">
      <Image src={icon} alt={label} width={40} height={40} className="mb-2 group-hover:scale-110 transition-transform" />
      <span className="text-[#f39200] font-semibold text-base group-hover:text-[#3b3bb3]">{label}</span>
    </button>
  );
} 