import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Secret key for JWT signing - in production this should be in env vars
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
const secret = new TextEncoder().encode(JWT_SECRET);

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Define protected routes
    const isDashboardRoute = pathname.startsWith('/dashboard');
    const isAdminRoute = pathname.startsWith('/admin');
    const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register');

    // Get token from cookies
    const token = request.cookies.get('auth-token')?.value;

    // Verify token if present
    let payload = null;
    if (token) {
        try {
            const { payload: verifiedPayload } = await jwtVerify(token, secret);
            payload = verifiedPayload;
        } catch (error) {
            // Token invalid or expired
        }
    }

    // Redirect logic
    if (isDashboardRoute || isAdminRoute) {
        if (!payload) {
            // Not authenticated, redirect to login
            const url = new URL('/login', request.url);
            url.searchParams.set('callbackUrl', pathname);
            return NextResponse.redirect(url);
        }

        // Check role for admin routes
        if (isAdminRoute && payload.role !== 'admin') {
            // Not authorized, redirect to dashboard or unauthorized page
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    }

    if (isAuthRoute && payload) {
        // Already authenticated, redirect to dashboard
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/admin/:path*', '/login', '/register'],
};
