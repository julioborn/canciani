"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Swal from "sweetalert2";

type Item = {
    productoId: string;
    nombre: string;
    precioKg: number;
    cantidad: number; // cantidad pedida (NO kg)
};

export default function CerrarPedidoPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    const [items, setItems] = useState<Item[]>([]);
    const [kilos, setKilos] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);

    // 🔄 Cargar pedido
    useEffect(() => {
        if (!id) return;

        const controller = new AbortController();

        fetch(`/api/pedidos/${id}`, { signal: controller.signal })
            .then(async (r) => {
                if (!r.ok) throw new Error("Pedido no encontrado");
                return r.json();
            })
            .then((data) => {
                const pedidoItems: Item[] = data.pedido.items;
                setItems(pedidoItems);

                // 👉 kg reales arrancan VACÍOS
                const initialKilos: Record<string, string> = {};
                pedidoItems.forEach((i) => {
                    initialKilos[i.productoId] = "";
                });

                setKilos(initialKilos);
                setLoading(false);
            })
            .catch((e) => {
                if (e.name === "AbortError") return;
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "No se pudo cargar el pedido",
                });
                router.push("/pedidos");
            });

        return () => controller.abort();
    }, [id, router]);

    // 💰 Total en tiempo real
    const total = items.reduce((sum, i) => {
        const kg = Number(kilos[i.productoId] || 0);
        return sum + kg * i.precioKg;
    }, 0);

    // 🔒 Confirmar cierre
    async function confirmarYCerrar() {
        const result = await Swal.fire({
            title: "Cerrar pedido",
            text: "Esta acción es definitiva",
            icon: "warning",

            width: "90%",
            padding: "1.2rem",

            showCancelButton: true,
            confirmButtonText: "Cerrar pedido",
            cancelButtonText: "Volver",

            confirmButtonColor: "#b91c1c", // rojo Canciani
            cancelButtonColor: "#e5e7eb",

            buttonsStyling: true,
            reverseButtons: true,

            customClass: {
                popup: "rounded-xl",
                title: "text-lg font-semibold",
                htmlContainer: "text-sm text-gray-600",
                confirmButton: "w-full py-3 text-base font-semibold rounded-lg",
                cancelButton: "w-full py-3 text-base rounded-lg text-gray-700",
                actions: "flex flex-col gap-2", // 👈 CLAVE para mobile
            },
        });

        if (!result.isConfirmed) return;

        // cerrar pedido…
    }

    if (loading) {
        return <div className="p-6 text-center">Cargando pedido…</div>;
    }

    return (
        <div className="p-4 max-w-md mx-auto">
            {/* Header */}
            <h1 className="text-2xl font-bold mb-1">🔒 Cerrar pedido</h1>
            <p className="text-gray-600 mb-4 text-sm">
                Ingresá los <b>kilos reales entregados</b>.
                El total se calcula automáticamente.
            </p>

            {/* Productos */}
            <div className="space-y-4">
                {items.map((i) => {
                    const kg = Number(kilos[i.productoId] || 0);
                    const subtotal = kg * i.precioKg;

                    return (
                        <div
                            key={i.productoId}
                            className="border rounded-lg p-4 bg-white shadow-sm"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="font-semibold text-lg">{i.nombre}</h3>
                                    <p className="text-sm text-gray-500">
                                        Cantidad: {i.cantidad}
                                    </p>
                                </div>

                                <div className="text-right text-sm text-gray-600">
                                    ${i.precioKg.toFixed(0)}/kg
                                </div>
                            </div>

                            <div className="flex items-center gap-3 mt-3">
                                <div className="flex-1">
                                    <label className="text-sm text-gray-500 block mb-1">
                                        Kg entregados
                                    </label>
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        pattern="[0-9]*[.,]?[0-9]*"
                                        placeholder="0"
                                        className="border rounded px-3 py-2 w-full text-lg text-center"
                                        value={kilos[i.productoId]}
                                        onChange={(e) => {
                                            const v = e.target.value.replace(",", ".");
                                            if (/^\d*\.?\d*$/.test(v)) {
                                                setKilos({ ...kilos, [i.productoId]: v });
                                            }
                                        }}
                                    />
                                </div>

                                <div className="text-right min-w-[90px]">
                                    <p className="text-sm text-gray-500">Subtotal</p>
                                    <p className="text-lg font-bold">
                                        ${subtotal.toFixed(0)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Total + acción */}
            <div className="mt-6 border-t pt-4">
                <div className="flex justify-between items-center mb-3">
                    <span className="text-lg font-semibold">Total final</span>
                    <span className="text-2xl font-bold">
                        ${total.toFixed(0)}
                    </span>
                </div>

                <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 text-sm rounded p-3 mb-3">
                    ⚠️ Al cerrar el pedido no podrá modificarse.
                </div>

                <button
                    disabled={loading}
                    onClick={confirmarYCerrar}
                    className="bg-red-700 hover:bg-red-800 disabled:opacity-60 text-white text-lg px-4 py-3 rounded w-full"
                >
                    Cerrar pedido
                </button>
            </div>
        </div>
    );
}