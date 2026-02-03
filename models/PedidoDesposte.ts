import mongoose, { Schema, Model } from "mongoose";

const PedidoDesposteSchema = new Schema(
    {
        telefono: String,

        producto: String,
        cantidad: Number,

        fecha: String,
        hora: String,

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

const PedidoDesposte: Model<any> =
    mongoose.models.PedidoDesposte ||
    mongoose.model("PedidoDesposte", PedidoDesposteSchema);

export default PedidoDesposte;
