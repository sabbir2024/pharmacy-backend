import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireActiveUser } from "@/lib/auth";
import Medicine from "@/lib/models/Medicine";
import Sale from "@/lib/models/Sale";
import Customer from "@/lib/models/Customer";

export async function POST(req) {
    try {
        const auth = requireActiveUser(req);
        if (auth.error) {
            return NextResponse.json(
                {
                    success: false,
                    error: auth.error,
                    userStatus: auth.userStatus,
                },
                { status: auth.status }
            );
        }

        await connectDB();

        const body = await req.json();
        const {
            medicines = [],
            sales = [],
            customers = [],
            deviceId = "unknown",
        } = body;

        const serverTime = new Date();

        const results = {
            medicines: { updated: 0, skipped: 0 },
            sales: { updated: 0, skipped: 0 },
            customers: { updated: 0, skipped: 0 },
        };

        // Helper: Conflict Resolution
        async function upsertRecord(Model, data, tableName) {
            if (!data.id) return;

            const existing = await Model.findOne({
                localId: data.id,
                deviceId: data.deviceId || "default",
            });

            // Server newer → skip client
            if (existing && existing.updatedAt && data.updatedAt) {
                const clientTime = new Date(data.updatedAt).getTime();
                const serverTimeExisting = new Date(existing.updatedAt).getTime();

                if (serverTimeExisting > clientTime) {
                    results[tableName].skipped++;
                    return;
                }
            }

            // Prepare fields (SQLite snake_case → Mongo camelCase)
            const prepared = {
                localId: data.id,
                deviceId: data.deviceId || "default",
                updatedAt: data.updatedAt ? new Date(data.updatedAt) : serverTime,
                deleted: data.deleted === 1 || data.deleted === true,
                deletedAt: data.deletedAt ? new Date(data.deletedAt) : null,
                lastModifiedBy: deviceId,
            };

            // Table-specific fields
            if (tableName === "medicines") {
                Object.assign(prepared, {
                    name: data.name,
                    company: data.company || "",
                    price: Number(data.price) || 0,
                    stock: Number(data.stock) || 0,
                    unit: data.unit || "pcs",
                    costPrice: Number(data.cost_price ?? data.costPrice) || 0,
                    expiry: data.expiry || "",
                    barcode: data.barcode || "",
                    pcsPerUnit: Number(data.pcs_per_unit ?? data.pcsPerUnit) || 1,
                });
            } else if (tableName === "sales") {
                Object.assign(prepared, {
                    total: Number(data.total) || 0,
                    discount: Number(data.discount) || 0,
                    vat: Number(data.vat) || 0,
                    paid: Number(data.paid) || 0,
                    change: Number(data.change) || 0,
                    dueAmount: Number(data.due_amount ?? data.dueAmount) || 0,
                    isDue: Number(data.is_due ?? data.isDue) || 0,
                    paymentMethod: data.payment_method ?? data.paymentMethod ?? "cash",
                    customerId: data.customer_id ?? data.customerId ?? null,
                    customerName: data.customerName ?? null,
                    items: data.items || [],
                });
            } else if (tableName === "customers") {
                Object.assign(prepared, {
                    name: data.name,
                    phone: data.phone || "",
                    address: data.address || "",
                    totalDue: Number(data.total_due ?? data.totalDue) || 0,
                });
            }

            await Model.findOneAndUpdate(
                {
                    localId: data.id,
                    deviceId: data.deviceId || "default",
                },
                prepared,
                { upsert: true, new: true }
            );

            results[tableName].updated++;
        }

        // Process all records
        for (const m of medicines) {
            await upsertRecord(Medicine, m, "medicines");
        }

        for (const s of sales) {
            await upsertRecord(Sale, s, "sales");
        }

        for (const c of customers) {
            await upsertRecord(Customer, c, "customers");
        }

        return NextResponse.json({
            success: true,
            serverTime: serverTime.toISOString(),
            results,
        });
    } catch (err) {
        console.error("Push error:", err);
        return NextResponse.json(
            { success: false, error: err.message },
            { status: 500 }
        );
    }
}