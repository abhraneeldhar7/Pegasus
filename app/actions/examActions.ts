"use server"

import { db } from "@/lib/db";
import { examType, questionType } from "@/lib/types";

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
  department_id: number,
  title: string,
  description: string,
  subject: string
}) {
  try {
    const [result] = await db.execute(
      `
      INSERT INTO exam (department_id, title, description, subject, total_marks, start_time, end_time, duration_minutes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        formData.department_id,
        formData.title,
        formData.description,
        formData.subject,
        60,
        new Date,
        new Date,
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

export async function addQuestion(question: questionType) {
  try {
    const query = `
      INSERT INTO question (
        exam_id, question_text, option_a, option_b, option_c, option_d, correct_option
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `
    const values = [
      question.exam_id,
      question.question_text,
      question.option_a,
      question.option_b,
      question.option_c,
      question.option_d,
      question.correct_option,
    ]

    const [result] = await db.execute(query, values)

    return {
      success: true,
      insertedId: (result as any).question_id,
      message: "Question added successfully",
    }
  } catch (error: any) {
    console.error("Error adding question:", error)
    return { success: false, message: error.message }
  }
}

export async function saveQuestions(questions: questionType[]) {
  try {
    if (!questions || questions.length === 0) {
      return { success: false, message: "No questions to save." }
    }

    // separate new and existing questions
    const newQuestions = questions.filter((q) => !q.question_id)
    const existingQuestions = questions.filter((q) => q.question_id)

    // ✅ Insert new questions
    const insertedIds: number[] = []
    if (newQuestions.length > 0) {
      for (const q of newQuestions) {
        const [res] = await db.execute(
          `
          INSERT INTO question 
          (exam_id, question_text, option_a, option_b, option_c, option_d, correct_option)
          VALUES (?, ?, ?, ?, ?, ?, ?)
          `,
          [
            q.exam_id,
            q.question_text,
            q.option_a,
            q.option_b,
            q.option_c,
            q.option_d,
            q.correct_option,
          ]
        )
        insertedIds.push((res as any).insertId)
      }
    }

    // ✅ Update existing questions
    if (existingQuestions.length > 0) {
      for (const q of existingQuestions) {
        await db.execute(
          `
          UPDATE question
          SET question_text = ?, option_a = ?, option_b = ?, option_c = ?, option_d = ?, correct_option = ?
          WHERE question_id = ? AND exam_id = ?
          `,
          [
            q.question_text,
            q.option_a,
            q.option_b,
            q.option_c,
            q.option_d,
            q.correct_option,
            q.question_id,
            q.exam_id,
          ]
        )
      }
    }

    return {
      success: true,
      message: `Saved ${questions.length} questions successfully.`,
      insertedIds,
    }
  } catch (error: any) {
    console.error("Error saving questions:", error)
    return {
      success: false,
      message: "Failed to save questions.",
      error: error.message,
    }
  }
}

// 🔹 Delete question
export async function deleteQuestion(questionId: number) {
  await db.execute("DELETE FROM question WHERE question_id = ?", [questionId])
  return { success: true, message: "Question deleted" }
}


export async function saveExam(exam: examType) {
  const conn = db;
  try {
    // ✅ Create new exam
    if (!exam.exam_id) {
      const [res]: any = await conn.execute(
        `INSERT INTO exam (department_id, title, description, total_marks, start_time, end_time, duration_minutes)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          exam.department_id,
          exam.title,
          exam.description,
          exam.total_marks,
          exam.start_time,
          exam.end_time,
          exam.duration_minutes,
        ]
      );
      exam.exam_id = res.insertId;
    }

    else {
      await conn.execute(
        `UPDATE exam
         SET department_id=?, title=?, description=?, total_marks=?, start_time=?, end_time=?, duration_minutes=?
         WHERE exam_id=?`,
        [
          exam.department_id,
          exam.title,
          exam.description,
          exam.total_marks,
          exam.start_time,
          exam.end_time,
          exam.duration_minutes,
          exam.exam_id,
        ]
      );
    }


    return { success: true, message: "Exam saved successfully", exam_id: exam.exam_id };
  } catch (error: any) {
    console.error("❌ Error saving exam:", error);
    return { success: false, message: "Error saving exam" };
  }
}

export async function getActiveExams() {
  const [rows] = await db.query(
    `
   SELECT * FROM exam 
    WHERE start_time <= NOW() 
    AND end_time >= NOW();
    `
  );

  return rows;
}

export async function getUpcomingExams() {
  const [rows] = await db.query(
    `SELECT * FROM exam WHERE start_time > NOW() ORDER BY start_time ASC`
  );
  return rows;
}




export async function initiateExam(studentId: number, examId: number) {
  const startTime = new Date();
  const [exam] = await db.query(
    `SELECT duration_minutes FROM exam WHERE exam_id = ?`,
    [examId]
  );

  if (exam.length === 0) throw new Error('Exam not found');

  const endTime = new Date(startTime.getTime() + exam[0].duration_minutes * 60000);

  const [result] = await db.query(
    `INSERT INTO student_exam (student_id, exam_id, start_time, end_time, status)
     VALUES (?, ?, ?, ?, 'in-progress')`,
    [studentId, examId, startTime, endTime]
  );

  return { student_exam_id: result.insertId, start_time: startTime, end_time: endTime };
}


