'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

import { Button } from '@/registry/new-york-v4/ui/button';
import { Input } from '@/registry/new-york-v4/ui/input';
import { Label } from '@/registry/new-york-v4/ui/label';
import { Alert, AlertDescription } from '@/registry/new-york-v4/ui/alert';
import { toast } from 'sonner';
import Image from 'next/image';

const loginSchema = z.object({
  email: z.string().email('Por favor ingresa un email válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success('Inicio de sesión exitoso');
        router.push('/dashboard');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error al iniciar sesión');
        toast.error('Error al iniciar sesión');
      }
    } catch (error) {
      setError('Error de conexión. Por favor intenta de nuevo.');
      toast.error('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex">
      {/* Columna izquierda: branding */}
      <div className="hidden md:flex flex-col justify-between items-center w-1/2 bg-[#0047BA] relative overflow-hidden">
        {/* Imagen de fondo con overlay azul */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/login-bg.jpg"
            alt="Fondo login"
            fill
            style={{ objectFit: 'cover', opacity: 1 }}
            priority
          /> 
          <div className="absolute inset-0 bg-[#0047BA] opacity-90" />
        </div>
        {/* Logos y personas */}
        <div className="relative z-10 flex flex-col h-full w-full justify-between">
          <div className="flex-1 flex flex-col justify-center items-center gap-8">
            <div className="flex flex-wrap justify-center gap-8 ">
              <Image src="/images/playcity.png" alt="PlayCity" width={220} height={124} />
              <Image src="/images/banorte.png" alt="Banorte" width={220} height={124} />
            </div>
            <div className="flex flex-wrap justify-center gap-8 ">
              <Image src="/images/intermex.png" alt="Intermex" width={220} height={124} />
              <Image src="/images/televisa.png" alt="Televisa" width={220} height={124} />
            </div>
          </div>
        </div>
      </div>
      {/* Columna derecha: login */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 min-h-screen bg-white px-6">
        <div className="w-full max-w-md mx-auto">
          {/* Logo principal */}
          <div className="flex justify-center mb-8">
            <Image src="/images/ollamani-logo.png" alt="Ollamani Grupo" width={220} height={75} />
          </div>
          <h1 className="text-center text-[#0047BA] text-lg font-semibold mb-2">Portal Incidencias</h1>
          <h2 className="text-center text-[#0047BA] text-md font-semibold mb-2">Gesti&oacute;n de Cultura y Desarrollo</h2>
          <h3 className="text-center text-gray-700 text-base font-medium mb-6">Inicio de Sesión</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-[#0047BA]">Usuario *</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                {...register('email')}
                className={`mt-1 h-11 text-base ${errors.email ? 'border-red-500 focus:border-red-500' : 'border-[#0047BA] focus:border-[#0047BA]'} focus:ring-[#0047BA]`}
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="password" className="text-sm font-medium text-[#0047BA]">Contraseña *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('password')}
                  className={`mt-1 h-11 text-base pr-12 ${errors.password ? 'border-red-500 focus:border-red-500' : 'border-[#0047BA] focus:border-[#0047BA]'} focus:ring-[#0047BA]`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-4 hover:bg-transparent text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full h-11 text-base font-semibold bg-[#0047BA] hover:bg-[#142654] text-white rounded-md mt-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Accediendo...
                </>
              ) : (
                'Acceder'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
} 