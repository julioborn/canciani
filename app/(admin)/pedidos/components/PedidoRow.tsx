"use client";

type Props = {
    pedido: any;
    onUpdate: () => void;
};

export default function PedidoRow({ pedido, onUpdate }: Props) {
    const cambiarEstado = async (estado: string) => {
        await fetch(`/api/pedidos/${pedido._id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ estado }),
        });

        onUpdate();
    };

    return (
        <tr className="border-t">
            <td>{pedido.fecha}</td>
            <td>{pedido.hora}</td>
            <td>{pedido.telefono}</td>
            <td>{pedido.cantidad}</td>
            <td>{pedido.tipoRetiro}</td>
            <td>${pedido.precioTotal}</td>
            <td>{pedido.estado}</td>
            <td className="flex gap-2">
                {pedido.estado === "RESERVADO" && (
                    <>
                        <button
                            className="px-2 py-1 bg-green-600 text-white rounded"
                            onClick={() => cambiarEstado("ENTREGADO")}
                        >
                            Entregar
                        </button>
                        <button
                            className="px-2 py-1 bg-red-600 text-white rounded"
                            onClick={() => cambiarEstado("CANCELADO")}
                        >
                            Cancelar
                        </button>
                    </>
                )}
            </td>
        </tr>
    );
}
