import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
    try {
        const authCode = req.headers.get("authCode");

        if (authCode !== process.env.AUTH_CODE) {
            return NextResponse.json({ success: false, message: "Invalid auth code" }, { status: 401 });
        }

        const cookieStore = await cookies();
        cookieStore.set("authCode", authCode, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 60 * 60 * 24 * 28,
            path: "/",
        });

        return NextResponse.json({ success: true, message: "Authentication successful" });
    } catch (error) {
        console.error("Error in login route:", error);
        return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
    }
}