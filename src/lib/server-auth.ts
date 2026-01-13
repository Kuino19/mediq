import { cookies } from 'next/headers';
import { verifyJwt } from './auth';

export async function getCurrentUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
        return null;
    }

    const payload = verifyJwt(token);

    // In a real app we might valid against DB here too, but JWT payload is enough for now
    if (!payload || typeof payload !== 'object') {
        return null;
    }

    // Cast payload to user type (safely)
    return {
        id: (payload as any).userId as number,
        email: (payload as any).email as string,
        role: (payload as any).role as string,
        hospitalId: (payload as any).hospitalId as number,
    };
}
