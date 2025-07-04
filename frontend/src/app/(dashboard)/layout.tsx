'use client';

import type { ReactNode } from 'react';
import NavigationBar from '@/app/(dashboard)/NavigationBar';

const DashboardLayout = ({ children }: Readonly<{ children: ReactNode }>) => {
    return (
        <>
            <NavigationBar />
            {children}
        </>
    );
};

export default DashboardLayout; 