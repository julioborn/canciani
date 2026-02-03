import type { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import User from "@/models/User";
import connectMongoDB from "@/lib/mongodb";

export const authOptions: AuthOptions = {
    session: {
        strategy: "jwt",
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Usuario", type: "text" },
                password: { label: "Contraseña", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials.password) return null;

                await connectMongoDB();

                const user = await User.findOne({
                    username: credentials.username,
                    active: true,
                }).lean();

                if (!user) return null;

                const valid = await bcrypt.compare(
                    credentials.password,
                    user.password
                );

                if (!valid) return null;

                return {
                    id: user._id.toString(),
                    name: user.username,     // 👈 estándar NextAuth
                    username: user.username,
                    role: user.role,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.name = user.name;
                token.username = user.username;
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            session.user.id = token.id as string;
            session.user.name = token.name as string;
            session.user.username = token.username as string;
            session.user.role = token.role as "admin" | "superadmin";
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
};
