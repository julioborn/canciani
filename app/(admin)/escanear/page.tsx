"use client";

import { useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { BrowserQRCodeReader } from "@zxing/browser";

export default function EscanearPedidoPage() {
    const router = useRouter();
    const videoRef = useRef<HTMLVideoElement>(null);

    const controlsRef = useRef<{ stop: () => void } | null>(null);
    const busyRef = useRef(false);

    useEffect(() => {
        const reader = new BrowserQRCodeReader();

        const start = async () => {
            try {
                controlsRef.current = await reader.decodeFromVideoDevice(
                    undefined,
                    videoRef.current!,
                    async (result) => {
                        if (!result) return;
                        if (busyRef.current) return;

                        busyRef.current = true;

                        try {
                            const text = result.getText().trim();
                            console.log("📦 QR RAW:", text);

                            let pedidoId: string | null = null;

                            // JSON
                            try {
                                const data = JSON.parse(text);
                                pedidoId = data.pedidoId || data.id || null;
                            } catch { }

                            // Base64
                            if (!pedidoId) {
                                try {
                                    const decoded = atob(text);
                                    const data = JSON.parse(decoded);
                                    pedidoId = data.pedidoId || data.id || null;
                                } catch { }
                            }

                            // ObjectId suelto
                            if (!pedidoId) {
                                const match = text.match(/[a-f0-9]{24}/i);
                                if (match) pedidoId = match[0];
                            }

                            if (!pedidoId) {
                                await Swal.fire({
                                    icon: "warning",
                                    title: "QR inválido",
                                    text: "No se encontró un pedido válido.",
                                    confirmButtonColor: "#b91c1c",
                                });
                                busyRef.current = false; // ✅ seguir escaneando
                                return;
                            }

                            const res = await fetch(`/api/pedidos/${pedidoId}`);

                            if (!res.ok) {
                                await Swal.fire({
                                    icon: "error",
                                    title: "Pedido inexistente",
                                    text: "Este pedido no existe o fue eliminado.",
                                    confirmButtonColor: "#b91c1c",
                                });
                                busyRef.current = false; // ✅ seguir escaneando
                                return;
                            }

                            const data = await res.json();
                            const pedido = data.pedido;

                            console.log("🧠 PEDIDO BACKEND:", pedido);

                            const estado = String(pedido.estado || "").toUpperCase();

                            if (estado === "ENTREGADO" || estado === "CARGADO") {
                                await Swal.fire({
                                    icon: "warning",
                                    title: "Pedido ya entregado",
                                    text: "Este pedido ya fue procesado anteriormente.",
                                    confirmButtonText: "Escanear otro",
                                    confirmButtonColor: "#b91c1c",
                                });

                                busyRef.current = false;
                                return;
                            }

                            // ✅ Pedido válido: ahora sí cortamos scanner y navegamos
                            controlsRef.current?.stop();
                            router.push(`/pedidos/${pedidoId}`);
                        } catch (err) {
                            console.error(err);
                            busyRef.current = false;
                        }
                    }
                );
            } catch (e) {
                console.error(e);
                Swal.fire({
                    icon: "error",
                    title: "Cámara no disponible",
                    text: "No se pudo acceder a la cámara.",
                    confirmButtonText: "Volver",
                    confirmButtonColor: "#b91c1c",
                }).then(() => router.push("/pedidos"));
            }
        };

        start();

        return () => {
            // ✅ al salir de la pantalla, recién ahí paramos todo
            try {
                controlsRef.current?.stop();
            } catch { }
            controlsRef.current = null;
        };
    }, [router]);

    return (
        <main className="min-h-screen bg-white px-4 py-6">
            <h1 className="text-2xl font-bold text-center text-gray-900 mb-6">
                Escaneá el QR
            </h1>

            <div className="mx-auto w-72 h-72 relative rounded-2xl overflow-hidden border border-gray-300 shadow-lg">
                <video
                    ref={videoRef}
                    className="absolute inset-0 w-full h-full object-cover"
                    autoPlay
                    muted
                    playsInline
                />

                <div className="absolute inset-4 pointer-events-none">
                    <div className="absolute inset-0 border-2 border-red-600 rounded-xl" />
                    <span className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-red-600 rounded-tl-xl" />
                    <span className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-red-600 rounded-tr-xl" />
                    <span className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-red-600 rounded-bl-xl" />
                    <span className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-red-600 rounded-br-xl" />
                </div>
            </div>

            <button
                onClick={() => router.push("/pedidos")}
                className="mt-8 w-full max-w-xs mx-auto block bg-red-800 hover:bg-red-900 text-white py-3 rounded-lg font-semibold"
            >
                Volver a pedidos
            </button>
        </main>
    );
}
