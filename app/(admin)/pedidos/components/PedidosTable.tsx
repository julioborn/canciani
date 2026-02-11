"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Pedido = {
    _id: string;
    telefono: string;
    nombreCliente: string;
    fecha: string;
    hora?: string;
    estado: "RESERVADO" | "ENTREGADO";
    tipoPedido: "TURNO" | "RETIRO_DIA";
    retira?: string;
    items: { nombre: string; cantidad: number }[];
    precioFinal?: number | null;
};

const estados: Pedido["estado"][] = ["RESERVADO", "ENTREGADO"];

export default function PedidosPage() {
    const [pedidos, setPedidos] = useState<Pedido[]>([]);
    const [estadoActivo, setEstadoActivo] =
        useState<Pedido["estado"]>("RESERVADO");
    const [loading, setLoading] = useState(true);

    const router = useRouter();

    const cargarPedidos = async () => {
        setLoading(true);
        const res = await fetch("/api/pedidos");
        const data = await res.json();
        setPedidos(data);
        setLoading(false);
    };

    const cancelarPedido = async (id: string) => {
        const ok = confirm("¿Cancelar y eliminar el pedido definitivamente?");
        if (!ok) return;

        await fetch(`/api/pedidos/${id}`, { method: "DELETE" });
        cargarPedidos();
    };

    const mostrarRetira = (retira?: string, nombre?: string) => {
        if (!retira) return "-";
        const r = retira.trim().toLowerCase();
        if (["yo", "yo mismo", "soy yo"].includes(r)) return nombre || retira;
        return retira;
    };

    useEffect(() => {
        cargarPedidos();
    }, []);

    const filtrados = pedidos.filter((p) => p.estado === estadoActivo);

    return (
        <div className="p-4 max-w-6xl mx-auto space-y-4">
            {/* HEADER */}
            <div className="flex flex-col items-center gap-3 md:flex-row md:justify-between">
                <h1 className="text-2xl font-bold text-center md:text-left">
                    Pedidos
                </h1>

                <button
                    onClick={() => router.push("/escanear")}
                    className="bg-red-700 hover:bg-red-800 text-white px-5 py-2 rounded-lg text-sm"
                >
                    Escanear QR
                </button>
            </div>

            {/* TABS */}
            <div className="flex justify-center md:justify-start gap-2">
                {estados.map((e) => (
                    <button
                        key={e}
                        onClick={() => setEstadoActivo(e)}
                        className={`px-5 py-2 rounded-full text-sm font-medium transition
              ${estadoActivo === e
                                ? "bg-black text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                    >
                        {e}
                    </button>
                ))}
            </div>

            {/* CONTENIDO */}
            {loading ? (
                <p className="text-sm text-gray-500 text-center">
                    Cargando pedidos…
                </p>
            ) : filtrados.length === 0 ? (
                <p className="text-sm text-gray-500 text-center">
                    No hay pedidos en este estado.
                </p>
            ) : (
                <>
                    {/* 📱 MOBILE */}
                    <div className="grid gap-3 md:hidden">
                        {filtrados.map((p) => (
                            <div
                                key={p._id}
                                className="border rounded-xl p-4 bg-white space-y-2"
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold">{p.nombreCliente}</p>
                                        <p className="text-xs text-gray-500">{p.fecha}</p>
                                    </div>

                                    <span className="text-sm font-bold">
                                        {p.precioFinal ? `$${p.precioFinal}` : "-"}
                                    </span>
                                </div>

                                <div className="text-sm text-gray-600">
                                    <p>Tel: {p.telefono}</p>
                                    <p>
                                        Retira: {mostrarRetira(p.retira, p.nombreCliente)}
                                    </p>
                                    <p>
                                        Tipo:{" "}
                                        {p.tipoPedido === "TURNO" ? "Desposte" : "Retiro"}
                                    </p>
                                </div>

                                {p.estado === "RESERVADO" && (
                                    <div className="flex gap-2 pt-2">
                                        <button
                                            onClick={() => router.push(`/pedidos/${p._id}`)}
                                            className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm py-2 rounded"
                                        >
                                            Entregar
                                        </button>

                                        <button
                                            onClick={() => cancelarPedido(p._id)}
                                            className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm py-2 rounded"
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* 🖥️ DESKTOP */}
                    <div className="hidden md:block overflow-x-auto border rounded-xl bg-white">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-gray-600">
                                <tr>
                                    <th className="p-3 text-left">Fecha</th>
                                    <th className="p-3 text-left">Cliente</th>
                                    <th className="p-3 text-left">Teléfono</th>
                                    <th className="p-3 text-left">Retira</th>
                                    <th className="p-3 text-center">Items</th>
                                    <th className="p-3 text-left">Tipo</th>
                                    <th className="p-3 text-right">Total</th>
                                    <th className="p-3 text-right">Acciones</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filtrados.map((p) => (
                                    <tr
                                        key={p._id}
                                        className="border-t hover:bg-gray-50"
                                    >
                                        <td className="p-3">{p.fecha}</td>
                                        <td className="p-3 font-medium">
                                            {p.nombreCliente}
                                        </td>
                                        <td className="p-3">{p.telefono}</td>
                                        <td className="p-3">
                                            {mostrarRetira(p.retira, p.nombreCliente)}
                                        </td>
                                        <td className="p-3 text-center">
                                            {p.items.reduce((s, i) => s + i.cantidad, 0)}
                                        </td>
                                        <td className="p-3">
                                            {p.tipoPedido === "TURNO"
                                                ? "Desposte"
                                                : "Retiro"}
                                        </td>
                                        <td className="p-3 text-right font-semibold">
                                            {p.precioFinal ? `$${p.precioFinal}` : "-"}
                                        </td>
                                        <td className="p-3 text-right space-x-2">
                                            {p.estado === "RESERVADO" && (
                                                <>
                                                    <button
                                                        onClick={() =>
                                                            router.push(`/pedidos/${p._id}`)
                                                        }
                                                        className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700"
                                                    >
                                                        Entregar
                                                    </button>

                                                    <button
                                                        onClick={() => cancelarPedido(p._id)}
                                                        className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                                                    >
                                                        Cancelar
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}