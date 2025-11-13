'use server';

import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
var jwt = require('jsonwebtoken');


export async function getCurrentUser() {
    const accessToken = (await cookies()).get('accessToken')?.value;
    if (!accessToken) return null;

    let token = null;
    try {
        token = jwt.verify(accessToken, process.env.JWT_SECRET!)
    }
    catch (e) {
        return null;
    }

    const { id, role } = token;

    try {
        if (role === 'admin') {
            const [rows] = await db.query(
                'SELECT admin_id AS id, name, email, "admin" AS role FROM admin WHERE admin_id = ?',
                [id]
            );
            return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
        } else if (role === 'student') {
            const [rows] = await db.query(
                'SELECT student_id AS id, name, email, department_id, "student" AS role FROM student WHERE student_id = ?',
                [id]
            );
            return Array.isArray(rows) && rows.length > 0 ? JSON.parse(JSON.stringify(rows[0])) : null;
        }
        return null;
    } catch (err) {
        console.error('Error fetching user:', err);
        return null;
    }
}


export async function getAdminCount(): Promise<number> {
    try {
        const [rows]: any = await db.query("SELECT COUNT(*) AS count FROM admin");
        return rows[0].count;
    } catch (error) {
        console.error("Error fetching admin count:", error);
        throw new Error("Failed to get admin count");
    }
}


export async function createAdmin() {
    try {
        const name = "Abhraneel Dhar";
        const email = "abhraneeldhar@gmail.com";
        const plainPassword = "helloworld";

        // Hash password securely
        const passwordHash = await bcrypt.hash(plainPassword, 10);

        const [result] = await db.execute(
            `INSERT INTO admin (name, email, password_hash) VALUES (?, ?, ?)`,
            [name, email, passwordHash]
        );

        console.log("✅ Admin created successfully:", result);
    } catch (err) {
        console.error("❌ Error creating admin:", err);
    }
}