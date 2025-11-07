"use server"

import { db } from "@/lib/db";

export async function getStudentCount(departmentId?: number) {
    try {
        const query = departmentId
            ? "SELECT COUNT(*) AS count FROM student WHERE department_id = ?"
            : "SELECT COUNT(*) AS count FROM student";
        const [rows]: any = await db.query(query, departmentId ? [departmentId] : []);
        return rows[0].count as number;
    } catch (error) {
        console.error("Error counting students:", error);
        return 0;
    }
}

