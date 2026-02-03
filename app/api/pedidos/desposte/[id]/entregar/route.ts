import connectMongoDB from "@/lib/mongodb";
import PedidoDesposte from "@/models/PedidoDesposte";
import Stock from "@/models/Stock";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: { id: string } }) {
    const { kilosReales } = await req.json();
    await connectMongoDB();

    const pedidoActual = await PedidoDesposte.findById(params.id);
    if (!pedidoActual) {
        return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
    }

    const stock = await Stock.findOne();
    const precioKg = stock?.precioKg ?? stock?.precio ?? 0; // ajustá según tu modelo

    const precioFinal = Number(kilosReales) * Number(precioKg);

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

    // 📲 NOTIFICAR AL BOT (siempre con try/catch para no romper entrega)
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
                    `💰 Total: $${pedido.precioTotal}\n\n` +
                    `¡Te esperamos nuevamente!`,
            }),
        });
    } catch (e) {
        console.error("⚠️ No se pudo notificar por WhatsApp:", e);
    }

    return NextResponse.json({ ok: true, pedido });
}
