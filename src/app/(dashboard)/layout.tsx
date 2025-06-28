'use client';

import type { ReactNode } from 'react';
import NavigationBar from '@/app/(delete-this-and-modify-page.tsx)/NavigationBar';

const DashboardLayout = ({ children }: Readonly<{ children: ReactNode }>) => {
    return (
        <>
            <NavigationBar />
            {children}
        </>
    );
};

export default DashboardLayout; 