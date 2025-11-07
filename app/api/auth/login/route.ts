"use server"
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

var jwt = require('jsonwebtoken');


const JWT_SECRET = process.env.JWT_SECRET!;
const REFRESH_SECRET = process.env.REFRESH_SECRET!;

export async function POST(req: NextRequest) {
    try {
        const { email, password, role } = await req.json();
    

        console.log(email, password, role)

        const table = role === "admin" ? "admin" : "student";
        const [rows]: any = await db.execute(`SELECT * FROM ${table} WHERE email = ?`, [email]);
        if (rows.length === 0) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const user = rows[0];
        console.log(user)
        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) return NextResponse.json({ error: "Invalid password" }, { status: 401 });


        const accessToken = jwt.sign(
            { id: user.admin_id || user.student_id, role, email },
            JWT_SECRET,
            { expiresIn: "15m" }
        );

        const refreshToken = jwt.sign(
            { id: user.admin_id || user.student_id, role, email },
            REFRESH_SECRET,
            { expiresIn: "7d" }
        );

        const deocodedAccessToken = jwt.verify(accessToken, process.env.JWT_SECRET!)
        const res = NextResponse.json({ success: true, deocodedAccessToken });

        res.cookies.set("accessToken", accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 15 * 60 * 1000,
        });

        res.cookies.set("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60,
        });
        return res;
    }
    catch (err) {
        console.error("Login error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}