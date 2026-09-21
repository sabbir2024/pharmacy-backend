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
        updatedAt: { type: Date, default: Date.now },
        deleted: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export default mongoose.models.Sale || mongoose.model("Sale", SaleSchema);