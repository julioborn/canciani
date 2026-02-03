import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Horario from "@/models/Horario";

export async function GET() {
    await connectMongoDB();
    const horarios = await Horario.find().sort({ dia: 1 }).lean();
    return NextResponse.json(horarios);
}
