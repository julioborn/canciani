import mongoose, { Schema, Model } from "mongoose";

const StockSchema = new Schema({
    producto: String,
    precio: Number,
    disponible: Number,
});

const Stock: Model<any> =
    mongoose.models.Stock ||
    mongoose.model("Stock", StockSchema);

export default Stock;
