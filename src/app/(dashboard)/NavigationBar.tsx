'use client';
import Link from 'next/link';
import Image from 'next/image';
import { BellIcon, HouseIcon, PowerIcon, SettingsIcon, Building2Icon, UserIcon, CalendarIcon, UsersRound, FactoryIcon, AlertCircleIcon} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    NavigationMenu,
    NavigationMenuList,
    NavigationMenuItem,
    NavigationMenuTrigger,
    NavigationMenuContent,
    NavigationMenuLink
} from '@/components/ui/navigation-menu';
import { canAccess, roleRules } from '@/lib/roleUtils';

const NavigationBar = () => {
    const [user, setUser] = useState<any>(null);
    const [currentPeriod, setCurrentPeriod] = useState<any>(null); // Nuevo estado
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            const res = await fetch('/api/auth/me');
            if (res.ok) {
                const data = await res.json();
                console.log(data);
                setUser(data.user);
            } else {
                setUser(null);
            }
        };
        fetchUser();
    }, []);

    useEffect(() => {
        const fetchPeriod = async () => {
            const res = await fetch('/api/periods/current');
            if (res.ok) {
                const data = await res.json();
                setCurrentPeriod(data);
            } else {
                setCurrentPeriod(null);
            }
        };
        fetchPeriod();
    }, []);

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/login');
    };

    return (
        <header className="w-full flex items-center justify-between px-6 py-4 bg-white shadow-sm">
            <div className="flex items-left gap-6">
                <Link href="/dashboard" className="flex items-center">
                    <Image src="/images/ollamani-logo.png" alt="Ollamani Grupo" width={177} height={60} />
                </Link>
                <span className="text-lg text-[#0E2655] font-medium py-4 px-3">
                    Portal de <span className="font-bold text-[#0E2655]">Recursos Humanos</span>
                    <span className="text-gray-400">  |  </span>
                    {currentPeriod ? (
                        <span className="inline-flex items-center gap-1">
                            <CalendarIcon className="w-4 h-4 inline-block text-blue-900" />
                            <span className="text-[#0E2655] font-semibold">{currentPeriod.periodName}</span>
                            <span className="text-gray-400 text-xs ml-2">({new Date(currentPeriod.periodStart).toLocaleDateString()} - {new Date(currentPeriod.periodEnd).toLocaleDateString()})</span>
                        </span>
                    ) : (
                        <span className="text-gray-400">Sin periodo actual</span>
                    )}
                </span>
            </div>
            <div className="flex items-center gap-6 text-gray-400">
                <span className="text-gray-500 text-sm">Hola <span className="font-bold text-[#0E2655]">{user ? user.userName : '...'}</span></span>
                <Link href="/dashboard" className="flex items-center"><HouseIcon className="w-5 h-5" /></Link>
                
                
                <NavigationMenu>
                    <NavigationMenuList>
                        <NavigationMenuItem>
                            <NavigationMenuTrigger>
                                <SettingsIcon className="w-5 h-5" />
                            </NavigationMenuTrigger>
                            <NavigationMenuContent>
                                <div className="flex flex-col min-w-[260px] max-h-[400px] max-w-full overflow-y-auto overflow-x-hidden">
                                    {canAccess(user?.userRol, 'menu', 'companies') && (
                                        <NavigationMenuLink asChild>
                                            <Link href="/companies" className="px-4 py-2 hover:bg-accent rounded flex-row items-center gap-2">
                                                <Building2Icon className="w-5 h-5" />
                                                Compañías
                                            </Link>
                                        </NavigationMenuLink>
                                    )}
                                    {canAccess(user?.userRol, 'menu', 'offices') && (
                                        <NavigationMenuLink asChild>
                                            <Link href="/offices" className="px-4 py-2 hover:bg-accent rounded flex-row items-center gap-2">
                                                <FactoryIcon className="w-5 h-5" />
                                                Oficinas
                                            </Link>
                                        </NavigationMenuLink>
                                    )}
                                    {canAccess(user?.userRol, 'menu', 'periods') && (
                                        <NavigationMenuLink asChild>
                                            <Link href="/periods" className="px-4 py-2 hover:bg-accent rounded flex-row items-center gap-2">
                                                <CalendarIcon className="w-5 h-5" />
                                                Periodos de Pago
                                            </Link>
                                        </NavigationMenuLink>
                                    )}
                                    {canAccess(user?.userRol, 'menu', 'incidents') && (
                                        <NavigationMenuLink asChild>
                                            <Link href="/incidents" className="px-4 py-2 hover:bg-accent rounded flex-row items-center gap-2">
                                                <AlertCircleIcon className="w-5 h-5" />
                                                Incidentes
                                            </Link>
                                        </NavigationMenuLink>
                                    )}
                                    {canAccess(user?.userRol, 'menu', 'employees') && (
                                        <NavigationMenuLink asChild>
                                            <Link href="/employees" className="px-4 py-2 hover:bg-accent rounded flex-row items-center gap-2">
                                                <UsersRound className="w-5 h-5" />
                                                Empleados
                                            </Link>
                                        </NavigationMenuLink>
                                    )}
                                    {canAccess(user?.userRol, 'menu', 'users') && (
                                        <NavigationMenuLink asChild>
                                            <Link href="/users" className="px-4 py-2 hover:bg-accent rounded flex-row items-center gap-2">
                                                <UserIcon className="w-5 h-5" />
                                                Usuarios
                                            </Link>
                                        </NavigationMenuLink>
                                    )}
                                </div>
                            </NavigationMenuContent>
                        </NavigationMenuItem>
                    </NavigationMenuList>
                </NavigationMenu>

                <BellIcon className="w-5 h-5" />
                <PowerIcon className="w-5 h-5 cursor-pointer" onClick={handleLogout} aria-label="Cerrar sesión" />
            </div>
        </header>
    );
};

export default NavigationBar;
