import Image from "next/image";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);
    const role = session?.user.role;

    return (
        <div className="min-h-screen bg-white flex flex-col items-center px-6 py-10">
            {/* Logo */}
            <div className="mb-8">
                <Image
                    src="/canciani.jpg"
                    alt="Canciani Carnes"
                    width={180}
                    height={180}
                    className="rounded-2xl"
                />
            </div>

            {/* Accesos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-xl">
                <DashboardCard
                    title="Pedidos"
                    description="Gestionar pedidos de clientes"
                    href="/pedidos"
                />

                <DashboardCard
                    title="Stock"
                    description="Actualizar precios y cantidades"
                    href="/stock"
                />

                <DashboardCard
                    title="Horarios"
                    description="Configurar días y horas disponibles"
                    href="/horarios"
                />

                {role === "superadmin" && (
                    <DashboardCard
                        title="Finanzas"
                        description="Ver balances y estadísticas"
                        href="/finanzas"
                        highlight
                    />
                )}
            </div>
        </div>
    );
}

function DashboardCard({
    title,
    description,
    href,
    highlight = false,
}: {
    title: string;
    description: string;
    href: string;
    highlight?: boolean;
}) {
    return (
        <Link href={href}>
            <div
                className={`rounded-2xl border p-6 transition-all cursor-pointer
                hover:shadow-md hover:-translate-y-0.5
                ${highlight
                        ? "border-[#CC0000]"
                        : "border-gray-200"
                    }`}
            >
                <h2
                    className={`text-xl font-semibold ${highlight ? "text-[#CC0000]" : "text-black"
                        }`}
                >
                    {title}
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                    {description}
                </p>
            </div>
        </Link>
    );
}
