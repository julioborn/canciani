import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import PedidosTable from "./components/PedidosTable";

export default async function PedidosPage() {
    const session = await getServerSession(authOptions);

    return (
        <div className="p-6">
            <PedidosTable />
        </div>
    );
}
