"use client";

type Props = {
    onChangeEstado: (estado: string) => void;
};

export default function FiltrosPedidos({ onChangeEstado }: Props) {
    return (
        <div className="flex gap-4 mb-4">
            <select
                className="border p-2 rounded"
                onChange={(e) => onChangeEstado(e.target.value)}
            >
                <option value="">Todos</option>
                <option value="RESERVADO">Reservados</option>
                <option value="ENTREGADO">Entregados</option>
                <option value="CANCELADO">Cancelados</option>
            </select>
        </div>
    );
}
