'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/registry/new-york-v4/ui/card';
import { Button } from '@/registry/new-york-v4/ui/button';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // En una implementación real, obtendrías la información del usuario desde el contexto o localStorage
    // Por ahora, simulamos que el usuario está logueado
    setUser({
      name: 'Juan Pérez',
      email: 'juan.perez@ejemplo.com',
      role: 'Administrador',
      companyId: 'empresa-001',
      officeId: 'oficina-001'
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Panel de Control
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Bienvenido, {user.name}
            </p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            Cerrar Sesión
          </Button>
        </div>

        {/* User Info Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Información del Usuario</CardTitle>
            <CardDescription>
              Detalles de tu cuenta y permisos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Nombre</p>
                <p className="text-lg">{user.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-lg">{user.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Rol</p>
                <p className="text-lg">{user.role}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">ID de Empresa</p>
                <p className="text-lg">{user.companyId}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">ID de Oficina</p>
                <p className="text-lg">{user.officeId}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Incidencias</CardTitle>
              <CardDescription>
                Gestionar reportes de incidencias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                Ver Incidencias
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Movimientos</CardTitle>
              <CardDescription>
                Historial de movimientos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                Ver Movimientos
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Reportes</CardTitle>
              <CardDescription>
                Generar reportes y estadísticas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                Crear Reporte
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 