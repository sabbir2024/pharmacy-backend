import { NextResponse } from "next/server";

export async function GET() {
  try {
    const csv = `name,company,price,stock,unit,pcs_per_unit,cost_price,expiry,barcode
Napa Extra,Beximco,1200,150,box,100,1100,2026-11-20,8801234567890
Seclo 20,Square,7,50,pcs,1,5,2025-06-30,8809876543210
Ace,Square,5,100,pcs,1,3,2026-05-15,8801111111111
Napa,Beximco,10,200,pcs,1,7,2026-12-31,8802222222222`;

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
