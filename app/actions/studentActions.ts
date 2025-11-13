"use server"

import { db } from "@/lib/db";
import { departmentType, studentType } from "@/lib/types";
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

        // Hash passwords in parallel
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

        // Construct SQL dynamically to avoid `VALUES ?` issues with ON DUPLICATE
        const placeholders = studentData
            .map(() => "(?, ?, ?, ?, ?)")
            .join(", ");
        const flatValues = studentData.flat();

        const sql = `
      INSERT INTO student (student_id, name, email, department_id, password_hash)
      VALUES ${placeholders}
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        email = VALUES(email),
        department_id = VALUES(department_id),
        password_hash = VALUES(password_hash)
    `;

        const [result]: any = await db.query(sql, flatValues);

        console.log("✅ Insert complete:", result);

        return {
            success: true,
            affectedRows: result.affectedRows,
            changedRows: result.changedRows,
        };
    } catch (error) {
        console.error("❌ Error inserting students:", error);
        throw new Error("Failed to insert students");
    }
}

export async function getStudentDepartment(studentId: number) {
    try {
        const [rows] = await db.execute(
            `
      SELECT 
        d.department_id,
        d.name AS name,
        d.code AS code
      FROM student s
      INNER JOIN department d ON s.department_id = d.department_id
      WHERE s.student_id = ?;
      `,
            [studentId]
        );

        // rows will be an array of RowDataPackets
        const departments = rows as {
            department_id: number;
            name: string;
            code: string;
        }[];

        if (departments.length === 0) {
            return { error: "Student or department not found" };
        }

        return departments[0];
    } catch (error) {
        console.error("Error fetching student department:", error);
        return { error: "Database error" };
    }
}

export async function getDepartmentStudents(deptId: number) {
    const [rows] = await db.query(
        `SELECT student_id, name, email 
     FROM student 
     WHERE department_id = ?`,
        [deptId]
    );

    return rows;
};


export async function saveStudentAnswer(
    student_id: number,
    question_id: number,
    selected_option: string
) {
    try {
        // Get the correct answer for this question
        const [correctRows]: any = await db.query(
            `SELECT correct_option FROM question WHERE question_id = ?`,
            [question_id]
        );

        if (!correctRows.length) {
            throw new Error("Question not found");
        }

        const correct_option = correctRows[0].correct_option;
        const is_correct = correct_option === selected_option;

        // Insert or update student answer
        const [result]: any = await db.query(
            `
      INSERT INTO student_answer (student_id, question_id, selected_option, is_correct)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        selected_option = VALUES(selected_option),
        is_correct = VALUES(is_correct)
      `,
            [student_id, question_id, selected_option, is_correct]
        );

        // Get the answer_id of the inserted/updated record
        const [rows]: any = await db.query(
            `SELECT answer_id FROM student_answer WHERE student_id = ? AND question_id = ?`,
            [student_id, question_id]
        );

        return {
            success: true,
            answer_id: rows[0].answer_id,
        };
    } catch (error: any) {
        console.error("Error saving student answer:", error);
        return { success: false, message: error.message };
    }
}


export async function getStudentAnswers(studentId: number, examId: number) {
    try {
        const query = `
      SELECT 
        sa.answer_id, 
        sa.question_id, 
        sa.selected_option
      FROM student_answer sa
      JOIN question q ON sa.question_id = q.question_id
      WHERE sa.student_id = ? AND q.exam_id = ?
    `;

        const [rows]: any = await db.query(query, [studentId, examId]);

        return {
            success: true,
            answers: rows,
        };
    } catch (error: any) {
        console.error("Error fetching student answers:", error);
        return { success: false, message: error.message };
    }
}