"use client";

import { useState } from "react";

type Props = {
    pedido: {
        _id: string;
        tipoRetiro: "desposte" | "retiro";
    };
    onClose: () => void;
    onSuccess: () => void;
};

export default function EntregarPedidoModal({
    pedido,
    onClose,
    onSuccess,
}: Props) {
    const [kilosReales, setKilosReales] = useState("");
    const [loading, setLoading] = useState(false);

    const entregar = async () => {
        if (!kilosReales) return;

        setLoading(true);

        const endpoint =
            pedido.tipoRetiro === "desposte"
                ? `/api/pedidos/desposte/${pedido._id}/entregar`
                : `/api/pedidos/retiro/${pedido._id}/entregar`;

        try {
            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ kilosReales: Number(kilosReales) }),
            });

            if (!res.ok) {
                const text = await res.text();
                console.error("❌ Error entrega:", res.status, text);
                alert("Error entregando. Mirá la consola (F12).");
                return;
            }

            onSuccess();
            onClose();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
            <div className="bg-white w-full max-w-md rounded-2xl p-6 space-y-4">
                <h2 className="text-lg font-bold">Finalizar entrega</h2>

                <div>
                    <label className="text-sm text-gray-600">
                        KG finales
                    </label>
                    <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={kilosReales}
                        onChange={(e) => setKilosReales(e.target.value)}
                        className="w-full border rounded-lg px-3 py-2"
                        autoFocus
                    />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm rounded bg-gray-200"
                    >
                        Cancelar
                    </button>

                    <button
                        onClick={entregar}
                        disabled={loading || !kilosReales}
                        className="px-4 py-2 text-sm rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                    >
                        {loading ? "Guardando..." : "Confirmar entrega"}
                    </button>
                </div>
            </div>
        </div>
    );
}
