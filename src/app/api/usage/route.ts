import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectDB from "@/lib/db-connect";
import { ICodeInfo } from "@/types/global.types";
import User from "@/models/user";
import CodeInfo from "@/models/code-info";

export async function GET(req: NextRequest) {
    const cookieStore = await cookies();
    const authCode = cookieStore.get("authCode")?.value || "";

    console.log("Auth Code from Cookies:", authCode);
    console.log("Expected Auth Code:", process.env.AUTH_CODE);

    // Check if auth code matches
    if (authCode !== process.env.AUTH_CODE) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    try {
        await connectDB();

        const data = await CodeInfo.find().populate("userId").select("-code");

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

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const {userData, codeInfo} = await req.json();

        if (!userData || !codeInfo) {
            return NextResponse.json({ 
                success: false, 
                message: "Missing required fields" 
            }, { status: 400 });
        }

        let user = await User.findOne({ ip: userData.ip });
        if(!user) {
            user = await new User(userData).save();
        }
        const newCodeInfo: ICodeInfo = await new CodeInfo({
            ...codeInfo,
            userId: user._id,
        }).save();

        if (newCodeInfo) {
            return NextResponse.json({ status: 200, message: "Successfully saved" });
        } else {
            return NextResponse.json({ status: 500, message: "Data not saved" });
        }
    } catch (error) {
        return NextResponse.json({ status: 500, message: error });
    }
}