import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import PedidoDesposte from "@/models/PedidoDesposte";
import PedidoRetiro from "@/models/PedidoRetiro";
import Cliente from "@/models/Cliente";

type ClienteLean = {
    telefono: string;
    nombre: string;
    ultimoRetira?: string;
};

export async function GET() {
    await connectMongoDB();

    const despostes = await PedidoDesposte.find()
        .sort({ fecha: 1, hora: 1 })
        .lean();

    const retiros = await PedidoRetiro.find()
        .sort({ fecha: 1 })
        .lean();

    // 1️⃣ Unificamos pedidos (IGUAL a lo que ya tenías)
    const pedidos = [
        ...despostes.map(p => ({
            _id: p._id.toString(),
            telefono: p.telefono,
            producto: p.producto,
            cantidad: p.cantidad,
            fecha: p.fecha,
            hora: p.hora,
            precioUnitario: p.precioUnitario,
            precioTotal: p.precioTotal,
            estado: p.estado,
            tipoRetiro: "desposte",
        })),
        ...retiros.map(p => ({
            _id: p._id.toString(),
            telefono: p.telefono,
            producto: p.producto,
            cantidad: p.cantidad,
            fecha: p.fecha,
            hora: "12:00",
            precioUnitario: p.precioUnitario,
            precioTotal: p.precioTotal,
            estado: p.estado,
            tipoRetiro: "retiro",
        })),
    ];

    const telefonos = pedidos.map(p => p.telefono);

    const clientes = (await Cliente.find({
        telefono: { $in: telefonos },
    } as any).lean()) as ClienteLean[];

    const clientesMap = new Map(
        clientes.map(c => [c.telefono, c])
    );

    const pedidosFinal = pedidos.map(p => {
        const cliente = clientesMap.get(p.telefono);

        return {
            ...p,
            nombreCliente: cliente?.nombre || "-",
            retira: cliente?.ultimoRetira || "-",
        };
    });

    return NextResponse.json(pedidosFinal);

}
