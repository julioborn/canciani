import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Pedido from "@/models/Pedido";

// ✅ GET: obtener pedido
export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    await connectMongoDB();

    const pedido = await Pedido.findById(params.id);

    if (!pedido) {
        return NextResponse.json(
            { error: "Pedido no encontrado" },
            { status: 404 }
        );
    }

    return NextResponse.json({ pedido });
}

// ❌ PATCH: cancelar pedido (esto ya lo tenías)
export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    await connectMongoDB();

    const { estado } = await req.json();

    if (estado !== "CANCELADO") {
        return NextResponse.json(
            { error: "Estado inválido" },
            { status: 400 }
        );
    }

    const pedido = await Pedido.findByIdAndUpdate(
        params.id,
        { estado: "CANCELADO" },
        { new: true }
    );

    if (!pedido) {
        return NextResponse.json(
            { error: "Pedido no encontrado" },
            { status: 404 }
        );
    }

    return NextResponse.json({ ok: true });
}

export async function DELETE(
    _req: Request,
    { params }: { params: { id: string } }
) {
    await connectMongoDB();

    const pedido = await Pedido.findByIdAndDelete(params.id);

    if (!pedido) {
        return NextResponse.json(
            { error: "Pedido no encontrado" },
            { status: 404 }
        );
    }

    return NextResponse.json({ ok: true });
}