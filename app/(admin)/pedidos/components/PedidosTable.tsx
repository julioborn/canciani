"use client";

import { useEffect, useState } from "react";
import EntregarPedidoModal from "./EntregarPedidoModal";

type Pedido = {
    _id: string;
    telefono: string;
    nombreCliente: string;
    cantidad: number;
    tipoRetiro: "desposte" | "retiro";
    fecha: string;
    hora?: string;
    precioTotal: number;
    estado: "RESERVADO" | "ENTREGADO" | "CANCELADO";
    retira?: string;
};

const estados: Pedido["estado"][] = [
    "RESERVADO",
    "ENTREGADO",
    "CANCELADO",
];

export default function PedidosTable() {
    const [pedidos, setPedidos] = useState<Pedido[]>([]);
    const [estadoActivo, setEstadoActivo] =
        useState<Pedido["estado"]>("RESERVADO");
    const [loading, setLoading] = useState(true);

    const cargarPedidos = async () => {
        setLoading(true);
        const res = await fetch("/api/pedidos");
        const data = await res.json();
        setPedidos(data);
        setLoading(false);
    };

    const cancelarPedido = async (id: string) => {
        await fetch(`/api/pedidos/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ estado: "CANCELADO" }),
        });

        cargarPedidos();
    };

    const mostrarRetira = (retira?: string, nombreCliente?: string) => {
        if (!retira) return "-";

        const normalizado = retira.trim().toLowerCase();

        if (
            normalizado === "yo" ||
            normalizado === "yo mismo" ||
            normalizado === "soy yo"
        ) {
            return nombreCliente || retira;
        }

        return retira;
    };

    const [pedidoSeleccionado, setPedidoSeleccionado] =
        useState<Pedido | null>(null);

    useEffect(() => {
        cargarPedidos();
    }, []);

    const filtrados = pedidos.filter(
        (p) => p.estado === estadoActivo
    );

    return (
        <div className="bg-white border rounded-2xl p-4">
            {/* Tabs */}
            <div className="flex gap-2 mb-4">
                {estados.map((e) => (
                    <button
                        key={e}
                        onClick={() => setEstadoActivo(e)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition
                            ${estadoActivo === e
                                ? "bg-black text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                    >
                        {e}
                    </button>
                ))}
            </div>

            {/* Estados */}
            {loading ? (
                <p className="text-sm text-gray-500">
                    Cargando pedidos…
                </p>
            ) : filtrados.length === 0 ? (
                <p className="text-sm text-gray-500">
                    No hay pedidos en este estado.
                </p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-sm text-gray-600">
                                <th className="p-3 text-left">Fecha</th>
                                <th className="p-3 text-left">Hora</th>
                                <th className="p-3 text-left">Teléfono</th>
                                <th className="p-3 text-left">Cliente</th>
                                <th className="p-3 text-left">Retira</th>
                                <th className="p-3 text-center">Cantidad</th>
                                <th className="p-3 text-left">Retiro</th>
                                <th className="p-3 text-right">Total</th>
                                <th className="p-3 text-right">Acciones</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filtrados.map((p) => (
                                <tr
                                    key={p._id}
                                    className="border-t text-sm hover:bg-gray-50"
                                >
                                    <td className="p-3">{p.fecha}</td>
                                    <td className="p-3">{p.hora || "-"}</td>
                                    <td className="p-3">{p.telefono}</td>
                                    <td className="p-3 font-medium">{p.nombreCliente}</td>
                                    <td className="p-3">
    {mostrarRetira(p.retira, p.nombreCliente)}
</td>
                                    <td className="p-3 text-center">{p.cantidad}</td>
                                    <td className="p-3">
                                        {p.tipoRetiro === "desposte"
                                            ? "Desposte"
                                            : "Retiro"}
                                    </td>
                                    <td className="p-3 text-right font-medium">
                                        ${p.precioTotal}
                                    </td>
                                    <td className="p-3 text-right space-x-2">
                                        {p.estado === "RESERVADO" && (
                                            <>
                                                <button
                                                    disabled={!!pedidoSeleccionado}
                                                    onClick={() => setPedidoSeleccionado(p)}
                                                    className="px-3 py-1 rounded cursor-pointer bg-green-600 text-white text-xs hover:bg-green-700 disabled:opacity-50"
                                                >
                                                    Entregar
                                                </button>

                                                <button
                                                    onClick={() => cancelarPedido(p._id)}
                                                    className="px-3 py-1 rounded cursor-pointer bg-red-600 text-white text-xs hover:bg-red-700"
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
            )}
            {pedidoSeleccionado && (
                <EntregarPedidoModal
                    pedido={pedidoSeleccionado}
                    onClose={() => setPedidoSeleccionado(null)}
                    onSuccess={cargarPedidos}
                />
            )}
        </div>
    );
}
