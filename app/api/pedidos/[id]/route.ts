import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import PedidoDesposte from "@/models/PedidoDesposte";
import PedidoRetiro from "@/models/PedidoRetiro";
import Stock from "@/models/Stock";

export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    const { estado } = await req.json();
    await connectMongoDB();

    // Buscar pedido en ambas colecciones
    const pedidoDesposte = await PedidoDesposte.findById(params.id);
    const pedidoRetiro = pedidoDesposte
        ? null
        : await PedidoRetiro.findById(params.id);

    const pedido: any = pedidoDesposte || pedidoRetiro;

    if (!pedido) {
        return NextResponse.json(
            { error: "Pedido no encontrado" },
            { status: 404 }
        );
    }

    // ==========================
    // ❌ CANCELAR → DEVOLVER STOCK + BORRAR
    // ==========================
    if (estado === "CANCELADO") {
        // devolver stock SOLO si estaba reservado
        if (pedido.estado === "RESERVADO") {
            const stock = await Stock.findOne();
            if (stock) {
                stock.disponible += pedido.cantidad;
                await stock.save();
            }
        }

        // eliminar definitivamente
        await pedido.deleteOne();

        return NextResponse.json({
            ok: true,
            deleted: true,
        });
    }

    // ==========================
    // 🔁 OTROS CAMBIOS DE ESTADO (si algún día los usás)
    // ==========================
    pedido.estado = estado;
    await pedido.save();

    return NextResponse.json({ ok: true });
}
