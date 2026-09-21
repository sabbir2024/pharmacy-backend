import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth";
import Customer from "@/lib/models/Customer";

export async function PATCH(req, { params }) {
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
        const { id } = await params;

        const updated = await Customer.findByIdAndUpdate(
            id,
            { ...body, updatedAt: new Date() },
            { new: true }
        );

        if (!updated) {
            return NextResponse.json(
                { success: false, error: "Customer পাওয়া যায়নি" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, customer: updated });
    } catch (err) {
        return NextResponse.json(
            { success: false, error: err.message },
            { status: 500 }
        );
    }
}

export async function DELETE(req, { params }) {
    try {
        const auth = requireAdmin(req);
        if (auth.error) {
            return NextResponse.json(
                { success: false, error: auth.error },
                { status: auth.status }
            );
        }

        await connectDB();
        const { id } = await params;

        const deleted = await Customer.findByIdAndUpdate(
            id,
            { deleted: true, updatedAt: new Date() },
            { new: true }
        );

        if (!deleted) {
            return NextResponse.json(
                { success: false, error: "Customer পাওয়া যায়নি" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, message: "Deleted" });
    } catch (err) {
        return NextResponse.json(
            { success: false, error: err.message },
            { status: 500 }
        );
    }
}