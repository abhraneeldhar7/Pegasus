import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
var jwt = require("jsonwebtoken");

export async function proxy(req: NextRequest) {
    const accessToken = req.cookies.get("accessToken")?.value;
    const refreshToken = req.cookies.get("refreshToken")?.value;
    const pathname = req.nextUrl.pathname;

    let res = NextResponse.next();
    let tokenToUse = accessToken;

    // ✅ Safe token verifier
    const verifyToken = (token: string | undefined, secret: string) => {
        if (!token) return null;
        try {
            return jwt.verify(token, secret);
        } catch (err: any) {
            if (err.name === "TokenExpiredError") return "expired";
            return null;
        }
    };

    // ✅ Step 1: Refresh logic
    if (refreshToken) {
        const decodedRefresh = verifyToken(refreshToken, process.env.REFRESH_SECRET!);

        if (decodedRefresh && decodedRefresh !== "expired") {
            const decodedAccess = verifyToken(accessToken, process.env.JWT_SECRET!);

            // Generate new access token if missing or expired
            if (!decodedAccess || decodedAccess === "expired") {
                const newAccessToken = jwt.sign(
                    {
                        id: decodedRefresh.id,
                        role: decodedRefresh.role,
                        email: decodedRefresh.email,
                    },
                    process.env.JWT_SECRET!,
                    { expiresIn: "15m" }
                );

                res.cookies.set("accessToken", newAccessToken, {
                    httpOnly: true,
                    sameSite: "strict",
                    secure: process.env.NODE_ENV === "production",
                    maxAge: 15 * 60,
                    path: "/",
                });

                tokenToUse = newAccessToken;
            }
        } else {
            console.warn("❌ Invalid or expired refresh token — logging out.");
            res.cookies.delete("accessToken");
            res.cookies.delete("refreshToken");
            return NextResponse.redirect(new URL("/login", req.url));
        }
    } else {
        // If no refresh token and route needs auth → kick to login
        if (pathname.startsWith("/admin") || pathname.startsWith("/student")) {
            return NextResponse.redirect(new URL("/login", req.url));
        }
    }

    // ✅ Step 2: Role-based authorization
    const decodedAccess = verifyToken(tokenToUse, process.env.JWT_SECRET!);

    if (pathname.startsWith("/admin")) {
        if (!decodedAccess || decodedAccess === "expired" || decodedAccess.role !== "admin") {
            return NextResponse.redirect(new URL("/login", req.url));
        }
    }

    if (pathname.startsWith("/student")) {
        if (
            !decodedAccess ||
            decodedAccess === "expired" ||
            (decodedAccess.role !== "student" && decodedAccess.role !== "admin")
        ) {
            return NextResponse.redirect(new URL("/login", req.url));
        }
    }

    // ✅ Step 3: Return final response
    return res;
}
