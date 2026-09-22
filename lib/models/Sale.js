import mongoose from "mongoose";

const SaleItemSchema = new mongoose.Schema({
    medicineId: Number,
    name: String,
    price: Number,
    qty: Number,
    subtotal: Number,
});

const SaleSchema = new mongoose.Schema(
    {
        localId: { type: Number, index: true },
        deviceId: { type: String, index: true, default: "default" },
        total: { type: Number, default: 0 },
        discount: { type: Number, default: 0 },
        vat: { type: Number, default: 0 },
        paid: { type: Number, default: 0 },
        change: { type: Number, default: 0 },
        dueAmount: { type: Number, default: 0 },
        isDue: { type: Number, default: 0 },
        paymentMethod: { type: String, default: "cash" },
        customerId: { type: Number, default: null },
        customerName: { type: String, default: null },
        items: [SaleItemSchema],

        // Sync tracking
        updatedAt: { type: Date, default: Date.now, index: true },
        deleted: { type: Boolean, default: false, index: true },
        deletedAt: { type: Date, default: null },
        lastModifiedBy: { type: String, default: "unknown" },
    },
    { timestamps: true }
);

SaleSchema.index({ localId: 1, deviceId: 1 });
SaleSchema.index({ updatedAt: -1 });
SaleSchema.index({ deleted: 1, updatedAt: -1 });

export default mongoose.models.Sale || mongoose.model("Sale", SaleSchema);