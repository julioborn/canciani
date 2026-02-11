import connectMongoDB from "@/lib/mongodb";
import PedidoDesposte from "@/models/PedidoDesposte";
import Stock from "@/models/Stock";
import { NextResponse } from "next/server";

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    await connectMongoDB();

    const { kilosReales } = await req.json();

    const pedidoActual = await PedidoDesposte.findById(params.id);

    // ❌ Pedido inexistente
    if (!pedidoActual) {
        return NextResponse.json(
            { error: "Pedido no encontrado" },
            { status: 404 }
        );
    }

    // ⛔ YA ENTREGADO / CERRADO
    if (pedidoActual.estado !== "RESERVADO") {
        return NextResponse.json(
            {
                error: "Pedido ya procesado",
                estado: pedidoActual.estado,
            },
            { status: 409 } // Conflict
        );
    }

    // 📦 Stock
    const stock = await Stock.findOne();
    const precioKg = stock?.precioKg ?? stock?.precio ?? 0;

    const precioFinal = Number(kilosReales) * Number(precioKg);

    // ✅ ENTREGAR (una sola vez)
    const pedido = await PedidoDesposte.findByIdAndUpdate(
        params.id,
        {
            estado: "ENTREGADO",
            cierre: {
                kilosReales: Number(kilosReales),
                precioFinal,
                fechaEntrega: new Date(),
            },
        },
        { new: true }
    );

    // 📲 NOTIFICAR (sin romper flujo)
    try {
        await fetch(process.env.BOT_NOTIFY_URL!, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                telefono: pedido.telefono,
                mensaje:
                    `🥩 *Pedido entregado*\n\n` +
                    `Gracias por tu compra 🙌\n` +
                    `Te llevaste *${kilosReales} kg*\n` +
                    `💰 Total: $${precioFinal}\n\n` +
                    `¡Te esperamos nuevamente!`,
            }),
        });
    } catch (e) {
        console.error("⚠️ No se pudo notificar por WhatsApp:", e);
    }

    return NextResponse.json({ ok: true, pedido });
}