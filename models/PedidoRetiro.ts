import mongoose, { Schema, Model } from "mongoose";

const PedidoRetiroSchema = new Schema(
    {
        telefono: String,

        producto: String,
        cantidad: Number,

        fecha: String,

        precioUnitario: Number,
        precioTotal: Number,

        nombreCliente: {
            type: String,
            required: true,
        },

        retira: {
            nombre: {
                type: String,
            },
        },

        estado: {
            type: String,
            enum: ["RESERVADO", "ENTREGADO"],
            default: "RESERVADO",
        },

        cierre: {
            kilosReales: Number,
            precioFinal: Number,
            fechaEntrega: Date,
        },
    },
    { timestamps: true }
);

const PedidoRetiro: Model<any> =
    mongoose.models.PedidoRetiro ||
    mongoose.model("PedidoRetiro", PedidoRetiroSchema);

export default PedidoRetiro;