// 4️⃣ FETCH QUESTIONS FOR EXAM (when attempting)
// -------------------------------------------------------
export async function getExamQuestions(examId: number) {
  const [questions] = await db.query(
    `SELECT question_id, question_text, option_a, option_b, option_c, option_d
     FROM question WHERE exam_id = ?`,
    [examId]
  );
  return questions;
}

// -------------------------------------------------------
// 5️⃣ SAVE STUDENT ANSWER (during attempt)
// -------------------------------------------------------
export async function saveStudentAnswer(
  studentId: number,
  questionId: number,
  selectedOption: string
) {
  // find correct option
  const [question] = await db.query(
    `SELECT correct_option FROM question WHERE question_id = ?`,
    [questionId]
  );

  if (question.length === 0) throw new Error('Question not found');

  const isCorrect = question[0].correct_option === selectedOption ? 1 : 0;

  await db.query(
    `INSERT INTO student_answer (student_id, question_id, selected_option, is_correct)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE selected_option = VALUES(selected_option), is_correct = VALUES(is_correct)`,
    [studentId, questionId, selectedOption, isCorrect]
  );

  return { success: true };
}



export async function submitExam(studentExamId: number) {
  // get exam info
  const [examData] = await db.query(
    `SELECT e.exam_id, e.total_marks, s.student_id
     FROM student_exam s
     JOIN exam e ON s.exam_id = e.exam_id
     WHERE s.student_exam_id = ?`,
    [studentExamId]
  );

  if (examData.length === 0) throw new Error('Exam not found');

  const { exam_id, total_marks, student_id } = examData[0];

  // count total and correct answers
  const [ans] = await db.query(
    `SELECT COUNT(*) AS total, SUM(is_correct) AS correct
     FROM student_answer
     WHERE student_id = ? AND question_id IN (
       SELECT question_id FROM question WHERE exam_id = ?
     )`,
    [student_id, exam_id]
  );

  const total = ans[0].total || 0;
  const correct = ans[0].correct || 0;
  const percentage = total > 0 ? (correct / total) * 100 : 0;
  const marksObtained = (total_marks * correct) / total;

  // update student_exam
  await db.query(
    `UPDATE student_exam
     SET status = 'completed', marks_obtained = ?, end_time = NOW()
     WHERE student_exam_id = ?`,
    [marksObtained, studentExamId]
  );

  // insert into result
  await db.query(
    `INSERT INTO result (student_exam_id, total_questions, correct_answers, total_marks, percentage)
     VALUES (?, ?, ?, ?, ?)`,
    [studentExamId, total, correct, marksObtained, percentage]
  );

  return { marksObtained, percentage, total, correct };
}

// -------------------------------------------------------
// 7️⃣ FETCH STUDENT RESULT HISTORY
// -------------------------------------------------------
export async function getStudentResults(studentId: number) {
  const [results] = await db.query(
    `SELECT r.result_id, e.title, r.correct_answers, r.total_questions,
            r.total_marks, r.percentage, se.start_time, se.end_time
     FROM result r
     JOIN student_exam se ON r.student_exam_id = se.student_exam_id
     JOIN exam e ON se.exam_id = e.exam_id
     WHERE se.student_id = ?
     ORDER BY se.start_time DESC`,
    [studentId]
  );

  return results;
}

// -------------------------------------------------------
// 8️⃣ GET LIVE EXAMS (for students to see ongoing/upcoming)
// -------------------------------------------------------
export async function getAvailableExams(departmentId: number) {
  const now = new Date();
  const [exams] = await db.query(
    `SELECT * FROM exam
     WHERE department_id = ? AND start_time <= ? AND end_time >= ?`,
    [departmentId, now, now]
  );
  return exams;
}

// -------------------------------------------------------
// 9️⃣ HOD OR ADMIN OVERVIEW (see all results of a department)
// -------------------------------------------------------
export async function getDepartmentResults(departmentId: number) {
  const [rows] = await db.query(
    `SELECT s.name AS student_name, e.title AS exam_title,
            r.correct_answers, r.total_questions, r.total_marks, r.percentage
     FROM result r
     JOIN student_exam se ON r.student_exam_id = se.student_exam_id
     JOIN student s ON se.student_id = s.student_id
     JOIN exam e ON se.exam_id = e.exam_id
     WHERE e.department_id = ?
     ORDER BY e.start_time DESC`,
    [departmentId]
  );
  return rows;
}

// -------------------------------------------------------
// 🔟 CLEANUP OLD EXAMS (optional maintenance task)
// -------------------------------------------------------
export async function cleanupExpiredExams() {
  await db.query(
    `DELETE FROM exam WHERE end_time < DATE_SUB(NOW(), INTERVAL 1 YEAR)`
  );
}



