import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
    {
        email: { type: String, required: true, unique: true, index: true },
        password: { type: String, required: true },
        name: { type: String, default: "" },
        shopName: { type: String, default: "" },
        address: { type: String, default: "" },
        phone: { type: String, default: "" },
        businessType: {
            type: String,
            enum: ["pharmacy", "cosmetics", "grocery", "clothing", "general"],
            default: "pharmacy",
        },

        // Permission system
        role: {
            type: String,
            enum: ["admin", "user"],
            default: "user",
        },
        status: {
            type: String,
            enum: ["pending", "active", "rejected", "blocked"],
            default: "pending",
            index: true,
        },

        // Tracking
        approvedBy: { type: String, default: null },
        approvedAt: { type: Date, default: null },
        rejectedReason: { type: String, default: "" },
        lastLoginAt: { type: Date, default: null },
        deviceInfo: { type: String, default: "" },
    },
    { timestamps: true }
);

export default mongoose.models.User ||
    mongoose.model("User", UserSchema);