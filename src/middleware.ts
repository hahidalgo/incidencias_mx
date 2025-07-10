import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Lista de rutas públicas que no requieren autenticación.
const publicPaths = ['/login', '/api/auth/login'];

export function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const { pathname } = request.nextUrl;

    const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));
    const isApiRoute = pathname.startsWith('/api');

    // Si la ruta es pública, se aplican las siguientes reglas.
    if (isPublicPath) {
        // Si el usuario ya está autenticado e intenta acceder a /login, redirigirlo al dashboard.
        if (token && pathname.startsWith('/login')) {
            return NextResponse.redirect(new URL('/', request.url));
        }

        // En cualquier otro caso para una ruta pública, permitir el acceso.
        return NextResponse.next();
    }

    // Si la ruta es protegida y no hay token, denegar el acceso.
    if (!token) {
        // Para las rutas de API, devolver un error 401.
        if (isApiRoute) {
            return new NextResponse(
                JSON.stringify({ success: false, message: 'Authentication required' }),
                { status: 401, headers: { 'Content-Type': 'application/json' } }
            );
        }
        
        // Para las páginas, redirigir al login.
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Si hay un token y la ruta es protegida, permitir el acceso.
    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Coincidir con todas las rutas de solicitud excepto las que comienzan con:
         * - _next/static (archivos estáticos)
         * - _next/image (archivos de optimización de imágenes)
         * - assets (recursos del proyecto)
         * - favicon.ico (archivo de favicon)
         * - images (archivos de imágenes locales)
         */
        '/((?!_next/static|_next/image|assets|favicon.ico|images).*)',
    ],
};