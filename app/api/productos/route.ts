export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Producto from "@/models/Producto";

export async function GET() {
    await connectMongoDB();

    const productos = await Producto.find().sort({ nombre: 1 }).lean();

    return NextResponse.json(
        productos.map((p: any) => ({
            ...p,
            _id: p._id.toString(),
        }))
    );
}

export async function POST(req: Request) {
    await connectMongoDB();

    const body = await req.json();

    const nombre = String(body?.nombre || "").trim();
    const descripcion = String(body?.descripcion || "").trim();
    const precioKg = Number(body?.precioKg);
    const stock = Number(body?.stock);
    const requiereTurno = Boolean(body?.requiereTurno);
    const activo = body?.activo === undefined ? true : Boolean(body?.activo);

    if (!nombre) {
        return NextResponse.json({ error: "Falta nombre" }, { status: 400 });
    }
    if (!Number.isFinite(precioKg) || precioKg <= 0) {
        return NextResponse.json({ error: "precioKg inválido" }, { status: 400 });
    }
    if (!Number.isFinite(stock) || stock < 0) {
        return NextResponse.json({ error: "stock inválido" }, { status: 400 });
    }

    try {
        const producto = await Producto.create({
            nombre,
            descripcion,
            precioKg,
            stock,
            requiereTurno,
            activo,
        });

        return NextResponse.json({
            ok: true,
            producto: { ...producto.toObject(), _id: producto._id.toString() },
        });
    } catch (e: any) {
        // si chocó el unique del nombre
        if (e?.code === 11000) {
            return NextResponse.json(
                { error: "Ya existe un producto con ese nombre" },
                { status: 409 }
            );
        }
        console.error(e);
        return NextResponse.json({ error: "Error creando producto" }, { status: 500 });
    }
}