"use client";

import { useEffect, useState } from "react";

export default function StockPage() {
    const [disponible, setDisponible] = useState(0);
    const [precio, setPrecio] = useState(0);
    const [loading, setLoading] = useState(true);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        fetch("/api/stock")
            .then((res) => res.json())
            .then((data) => {
                setDisponible(data.disponible);
                setPrecio(data.precio);
                setLoading(false);
            });
    }, []);

    const guardar = async () => {
        setSaved(false);

        await fetch("/api/stock", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ disponible, precio }),
        });

        setSaved(true);
    };

    if (loading) return <p>Cargando stock...</p>;

    return (
        <div className="max-w-md space-y-4">
            <h1 className="text-2xl font-bold">Stock y Precio</h1>

            <div>
                <label>Stock disponible</label>
                <input
                    type="number"
                    value={disponible}
                    onChange={(e) => setDisponible(Number(e.target.value))}
                    className="border w-full p-2"
                />
            </div>

            <div>
                <label>Precio por media res</label>
                <input
                    type="number"
                    value={precio}
                    onChange={(e) => setPrecio(Number(e.target.value))}
                    className="border w-full p-2"
                />
            </div>

            <button
                onClick={guardar}
                className="bg-black text-white px-4 py-2 rounded"
            >
                Guardar cambios
            </button>

            {saved && <p className="text-green-600">✔ Guardado</p>}
        </div>
    );
}
