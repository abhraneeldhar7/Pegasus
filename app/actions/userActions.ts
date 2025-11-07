'use server';

import { db } from '@/lib/db';
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


