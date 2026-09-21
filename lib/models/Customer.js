import mongoose from "mongoose";

const CustomerSchema = new mongoose.Schema(
    {
        localId: { type: Number, index: true },
        deviceId: { type: String, index: true, default: "default" },
        name: { type: String, required: true },
        phone: { type: String, default: "" },
        address: { type: String, default: "" },
        totalDue: { type: Number, default: 0 },
        updatedAt: { type: Date, default: Date.now },
        deleted: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export default mongoose.models.Customer ||
    mongoose.model("Customer", CustomerSchema);