import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db-connect";
import CodeInfo from "@/models/code-info";

export async function GET(req: NextRequest) {
    const id = req.nextUrl.searchParams.get("id");
    
    try {
        await connectDB();

        const data = await CodeInfo.findById(id).select("code");

        if (!data) {
            return NextResponse.json({
                success: false,
                message: "No data found"
            }, { status: 404 });
        }

        return NextResponse.json({ 
            success: true, 
            data: data,
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ 
            success: false, 
            message: "Internal server error",
            error: process.env.NODE_ENV === 'development' ? error : undefined
        }, { status: 500 });
    }
}