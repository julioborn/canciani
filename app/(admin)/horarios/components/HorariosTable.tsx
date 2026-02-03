"use client";

import { useEffect, useState } from "react";
import DiaRow from "./DiaRow";

export type Hora = {
    hora: string;
    activa: boolean;
};

export type Horario = {
    _id: string;
    dia: number;
    nombre: string;
    horas: Hora[];
};

export default function HorariosTable() {
    const [horarios, setHorarios] = useState<Horario[]>([]);

    useEffect(() => {
        fetch("/api/horarios")
            .then((res) => res.json())
            .then(setHorarios);
    }, []);

    const updateHorario = async (id: string, horas: Hora[]) => {
        await fetch(`/api/horarios/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ horas }),
        });
    };

    return (
        <div className="space-y-4">
            {horarios.map((dia) => (
                <DiaRow
                    key={dia._id}
                    dia={dia}
                    onChange={(horas) => updateHorario(dia._id, horas)}
                />
            ))}
        </div>
    );
}
