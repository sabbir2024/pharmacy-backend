import mongoose from "mongoose";

const CustomerSchema = new mongoose.Schema(
    {
        // ✅ userId
        userId: { type: String, index: true },

        localId: { type: Number, index: true },
        deviceId: { type: String, index: true, default: "default" },
        name: { type: String, required: true },
        phone: { type: String, default: "" },
        address: { type: String, default: "" },
        totalDue: { type: Number, default: 0 },
        openingBalance: { type: Number, default: 0 },
        openingNote: { type: String, default: "" },
        openingDate: { type: Date, default: null },

        updatedAt: { type: Date, default: Date.now, index: true },
        deleted: { type: Boolean, default: false, index: true },
        deletedAt: { type: Date, default: null },
        lastModifiedBy: { type: String, default: "unknown" },
    },
    { timestamps: true }
);

CustomerSchema.index({ userId: 1, localId: 1, deviceId: 1 });
CustomerSchema.index({ userId: 1, updatedAt: -1 });

export default mongoose.models.Customer ||
    mongoose.model("Customer", CustomerSchema);