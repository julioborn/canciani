import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            name: string; // 👈 estándar NextAuth
            username: string;
            role: "admin" | "superadmin";
        } & DefaultSession["user"];
    }

    interface User {
        id: string;
        name: string; // 👈 estándar NextAuth
        username: string;
        role: "admin" | "superadmin";
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        name: string; // 👈 estándar NextAuth
        username: string;
        role: "admin" | "superadmin";
    }
}
