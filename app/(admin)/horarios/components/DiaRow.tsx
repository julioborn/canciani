import { Horario, Hora } from "./HorariosTable";
import HoraToggle from "./HoraToggle";

export default function DiaRow({
    dia,
    onChange,
}: {
    dia: Horario;
    onChange: (horas: Hora[]) => void;
}) {
    const toggleHora = (index: number) => {
        const nuevasHoras = [...dia.horas];
        nuevasHoras[index].activa = !nuevasHoras[index].activa;
        onChange(nuevasHoras);
    };

    return (
        <div className="border p-4 rounded">
            <h2 className="font-semibold capitalize mb-2">{dia.nombre}</h2>

            <div className="flex gap-2 flex-wrap">
                {dia.horas.map((h, i) => (
                    <HoraToggle
                        key={h.hora}
                        hora={h.hora}
                        activa={h.activa}
                        onClick={() => toggleHora(i)}
                    />
                ))}
            </div>
        </div>
    );
}
