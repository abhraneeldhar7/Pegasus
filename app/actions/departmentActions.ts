"use server"

import { db } from "@/lib/db";
import { departmentType } from "@/lib/types";

export async function getDepartments() {
    try {
        const [rows] = await db.query('SELECT * FROM department ORDER BY name ASC');
        return rows ? rows : [];
    } catch (error) {
        console.error('Error fetching departments:', error);
        throw new Error('Failed to fetch departments');
    }
}

export async function createDepartment(name: string, code: string) {
    if (!name || !code) throw new Error('Name and code are required');

    try {
        const [result]: any = await db.query(
            'INSERT INTO department (name, code) VALUES (?, ?)',
            [name, code]
        );

        return {
            department_id: result.department_id,
            name,
            code,
        };
    } catch (error: any) {
        if (error.code === 'ER_DUP_ENTRY') {
            return ({ message: "code_already_exists" })
        }
        console.error('Error creating department:', error);
        throw new Error('Failed to create department');
    }
}


export async function getDepartmentTableData() {
    try {
        const [rows] = await db.query(`
      SELECT 
        d.department_id,
        d.name AS name,
        d.code,
        h.name AS hod_name,
        h.email AS hod_email,
        COUNT(s.student_id) AS student_count
      FROM department d
      LEFT JOIN hod h ON h.department_id = d.department_id
      LEFT JOIN student s ON s.department_id = d.department_id
      GROUP BY d.department_id, d.name, d.code, h.name
      ORDER BY d.name ASC;
    `);

        return Array.isArray(rows) ? rows : [];
    } catch (error) {
        console.error('❌ Error fetching department table data:', error);
        throw new Error('Failed to fetch department table data');
    }
}