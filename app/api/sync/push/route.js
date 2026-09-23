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

        console.log(
            `📤 Push from ${deviceId}: med=${medicines.length}, sales=${sales.length}, cust=${customers.length}`
        );

        const serverTime = new Date();

        const results = {
            medicines: { updated: 0, skipped: 0 },
            sales: { updated: 0, skipped: 0 },
            customers: { updated: 0, skipped: 0 },
        };

        // ============================
        // Helper: Upsert with conflict resolution
        // ============================
        async function upsertRecord(Model, data, tableName) {
            if (!data.id) return;

            // ⚠️ SQLite এ id integer, Mongo তে localId
            const localId = Number(data.id);
            const device = data.device_id || data.deviceId || "default";

            const existing = await Model.findOne({
                localId,
                deviceId: device,
            });

            // ✅ Client newer হলে update
            const clientTime = data.updated_at || data.updatedAt;
            const clientMs = clientTime ? new Date(clientTime).getTime() : 0;

            if (existing && existing.updatedAt) {
                const serverMs = new Date(existing.updatedAt).getTime();

                // Server newer → skip
                if (serverMs > clientMs) {
                    console.log(
                        `   ⏭️ Skipped ${tableName} ${localId}: server newer`
                    );
                    results[tableName].skipped++;
                    return;
                }
            }

            // Prepare base
            const prepared = {
                localId,
                deviceId: device,
                updatedAt: clientTime ? new Date(clientTime) : serverTime,
                deleted: data.deleted === 1 || data.deleted === true,
                deletedAt: data.deleted_at
                    ? new Date(data.deleted_at)
                    : data.deletedAt
                        ? new Date(data.deletedAt)
                        : null,
                lastModifiedBy: device,
            };

            // Table-specific
            if (tableName === "medicines") {
                Object.assign(prepared, {
                    name: data.name || "",
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
                    paymentMethod:
                        data.payment_method || data.paymentMethod || "cash",
                    customerId: data.customer_id ?? data.customerId ?? null,
                    customerName: data.customerName ?? null,
                    items: data.items || [],
                });
            } else if (tableName === "customers") {
                Object.assign(prepared, {
                    name: data.name || "",
                    phone: data.phone || "",
                    address: data.address || "",
                    totalDue: Number(data.total_due ?? data.totalDue) || 0,
                });
            }

            await Model.findOneAndUpdate(
                { localId, deviceId: device },
                prepared,
                { upsert: true, new: true }
            );

            results[tableName].updated++;
        }

        // Process
        for (const m of medicines) {
            await upsertRecord(Medicine, m, "medicines");
        }

        for (const s of sales) {
            await upsertRecord(Sale, s, "sales");
        }

        for (const c of customers) {
            await upsertRecord(Customer, c, "customers");
        }

        console.log("✅ Push complete:", results);

        return NextResponse.json({
            success: true,
            serverTime: serverTime.toISOString(),
            results,
            synced: {
                medicines: results.medicines.updated,
                sales: results.sales.updated,
                customers: results.customers.updated,
            },
        });
    } catch (err) {
        console.error("❌ Push error:", err);
        return NextResponse.json(
            { success: false, error: err.message },
            { status: 500 }
        );
    }
}