import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Horario from "@/models/Horario";

export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    const { horas } = await req.json();

    await connectMongoDB();

    await Horario.findByIdAndUpdate(params.id, { horas });

    return NextResponse.json({ ok: true });
}
