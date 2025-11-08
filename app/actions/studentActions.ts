"use server"

import { db } from "@/lib/db";
import { studentType } from "@/lib/types";
import bcrypt from "bcryptjs";

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



export async function insertStudents(students: studentType[]) {
    try {
        if (!students || students.length === 0) {
            throw new Error("No students provided");
        }

        const studentData = await Promise.all(
            students.map(async (student) => {
                const hashedPassword = await bcrypt.hash(student.student_id.toString(), 10);
                return [
                    student.student_id,
                    student.name,
                    student.email,
                    student.department_id,
                    hashedPassword,
                ];
            })
        );

        const [result]: any = await db.query(
            `
      INSERT INTO student (student_id, name, email, department_id, password_hash)
      VALUES ?
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        email = VALUES(email),
        department_id = VALUES(department_id),
        password_hash = VALUES(password_hash)
      `,
            [studentData]
        );

        return {
            success: true,
            inserted: result.affectedRows,
        };
    } catch (error) {
        console.error("Error inserting students:", error);
        throw new Error("Failed to insert students");
    }
}