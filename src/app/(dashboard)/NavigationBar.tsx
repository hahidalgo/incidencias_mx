'use client';
import Link from 'next/link';
import Image from 'next/image';
import { BellIcon, HouseIcon, PowerIcon, SettingsIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const NavigationBar = () => {
    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            const res = await fetch('/api/auth/me');
            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
            } else {
                setUser(null);
            }
        };
        fetchUser();
    }, []);

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/login');
    };

    return (
        <header className="w-full flex items-center justify-between px-6 py-2 bg-white shadow-sm">
            <div className="flex items-left gap-6">
                <Image src="/images/ollamani-logo.png" alt="Ollamani Grupo" width={177} height={60} />
                <span className="text-lg text-[#0E2655] font-medium py-4 px-3">
                    Portal de <span className="font-bold text-[#0E2655]">Recursos Humanos</span> 
                    <span className="text-gray-400">  |  </span> 
                    Semana <span className="text-[#0E2655] font-semibold">28</span>
                </span>
            </div>
            <div className="flex items-center gap-6 text-gray-400">
                <span className="text-gray-500 text-sm">Hola <span className="font-bold text-[#0E2655]">{user ? user.name : '...'}</span></span>
                <HouseIcon className="w-5 h-5" />
                <BellIcon className="w-5 h-5"  />
                <SettingsIcon className="w-5 h-5"  />
                <PowerIcon className="w-5 h-5 cursor-pointer" onClick={handleLogout} aria-label="Cerrar sesión" />
            </div>
        </header>
    );
};

export default NavigationBar;
