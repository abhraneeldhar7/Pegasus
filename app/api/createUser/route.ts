import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import mysql from "mysql2/promise";
import { getDB } from "@/lib/db";

export async function POST(req: NextRequest) {
    try {
        // 1️⃣ Parse the request body
        const body = await req.json();
        const { admin_id, name, email, password } = body;

        // 2️⃣ Validate required fields
        if (!admin_id || !name || !email) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 3️⃣ Hash the roll number as password
        const hashedPassword = await bcrypt.hash(String(password), 10);

        // 4️⃣ Cbonnect to MySQL
        const connection = getDB();

        // 5️⃣ Insert student
        const query = `
      INSERT INTO admin
      (admin_id, name, email, password_hash)
      VALUES (?, ?, ?, ?)
    `;

        await connection.execute(query, [
            admin_id,
            name,
            email,
            hashedPassword
        ]);

        await connection.end();

        // 6️⃣ Success response
        return NextResponse.json(
            { message: "✅ Student added successfully" },
            { status: 201 }
        );

    } catch (err: any) {
        console.error("Error adding student:", err);

        if (err.code === "ER_DUP_ENTRY") {
            return NextResponse.json(
                { error: "Student with this email or ID already exists" },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
