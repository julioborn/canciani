export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Producto from "@/models/Producto";

export async function GET() {
    await connectMongoDB();

    const productos = await Producto.find({ activo: true, stock: { $gt: 0 } })
        .sort({ requiereTurno: -1, nombre: 1 })
        .lean();

    return NextResponse.json(
        productos.map((p: any) => ({
            _id: p._id.toString(),
            nombre: p.nombre,
            descripcion: p.descripcion || "",
            precioKg: p.precioKg,
            stock: p.stock,
            requiereTurno: p.requiereTurno,
        }))
    );
}