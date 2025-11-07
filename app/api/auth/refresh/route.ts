// /api/auth/refresh
var jwt = require('jsonwebtoken');
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const refreshToken = req.cookies.get("refreshToken")?.value;
    if (!refreshToken) return NextResponse.json({ error: "No refresh token" }, { status: 401 });

    try {
        const payload = jwt.verify(refreshToken, process.env.REFRESH_SECRET!);
        const newAccessToken = jwt.sign(
            { id: payload.id, role: payload.role, email: payload.email },
            process.env.JWT_SECRET!,
            { expiresIn: "15m" }
        );
        const res = NextResponse.json({ success: true });
        res.cookies.set("accessToken", newAccessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 15 * 60 * 1000,
        });
        return res;
    } catch {
        return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 });
    }
}
