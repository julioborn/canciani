export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Pedido from "@/models/Pedido";

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    await connectMongoDB();

    const body = await req.json();

    /**
     * body esperado:
     * {
     *   items: [
     *     { productoId, kilosReales }
     *   ]
     * }
     */

    const pedido = await Pedido.findById(params.id);
    if (!pedido) {
        return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
    }

    if (pedido.estado !== "RESERVADO") {
        return NextResponse.json(
            { error: "El pedido ya fue cerrado o cancelado" },
            { status: 400 }
        );
    }

    const cierreItems = [];
    let precioFinal = 0;

    for (const item of body.items || []) {
        const original = pedido.items.find(
            (i: any) => i.productoId.toString() === item.productoId
        );

        if (!original) {
            return NextResponse.json(
                { error: "Producto inválido en cierre" },
                { status: 400 }
            );
        }

        const kilos = Number(item.kilosReales);
        if (!Number.isFinite(kilos) || kilos < 0) {
            return NextResponse.json(
                { error: "kilosReales inválido" },
                { status: 400 }
            );
        }

        const subtotal = kilos * original.precioKg;
        precioFinal += subtotal;

        cierreItems.push({
            productoId: original.productoId,
            nombre: original.nombre,
            kilosReales: kilos,
            precioKg: original.precioKg,
            subtotal,
        });
    }

    pedido.cierre = {
        items: cierreItems,
        precioFinal,
        fechaEntrega: new Date(),
    };

    pedido.estado = "ENTREGADO";
    await pedido.save();

    // 📲 Notificar WhatsApp (no romper si falla)
    try {
        await fetch(process.env.BOT_NOTIFY_URL!, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                telefono: pedido.telefono,
                mensaje:
                    `🥩 *Pedido entregado*\n\n` +
                    cierreItems
                        .map(
                            (i: any) =>
                                `• ${i.nombre}: ${i.kilosReales} kg × $${i.precioKg} = $${i.subtotal}`
                        )
                        .join("\n") +
                    `\n\n💰 *Total: $${precioFinal}*\n\n` +
                    `¡Gracias por tu compra!`,
            }),
        });
    } catch (e) {
        console.error("⚠️ Error notificando WhatsApp:", e);
    }

    return NextResponse.json({
        ok: true,
        pedido,
    });
}