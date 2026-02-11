export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Producto from "@/models/Producto";

export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    await connectMongoDB();

    const body = await req.json();

    const update: any = {};

    if (body?.nombre !== undefined) update.nombre = String(body.nombre).trim();
    if (body?.descripcion !== undefined) update.descripcion = String(body.descripcion).trim();
    if (body?.precioKg !== undefined) update.precioKg = Number(body.precioKg);
    if (body?.stock !== undefined) update.stock = Number(body.stock);
    if (body?.requiereTurno !== undefined) update.requiereTurno = Boolean(body.requiereTurno);
    if (body?.activo !== undefined) update.activo = Boolean(body.activo);

    if (update.precioKg !== undefined && (!Number.isFinite(update.precioKg) || update.precioKg <= 0)) {
        return NextResponse.json({ error: "precioKg inválido" }, { status: 400 });
    }
    if (update.stock !== undefined && (!Number.isFinite(update.stock) || update.stock < 0)) {
        return NextResponse.json({ error: "stock inválido" }, { status: 400 });
    }

    try {
        const producto = await Producto.findByIdAndUpdate(params.id, update, { new: true });
        if (!producto) {
            return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
        }
        return NextResponse.json({
            ok: true,
            producto: { ...producto.toObject(), _id: producto._id.toString() },
        });
    } catch (e: any) {
        if (e?.code === 11000) {
            return NextResponse.json(
                { error: "Ya existe un producto con ese nombre" },
                { status: 409 }
            );
        }
        console.error(e);
        return NextResponse.json({ error: "Error actualizando producto" }, { status: 500 });
    }
}