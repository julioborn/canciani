import mongoose, { Schema, Model, Types } from "mongoose";

export interface IUser {
    _id: Types.ObjectId;   // 👈 CLAVE
    username: string;
    password: string;
    role: "admin" | "superadmin";
    active: boolean;
}

const UserSchema = new Schema<IUser>(
    {
        username: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: {
            type: String,
            enum: ["admin", "superadmin"],
            default: "admin",
        },
        active: { type: Boolean, default: true },
    },
    { timestamps: true }
);

const User: Model<IUser> =
    mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
