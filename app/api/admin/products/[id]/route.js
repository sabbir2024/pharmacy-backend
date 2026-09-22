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

        // ✅ Soft delete with timestamp
        const deleted = await Medicine.findByIdAndUpdate(
            id,
            {
                deleted: true,
                deletedAt: new Date(),
                updatedAt: new Date(),
            },
            { new: true }
        );

        if (!deleted) {
            return NextResponse.json(
                { success: false, error: "Product পাওয়া যায়নি" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Product deleted",
            deletedAt: deleted.deletedAt,
        });
    } catch (err) {
        return NextResponse.json(
            { success: false, error: err.message },
            { status: 500 }
        );
    }
}