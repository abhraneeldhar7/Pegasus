"use server"

import { db } from "@/lib/db";

export async function getExamCount(): Promise<number> {
    try {
        const [rows]: any = await db.query("SELECT COUNT(*) AS count FROM exam");
        return rows[0].count;
    } catch (error) {
        console.error("Error fetching exam count:", error);
        throw new Error("Failed to get exam count");
    }
}