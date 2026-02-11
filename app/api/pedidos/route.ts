export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Pedido from "@/models/Pedido";

export async function GET() {
    await connectMongoDB();

    const pedidos = await Pedido.find()
        .sort({ createdAt: -1 })
        .lean();

    return NextResponse.json(
        pedidos.map(p => ({
            _id: p._id.toString(),
            telefono: p.telefono,
            nombreCliente: p.nombreCliente,
            fecha: p.fecha,
            hora: p.hora ?? "-",
            estado: p.estado,
            tipoPedido: p.tipoPedido, // TURNO | RETIRO_DIA
            retira: p.retira?.nombre ?? "-",
            items: p.items,
            precioFinal: p.cierre?.precioFinal ?? null,
        }))
    );
}
