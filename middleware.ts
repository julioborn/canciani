import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
    const secret = process.env.NEXTAUTH_SECRET;

    // Si por algún motivo no existe en Edge, no rompas el sitio
    if (!secret) return NextResponse.next();

    const token = await getToken({ req, secret });

    if (!token) {
        const loginUrl = new URL("/login", req.url);
        return NextResponse.redirect(loginUrl);
    }

    const role = (token.role ?? "admin") as "admin" | "superadmin";

    const pathname = req.nextUrl.pathname;
    const superAdminOnlyRoutes = ["/finanzas", "/estadisticas"];

    if (superAdminOnlyRoutes.some(r => pathname.startsWith(r)) && role !== "superadmin") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/pedidos/:path*",
        "/stock/:path*",
        "/horarios/:path*",
        "/finanzas/:path*",
        "/estadisticas/:path*",
    ],
};

