import mongoose, { Schema, Model } from "mongoose";

export interface ClienteDoc {
    telefono: string;
    nombre: string;
    ultimoRetira?: string;
}

const ClienteSchema = new Schema<ClienteDoc>(
    {
        telefono: { type: String, required: true, unique: true },
        nombre: { type: String, required: true },
        ultimoRetira: { type: String },
    },
    { timestamps: true }
);

const Cliente: Model<ClienteDoc> =
    mongoose.models.Cliente ||
    mongoose.model<ClienteDoc>("Cliente", ClienteSchema);

export default Cliente;
