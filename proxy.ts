import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
var jwt = require('jsonwebtoken');

export async function proxy(req: NextRequest) {
    const accessToken = req.cookies.get("accessToken")?.value;
    const refreshToken = req.cookies.get("refreshToken")?.value;
    const pathname = req.nextUrl.pathname;


    if (!pathname.startsWith("/admin")) return NextResponse.next();

    if (pathname.includes("/admin")) {
        try {

            const decodedAccessToken = jwt.verify(accessToken!, process.env.JWT_SECRET!);
            if (decodedAccessToken.role != "admin") {
                return NextResponse.redirect(new URL("/login", req.url));
            }
        }
        catch (e) {
            return NextResponse.redirect(new URL("/login", req.url));
        }
    }

    try {
        jwt.verify(accessToken, process.env.JWT_SECRET!);
        return NextResponse.next();
    } catch (err: any) {
        if (err.name === "TokenExpiredError" && refreshToken) {
            try {
                const payload: any = jwt.verify(refreshToken, process.env.REFRESH_SECRET!);

                const newAccessToken = jwt.sign(
                    { id: payload.id, role: payload.role, email: payload.email },
                    process.env.JWT_SECRET!,
                    { expiresIn: "15m" }
                );

                const res = NextResponse.next();
                res.cookies.set("accessToken", newAccessToken, {
                    httpOnly: true,
                    sameSite: "strict",
                    maxAge: 15 * 60,
                    path: "/",
                });

                return res;
            } catch (refreshErr) {
                console.error("Refresh token invalid or expired:", refreshErr);
                return NextResponse.redirect(new URL("/login", req.url));
            }
        }
        return NextResponse.redirect(new URL("/login", req.url));
    }
}