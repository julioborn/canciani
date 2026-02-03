import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
    const token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
    });

    const { pathname } = req.nextUrl;

    // 🔓 Login público
    if (pathname.startsWith("/login")) {
        // si ya está logueado, mandarlo al dashboard
        if (token) {
            return NextResponse.redirect(new URL("/dashboard", req.url));
        }
        return NextResponse.next();
    }

    // 🔒 No logueado → login
    if (!token) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    // ======================
    // 🔐 Reglas por rol
    // ======================

    const role = token.role as "admin" | "superadmin";

    const superAdminOnlyRoutes = [
        "/finanzas",
        "/estadisticas",
    ];

    if (
        superAdminOnlyRoutes.some((route) =>
            pathname.startsWith(route)
        ) &&
        role !== "superadmin"
    ) {
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
        "/login",
    ],
};
