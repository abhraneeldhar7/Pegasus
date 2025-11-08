import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
var jwt = require('jsonwebtoken');

export async function proxy(req: NextRequest) {
    const accessToken = req.cookies.get("accessToken")?.value;
    const pathname = req.nextUrl.pathname;


    const refreshToken = req.cookies.get("refreshToken")?.value;
    if (refreshToken) {
        try {
            const decodedRefreshToken = jwt.verify(refreshToken, process.env.REFRESH_SECRET!);

            const newAccessToken = jwt.sign({
                id: decodedRefreshToken.id,
                role: decodedRefreshToken.role,
                email: decodedRefreshToken.email
            }, process.env.JWT_SECRET, { expiresIn: "15m" })

            const res = NextResponse.next();
            res.cookies.set("accessToken", newAccessToken, {
                httpOnly: true,
                sameSite: "strict",
                maxAge: 15 * 60,
                path: "/",
            });

            return res;
        }
        catch (e: any) {
            console.warn(e);
            const res = NextResponse.next();
            res.cookies.delete("accessToken");
            res.cookies.delete("refreshToken");
            return res;
        }

    }


    if (pathname.includes("/admin/")) {
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


}