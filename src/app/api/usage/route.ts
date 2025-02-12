import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db-connect";
import { ICodeInfo } from "@/types/global.types";
import User from "@/models/user";
import CodeInfo from "@/models/code-info";

export async function GET() {
    try {
        await connectDB();

        const userData = await User.find().lean();
        
        if (!userData || userData.length === 0) {
            return NextResponse.json({ 
                success: false, 
                message: "No users found" 
            }, { status: 404 });
        }

        const data = await Promise.all(
            userData.map(async (user) => {
                return await CodeInfo.find({ userId: user._id })
                    .sort({ createdAt: -1 })
                    .lean();
            })
        );

        const flattenedData = data.filter(item => item.length > 0);

        return NextResponse.json({ 
            success: true, 
            data: flattenedData 
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