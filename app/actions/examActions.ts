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

export async function getExamManagerTableData() {
    try {
        const [rows] = await db.query(`
      SELECT 
        e.exam_id,
        e.title AS exam_name,
        d.name AS department_name,
        e.total_marks,
        e.start_time,
        e.end_time,
        COUNT(se.student_exam_id) AS total_students_enrolled
      FROM exam e
      JOIN department d ON e.department_id = d.department_id
      LEFT JOIN student_exam se ON e.exam_id = se.exam_id
      GROUP BY 
        e.exam_id, e.title, d.name, e.total_marks, e.start_time, e.end_time
      ORDER BY e.start_time;
    `);

        return rows;
    } catch (error) {
        console.error("Error fetching all exam summaries:", error);
        throw new Error("Failed to fetch exam summaries");
    }
}



export async function createExam(formData: {
    department_id: number
    title: string
    description: string
    start_time: Date
    end_time: Date
}) {
    try {
        const [result] = await db.execute(
            `
      INSERT INTO exam (department_id, title, description, total_marks, start_time, end_time, duration_minutes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
            [
                formData.department_id,
                formData.title,
                formData.description,
                0,
                formData.start_time,
                formData.end_time,
                0,
            ]
        );

        return {
            success: true,
            exam_id: (result as any).insertId,
            message: "Exam created successfully",
        };
    } catch (error: any) {
        console.error("Error creating exam:", error);
        return {
            success: false,
            message: "Failed to create exam",
            error: error.message,
        };
    }
}


export async function deleteExam(exam_id: number) {
  try {
  
    const [result] = await db.execute("DELETE FROM exam WHERE exam_id = ?", [exam_id])

    return {
      success: true,
      message: "Exam deleted successfully",
      affectedRows: (result as any).affectedRows,
    }
  } catch (error: any) {
    console.error("Error deleting exam:", error)
    return {
      success: false,
      message: "Failed to delete exam",
      error: error.message,
    }
  }
}





// 🔹 Get exam and questions
export async function getExamWithQuestions(examId: number) {
  const [examRows]: any = await db.execute(
    "SELECT * FROM exam WHERE exam_id = ?",
    [examId]
  )
  const [questionRows]: any = await db.execute(
    "SELECT * FROM question WHERE exam_id = ?",
    [examId]
  )

  return {
    exam: examRows[0],
    questions: questionRows,
  }
}

// 🔹 Update exam details
export async function updateExamDetails(
  examId: number,
  data: {
    title: string
    description: string
    total_marks: number
    start_time: string
    end_time: string
    duration_minutes: number
  }
) {
  await db.execute(
    `UPDATE exam 
     SET title=?, description=?, total_marks=?, start_time=?, end_time=?, duration_minutes=? 
     WHERE exam_id=?`,
    [
      data.title,
      data.description,
      data.total_marks,
      data.start_time,
      data.end_time,
      data.duration_minutes,
      examId,
    ]
  )

  return { success: true, message: "Exam updated successfully" }
}

// 🔹 Add question
export async function addQuestion(
  examId: number,
  q: {
    question_text: string
    option_a: string
    option_b: string
    option_c: string
    option_d: string
    correct_option: string
  }
) {
  await db.execute(
    `INSERT INTO question (exam_id, question_text, option_a, option_b, option_c, option_d, correct_option)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [examId, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_option]
  )

  return { success: true, message: "Question added successfully" }
}

// 🔹 Update question
export async function updateQuestion(
  questionId: number,
  q: {
    question_text: string
    option_a: string
    option_b: string
    option_c: string
    option_d: string
    correct_option: string
  }
) {
  await db.execute(
    `UPDATE question 
     SET question_text=?, option_a=?, option_b=?, option_c=?, option_d=?, correct_option=? 
     WHERE quesion_id=?`,
    [q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_option, questionId]
  )

  return { success: true, message: "Question updated successfully" }
}

// 🔹 Delete question
export async function deleteQuestion(questionId: number) {
  await db.execute("DELETE FROM question WHERE quesion_id = ?", [questionId])
  return { success: true, message: "Question deleted" }
}
