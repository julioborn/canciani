"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        const res = await signIn("credentials", {
            username,
            password,
            redirect: false,
        });

        if (res?.error) {
            setError("Usuario o contraseña incorrectos");
        } else {
            router.push("/dashboard");
        }
    };

    return (
        <div className="flex h-screen items-center justify-center">
            <form
                onSubmit={handleSubmit}
                className="w-80 rounded border p-6 space-y-4"
            >
                <h1 className="text-xl font-bold text-center">Iniciar Sesión</h1>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <input
                    placeholder="Usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full border p-2 rounded"
                />

                <input
                    placeholder="Contraseña"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border p-2 rounded"
                />

                <button className="w-full bg-black text-white p-2 rounded">
                    Ingresar
                </button>
            </form>
        </div>
    );
}
