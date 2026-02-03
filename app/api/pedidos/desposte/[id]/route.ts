import connectMongoDB from "@/lib/mongodb";
import PedidoDesposte from "@/models/PedidoDesposte";
import { NextResponse } from "next/server";

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    await connectMongoDB();
    await PedidoDesposte.findByIdAndDelete(params.id);
    return NextResponse.json({ ok: true });
}
