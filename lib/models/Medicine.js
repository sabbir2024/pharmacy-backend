import mongoose from "mongoose";

const MedicineSchema = new mongoose.Schema(
    {
        // ✅ userId যোগ করুন (সবচেয়ে উপরে)
        userId: { type: String, index: true },

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

        updatedAt: { type: Date, default: Date.now, index: true },
        deleted: { type: Boolean, default: false, index: true },
        deletedAt: { type: Date, default: null },
        lastModifiedBy: { type: String, default: "unknown" },
    },
    { timestamps: true }
);

// Compound index
MedicineSchema.index({ userId: 1, localId: 1, deviceId: 1 });
MedicineSchema.index({ userId: 1, updatedAt: -1 });
MedicineSchema.index({ userId: 1, deleted: 1, updatedAt: -1 });

export default mongoose.models.Medicine ||
    mongoose.model("Medicine", MedicineSchema);