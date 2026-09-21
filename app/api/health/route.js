import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";

export async function GET() {
    try {
        await connectDB();
        return NextResponse.json({
            success: true,
            message: "Pharmacy POS API running",
            time: new Date().toISOString(),
        });
    } catch (err) {
        return NextResponse.json(
            { success: false, error: err.message },
            { status: 500 }
        );
    }
}