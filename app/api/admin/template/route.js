import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

export async function GET(req) {
    try {
        const auth = requireAdmin(req);
        if (auth.error) {
            return NextResponse.json(
                { success: false, error: auth.error },
                { status: auth.status }
            );
        }

        const csv = `name,company,price,stock,unit,pcs_per_unit,cost_price,expiry,barcode
Napa Extra,Beximco,1200,150,box,100,1100,2026-11-20,8801234567890
Seclo 20,Square,7,50,pcs,1,5,2025-06-30,8809876543210`;

        return new NextResponse(csv, {
            status: 200,
            headers: {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition":
                    'attachment; filename="product_template.csv"',
            },
        });
    } catch (err) {
        return NextResponse.json(
            { success: false, error: err.message },
            { status: 500 }
        );
    }
}