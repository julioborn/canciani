import connectMongoDB from "@/lib/mongodb";
import PedidoRetiro from "@/models/PedidoRetiro";
import { NextResponse } from "next/server";

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    await connectMongoDB();
    await PedidoRetiro.findByIdAndDelete(params.id);
    return NextResponse.json({ ok: true });
}
