import mongoose, { Schema, Model } from "mongoose";

export interface IHora {
    hora: string;
    activa: boolean;
}

export interface IHorario {
    dia: number;
    nombre: string;
    horas: IHora[];
    createdAt?: Date;
    updatedAt?: Date;
}

const HoraSchema = new Schema<IHora>({
    hora: { type: String, required: true },
    activa: { type: Boolean, default: true },
});

const HorarioSchema = new Schema<IHorario>(
    {
        dia: { type: Number, required: true },
        nombre: { type: String, required: true },
        horas: [HoraSchema],
    },
    { timestamps: true }
);

const Horario: Model<IHorario> =
    mongoose.models.Horario ||
    mongoose.model<IHorario>("Horario", HorarioSchema);

export default Horario;