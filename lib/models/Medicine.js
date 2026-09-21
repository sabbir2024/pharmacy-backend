import mongoose from "mongoose";

const MedicineSchema = new mongoose.Schema(
    {
        localId: { type: Number, index: true },
        deviceId: { type: String, index: true, default: "default" },
        name: { type: String, required: true },
        company: { type: String, default: "" },
        price: { type: Number, default: 0 },
        stock: { type: Number, default: 0 },
        unit: { type: String, default: "pcs" },
        costPrice: { type: Number, default: 0 },
        expiry: { type: String, default: "" },
        barcode: { type: String, default: "" },
        pcsPerUnit: { type: Number, default: 1 },
        updatedAt: { type: Date, default: Date.now },
        deleted: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export default mongoose.models.Medicine ||
    mongoose.model("Medicine", MedicineSchema);