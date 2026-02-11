import mongoose, { Schema, Model, Types } from "mongoose";

export interface IProducto {
    _id: Types.ObjectId;
    nombre: string;
    nombrePlural?: string; // 👈 nuevo
    genero: "masculino" | "femenino"; // 👈 nuevo

    descripcion?: string;
    precioKg: number;
    stock: number;
    requiereTurno: boolean;
    activo: boolean;

    createdAt?: Date;
    updatedAt?: Date;
}

const ProductoSchema = new Schema<IProducto>(
    {
        nombre: { type: String, required: true, trim: true },
        nombrePlural: { type: String },
        genero: {
            type: String,
            enum: ["masculino", "femenino"],
            default: "masculino",
        },

        descripcion: { type: String, default: "" },
        precioKg: { type: Number, required: true, min: 0 },
        stock: { type: Number, required: true, min: 0 },

        requiereTurno: { type: Boolean, default: false },
        activo: { type: Boolean, default: true },
    },
    { timestamps: true }
);

// 👇 útil para evitar duplicados si querés
ProductoSchema.index({ nombre: 1 }, { unique: true });

const Producto: Model<IProducto> =
    mongoose.models.Producto || mongoose.model<IProducto>("Producto", ProductoSchema);

export default Producto;