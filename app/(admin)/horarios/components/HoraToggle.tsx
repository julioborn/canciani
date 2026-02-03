export default function HoraToggle({
    hora,
    activa,
    onClick,
}: {
    hora: string;
    activa: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={`px-3 py-1 rounded border text-sm ${activa
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
        >
            {hora}
        </button>
    );
}
