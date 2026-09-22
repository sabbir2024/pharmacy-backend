import mongoose from "mongoose";

const CustomerSchema = new mongoose.Schema(
    {
        localId: { type: Number, index: true },
        deviceId: { type: String, index: true, default: "default" },
        name: { type: String, required: true },
        phone: { type: String, default: "" },
        address: { type: String, default: "" },
        totalDue: { type: Number, default: 0 },

        // Sync tracking
        updatedAt: { type: Date, default: Date.now, index: true },
        deleted: { type: Boolean, default: false, index: true },
        deletedAt: { type: Date, default: null },
        lastModifiedBy: { type: String, default: "unknown" },
    },
    { timestamps: true }
);

CustomerSchema.index({ localId: 1, deviceId: 1 });
CustomerSchema.index({ updatedAt: -1 });
CustomerSchema.index({ deleted: 1, updatedAt: -1 });

export default mongoose.models.Customer ||
    mongoose.model("Customer", CustomerSchema);