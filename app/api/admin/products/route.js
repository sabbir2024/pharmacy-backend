import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth";
import Medicine from "@/lib/models/Medicine";

// LIST — সব ঔষধ
export async function GET(req) {
    try {
        const auth = requireAdmin(req);
        if (auth.error) {
            return NextResponse.json(
                { success: false, error: auth.error },
                { status: auth.status }
            );
        }

        await connectDB();

        const { searchParams } = new URL(req.url);
        const q = searchParams.get("q") || "";
        const low = searchParams.get("low") === "1";

        const filter = { deleted: { $ne: true } };

        if (q) {
            filter.$or = [
                { name: { $regex: q, $options: "i" } },
                { company: { $regex: q, $options: "i" } },
                { barcode: { $regex: q, $options: "i" } },
            ];
        }

        if (low) {
            filter.stock = { $lte: 10 };
        }

        const products = await Medicine.find(filter)
            .sort({ updatedAt: -1 })
            .limit(500)
            .lean();

        return NextResponse.json({ success: true, products });
    } catch (err) {
        return NextResponse.json(
            { success: false, error: err.message },
            { status: 500 }
        );
    }
}

// CREATE — নতুন ঔষধ
export async function POST(req) {
    try {
        const auth = requireAdmin(req);
        if (auth.error) {
            return NextResponse.json(
                { success: false, error: auth.error },
                { status: auth.status }
            );
        }

        await connectDB();
        const body = await req.json();

        const newProduct = await Medicine.create({
            name: body.name,
            company: body.company || "",
            price: Number(body.price) || 0,
            stock: Number(body.stock) || 0,
            unit: body.unit || "pcs",
            costPrice: Number(body.costPrice) || 0,
            expiry: body.expiry || "",
            barcode: body.barcode || "",
            pcsPerUnit: Number(body.pcsPerUnit) || 1,
            updatedAt: new Date(),
        });

        return NextResponse.json({ success: true, product: newProduct });
    } catch (err) {
        return NextResponse.json(
            { success: false, error: err.message },
            { status: 500 }
        );
    }
}

// BULK CREATE — একাধিক ঔষধ
export async function PUT(req) {
    try {
        const auth = requireAdmin(req);
        if (auth.error) {
            return NextResponse.json(
                { success: false, error: auth.error },
                { status: auth.status }
            );
        }

        await connectDB();
        const { products } = await req.json();

        if (!Array.isArray(products) || products.length === 0) {
            return NextResponse.json(
                { success: false, error: "products array দরকার" },
                { status: 400 }
            );
        }

        const prepared = products.map((p) => ({
            name: p.name,
            company: p.company || "",
            price: Number(p.price) || 0,
            stock: Number(p.stock) || 0,
            unit: p.unit || "pcs",
            costPrice: Number(p.costPrice) || 0,
            expiry: p.expiry || "",
            barcode: p.barcode || "",
            pcsPerUnit: Number(p.pcsPerUnit) || 1,
            updatedAt: new Date(),
        }));

        const result = await Medicine.insertMany(prepared, { ordered: false });

        return NextResponse.json({
            success: true,
            inserted: result.length,
        });
    } catch (err) {
        return NextResponse.json(
            { success: false, error: err.message },
            { status: 500 }
        );
    }
}