import mongoose, { Schema, Model, Types } from "mongoose";

export type PedidoEstado = "RESERVADO" | "ENTREGADO" | "CANCELADO";
export type TipoPedido = "TURNO" | "RETIRO_DIA";

export interface IPedidoItem {
    productoId: Types.ObjectId;
    nombre: string;
    cantidad: number;        // unidades
    precioKg: number;        // snapshot
    requiereTurno: boolean;
}

export interface ICierreItem {
    productoId: Types.ObjectId;
    nombre: string;
    kilosReales: number;
    precioKg: number;
    subtotal: number;
}

export interface IPedido {
    telefono: string;
    nombreCliente: string;
    retira: { nombre: string };

    fecha: string;           // YYYY-MM-DD
    hora?: string;           // HH:mm solo si TURNO
    tipoPedido: TipoPedido;

    items: IPedidoItem[];

    estado: PedidoEstado;

    cierre?: {
        items: ICierreItem[];
        precioFinal: number;
        fechaEntrega: Date;
    };

    createdAt?: Date;
    updatedAt?: Date;
}

const PedidoItemSchema = new Schema<IPedidoItem>(
    {
        productoId: { type: Schema.Types.ObjectId, ref: "Producto", required: true },
        nombre: { type: String, required: true },
        cantidad: { type: Number, required: true, min: 1 },
        precioKg: { type: Number, required: true, min: 0 },
        requiereTurno: { type: Boolean, default: false },
    },
    { _id: false }
);

const CierreItemSchema = new Schema<ICierreItem>(
    {
        productoId: { type: Schema.Types.ObjectId, ref: "Producto", required: true },
        nombre: { type: String, required: true },
        kilosReales: { type: Number, required: true, min: 0 },
        precioKg: { type: Number, required: true, min: 0 },
        subtotal: { type: Number, required: true, min: 0 },
    },
    { _id: false }
);

const PedidoSchema = new Schema<IPedido>(
    {
        telefono: { type: String, required: true },
        nombreCliente: { type: String, required: true },
        retira: { nombre: { type: String, required: true } },

        fecha: { type: String, required: true },
        hora: { type: String },

        tipoPedido: { type: String, enum: ["TURNO", "RETIRO_DIA"], required: true },

        items: { type: [PedidoItemSchema], required: true },

        estado: {
            type: String,
            enum: ["RESERVADO", "ENTREGADO", "CANCELADO"],
            default: "RESERVADO",
        },

        cierre: {
            items: { type: [CierreItemSchema], default: undefined },
            precioFinal: { type: Number, default: undefined },
            fechaEntrega: { type: Date, default: undefined },
        },
    },
    { timestamps: true }
);

// 🔒 Un turno por fecha+hora SOLO para pedidos con TURNO
PedidoSchema.index(
    { fecha: 1, hora: 1 },
    { unique: true, partialFilterExpression: { tipoPedido: "TURNO" } }
);

const Pedido: Model<IPedido> =
    mongoose.models.Pedido || mongoose.model<IPedido>("Pedido", PedidoSchema);

export default Pedido;