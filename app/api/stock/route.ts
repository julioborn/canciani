import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Stock from "@/models/Stock";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    await connectMongoDB();
    const stock = await Stock.findOne().lean();
    return NextResponse.json(stock);
}

export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin" && session.user.role !== "superadmin") {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { disponible, precio } = body;

    await connectMongoDB();

    const stock = await Stock.findOneAndUpdate(
        {},
        { disponible, precio },
        { new: true }
    );

    return NextResponse.json(stock);
}
