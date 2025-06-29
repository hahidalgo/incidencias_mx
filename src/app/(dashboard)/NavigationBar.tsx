import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/registry/new-york-v4/ui/button';
import { BellIcon, HouseIcon, PowerIcon, SettingsIcon } from 'lucide-react';


const NavigationBar = () => {
    return (
        <header className="w-full flex items-center justify-between px-8 py-4 bg-white shadow-sm">
            <div className="flex items-center gap-6">
                <Image src="/images/ollamani-logo.png" alt="Ollamani Grupo" width={140} height={40} />
                <span className="text-lg text-[#18306a] font-medium">
                    Portal de <span className="font-bold text-[#3b3bb3]">Recursos Humanos</span> <span className="text-gray-400">|</span> <span className="text-[#3b3bb3] font-semibold">Semana 28</span>
                </span>
            </div>
            <div className="flex items-center gap-6">
                <span className="text-gray-500 text-sm">Hola <span className="font-bold text-[#18306a]">{'User Name'}</span></span>
                <HouseIcon className="w-6 h-6" />
                <BellIcon className="w-6 h-6" />
                <SettingsIcon className="w-6 h-6" />
                <PowerIcon className="w-6 h-6" />
            </div>
        </header>
    );
};

export default NavigationBar;
