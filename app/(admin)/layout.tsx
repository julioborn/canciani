"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { signOut } from "next-auth/react";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [open, setOpen] = useState(false);

    return (
        <div className="min-h-screen bg-black text-white">
            {/* HEADER */}
            <header className="flex items-center justify-between px-4 py-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setOpen(true)}
                        className="text-2xl cursor-pointer"
                    >
                        ☰
                    </button>

                    <Image
                        src="/canciani.jpg"
                        alt="Canciani"
                        width={32}
                        height={32}
                        className="rounded-full"
                    />

                    <span className="font-semibold tracking-wide">
                        Canciani
                    </span>
                </div>
            </header>

            {/* MENU MOVIL */}
            {open && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm">
                    <div className="absolute top-0 left-0 w-64 h-full bg-white text-black p-6 rounded-r-3xl">
                        <button
                            onClick={() => setOpen(false)}
                            className="mb-6 text-xl cursor-pointer"
                        >
                            ✕
                        </button>

                        <nav className="flex flex-col gap-4 text-lg font-medium">
                            <Link href="/dashboard" onClick={() => setOpen(false)}>
                                Inicio
                            </Link>
                            <Link href="/pedidos" onClick={() => setOpen(false)}>
                                Pedidos
                            </Link>
                            <Link href="/stock" onClick={() => setOpen(false)}>
                                Stock
                            </Link>
                            <Link href="/horarios" onClick={() => setOpen(false)}>
                                Horarios
                            </Link>
                        </nav>
                        <button
                            onClick={() => {
                                setOpen(false);
                                signOut({ callbackUrl: "/login" });
                            }}
                            className="text-red-600 mt-3 font-semibold"
                        >
                            Cerrar sesión
                        </button>
                    </div>
                </div>
            )}

            {/* CONTENIDO */}
            <main className="p-4 md:p-8 bg-white text-black min-h-[calc(100vh-56px)] rounded-t-3xl">
                {children}
            </main>
        </div>
    );
}
