"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Item = {
    productoId: string;
    nombre: string;
    precioKg: number;
};

export default function EntregarPedidoPage() {
    const { id } = useParams();
    const router = useRouter();

    const [items, setItems] = useState<Item[]>([]);
    const [kilos, setKilos] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetch(`/admin/pedidos/${id}`)
            .then(r => r.json())
            .then(d => setItems(d.pedido.items));
    }, [id]);

    const total = useMemo(() => {
        return items.reduce(
            (sum, i) => sum + (kilos[i.productoId] || 0) * i.precioKg,
            0
        );
    }, [items, kilos]);

    const hayError = items.some(
        i => !kilos[i.productoId] || kilos[i.productoId] <= 0
    );

    async function cerrarPedido() {
        if (hayError) return;

        setLoading(true);

        const res = await fetch(`/admin/pedidos/${id}/cerrar`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                items: items.map(i => ({
                    productoId: i.productoId,
                    kilos: kilos[i.productoId],
                })),
            }),
        });

        setLoading(false);

        if (res.ok) {
            router.push("/pedidos");
        } else {
            alert("Error cerrando pedido");
        }
    }

    return (
        <div className="p-6 max-w-xl">
            <h1 className="text-xl font-bold mb-4">Cerrar pedido</h1>

            {items.map(i => (
                <div key={i.productoId} className="flex items-center gap-2 mb-3">
                    <div className="flex-1">
                        <p className="font-medium">{i.nombre}</p>
                        <p className="text-xs text-gray-500">
                            ${i.precioKg} / kg
                        </p>
                    </div>

                    <input
                        type="number"
                        step="0.01"
                        min={0}
                        className="border px-2 py-1 w-24 rounded"
                        placeholder="Kg"
                        onChange={e =>
                            setKilos({
                                ...kilos,
                                [i.productoId]: Number(e.target.value),
                            })
                        }
                    />

                    <div className="w-24 text-right font-medium">
                        ${(kilos[i.productoId] || 0) * i.precioKg}
                    </div>
                </div>
            ))}

            <hr className="my-4" />

            <div className="flex justify-between items-center mb-4">
                <span className="font-semibold">Total</span>
                <span className="text-lg font-bold">${total}</span>
            </div>

            {hayError && (
                <p className="text-sm text-red-600 mb-3">
                    ⚠️ Todos los productos deben tener kilos mayores a 0
                </p>
            )}

            <button
                disabled={loading || hayError}
                onClick={cerrarPedido}
                className="w-full bg-green-600 text-white py-2 rounded disabled:opacity-50"
            >
                {loading ? "Cerrando pedido..." : "Confirmar entrega"}
            </button>
        </div>
    );
}
