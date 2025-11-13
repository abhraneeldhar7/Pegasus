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
  e.subject,
  d.name AS department_name,
  e.total_marks,
  e.start_time,
  e.end_time,
  COUNT(DISTINCT se.student_id) AS total_students_enrolled
FROM exam e
JOIN department d ON e.department_id = d.department_id
LEFT JOIN student_exam se ON e.exam_id = se.exam_id
GROUP BY 
  e.exam_id, e.title, e.subject, d.name, e.total_marks, e.start_time, e.end_time
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
      INSERT INTO exam (department_id, title, description, subject, total_marks, start_time, end_time, duration_minutes, is_live)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        formData.department_id,
        formData.title,
        formData.description,
        formData.subject,
        0,
        new Date,
        new Date,
        60,
        0
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
    `;

    const values = [
      question.exam_id,
      question.question_text,
      question.option_a,
      question.option_b,
      question.option_c,
      question.option_d,
      question.correct_option,
    ];

    const [result]: any = await db.execute(query, values);

    return {
      success: true,
      insertedId: result.insertId, // ✅ MySQL auto-generated ID
      message: "Question added successfully",
    };
  } catch (error: any) {
    console.error("Error adding question:", error);
    return { success: false, message: error.message };
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


export async function publishExam(exam_id: number) {
  try {
    // Step 1: Get the department of this exam
    const [examRows]: any = await db.query(
      "SELECT department_id FROM exam WHERE exam_id = ?",
      [exam_id]
    );

    if (examRows.length === 0) {
      return { success: false, message: "Exam not found" };
    }

    const department_id = examRows[0].department_id;

    // Step 2: Get all students in that department
    const [students]: any = await db.query(
      "SELECT student_id FROM student WHERE department_id = ?",
      [department_id]
    );

    if (students.length === 0) {
      return { success: false, message: "No students found for this department" };
    }

    // Step 3: Insert student_exam records for all students
    const now = new Date();
    const studentExamData = students.map((s: any) => [
      s.student_id,
      exam_id,
      now,
      null,
      0,
      "not_started",
    ]);

    const [result]: any = await db.query(
      `
      INSERT INTO student_exam (student_id, exam_id, start_time, end_time, marks_obtained, status)
      VALUES ?
      ON DUPLICATE KEY UPDATE exam_id = exam_id
      `,
      [studentExamData]
    );

    await db.query(
      "UPDATE exam SET is_live = TRUE WHERE exam_id = ?",
      [exam_id]
    );

    return {
      success: true,
      inserted: result.affectedRows,
      message: `Exam published and assigned to ${students.length} students`,
    };
  } catch (error) {
    console.error("Error publishing exam:", error);
    return { success: false, message: "Failed to publish exam" };
  }
}

export async function submitExam(student_id: number, exam_id: number) {
  try {
    await db.query(
      `UPDATE student_exam 
       SET status = 'completed', end_time = NOW() 
       WHERE student_id = ? AND exam_id = ?`,
      [student_id, exam_id]
    );

    await generateResult(student_id, exam_id);

    return { success: true, message: "Exam submitted successfully" };
  } catch (error) {
    console.error("Error submitting exam:", error);
    return { success: false, message: "Failed to submit exam" };
  }
}


export async function generateResult(student_id: number, exam_id: number) {
  try {
    // Fetch total marks for this exam
    const [[exam]]: any = await db.query(
      "SELECT total_marks FROM exam WHERE exam_id = ?",
      [exam_id]
    );

    // Count total and correct answers
    const [[answers]]: any = await db.query(
      `SELECT COUNT(*) AS total_questions, 
              SUM(is_correct) AS correct_answers
       FROM student_answer
       WHERE student_id = ? 
       AND question_id IN (SELECT question_id FROM question WHERE exam_id = ?)`,
      [student_id, exam_id]
    );

    const total_questions = answers.total_questions || 0;
    const correct_answers = answers.correct_answers || 0;
    const marks_per_question =
      total_questions > 0 ? exam.total_marks / total_questions : 0;
    const total_obtained = correct_answers * marks_per_question;
    const percentage =
      exam.total_marks > 0
        ? (total_obtained / exam.total_marks) * 100
        : 0;

    // Get student_exam_id
    const [[studentExam]]: any = await db.query(
      `SELECT student_exam_id FROM student_exam 
       WHERE student_id = ? AND exam_id = ?`,
      [student_id, exam_id]
    );

    if (!studentExam) {
      throw new Error("Student exam record not found.");
    }

    const student_exam_id = studentExam.student_exam_id;

    // Insert or update result table
    await db.query(
      `INSERT INTO result (
          student_id, 
          exam_id, 
          student_exam_id, 
          total_questions, 
          correct_answers, 
          total_marks, 
          percentage
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          total_questions = VALUES(total_questions),
          correct_answers = VALUES(correct_answers),
          total_marks = VALUES(total_marks),
          percentage = VALUES(percentage)`,
      [
        student_id,
        exam_id,
        student_exam_id,
        total_questions,
        correct_answers,
        total_obtained,
        percentage,
      ]
    );

    return {
      success: true,
      marks: total_obtained,
      percentage,
    };
  } catch (error: any) {
    console.error("Error generating result:", error);
    return { success: false, message: error.message };
  }
}


export async function saveAnswer(student_id: number, question_id: string, selected_option: string) {
  try {
    const [[question]]: any = await db.query(
      "SELECT correct_option FROM question WHERE question_id = ?",
      [question_id]
    );

    const is_correct = question.correct_option === selected_option ? 1 : 0;

    await db.query(
      `INSERT INTO student_answer (student_id, question_id, selected_option, is_correct)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE selected_option = VALUES(selected_option), is_correct = VALUES(is_correct)`,
      [student_id, question_id, selected_option, is_correct]
    );

    return { success: true, correct: is_correct };
  } catch (error) {
    console.error("Error saving answer:", error);
    return { success: false, message: "Failed to save answer" };
  }
}

export async function startExam(student_id: number, exam_id: number) {
  try {
    const [result]: any = await db.query(
      `UPDATE student_exam 
       SET status = 'in_progress', start_time = NOW() 
       WHERE student_id = ? AND exam_id = ?`,
      [student_id, exam_id]
    );
    return { success: true, message: "Exam started" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to start exam" };
  }
}



export async function getStudentExams(studentId: number) {
  try {
    const query = `
      SELECT 
          se.student_exam_id,
          e.exam_id,
          e.title AS exam_title,
          e.description AS exam_description,
          e.subject,
          e.total_marks,
          e.duration_minutes,
          e.start_time,
          e.end_time,
          se.status,
          se.marks_obtained,
          e.title
      FROM student_exam se
      JOIN exam e ON se.exam_id = e.exam_id
      WHERE se.student_id = ?
      ORDER BY e.start_time DESC
    `;

    const [rows] = await db.execute(query, [studentId]);
    return {
      success: true,
      exams: rows,
    };
  } catch (error: any) {
    console.error("Error fetching student exams:", error);
    return { success: false, message: error.message };
  }
}




export async function getUpcomingExams(student_id: number) {
  try {
    const query = `
      SELECT 
          e.exam_id,
          e.title,
          e.description,
          e.total_marks,
          e.start_time,
          e.end_time,
          e.duration_minutes,
          e.subject,
          d.name AS department_name
      FROM exam e
      JOIN department d ON e.department_id = d.department_id
      JOIN student s ON s.department_id = e.department_id
      WHERE s.student_id = ?
        AND e.is_live = TRUE
        AND e.start_time > NOW()
      ORDER BY e.start_time ASC
    `;

    const [rows] = await db.query(query, [student_id]);

    return {
      success: true,
      upcomingExams: rows,
    };
  } catch (error: any) {
    console.error("Error fetching upcoming exams:", error);
    return { success: false, message: error.message };
  }
}




export async function getExamDetails(exam_id: number) {
  try {
    const query = `
      SELECT 
        e.exam_id,
        e.title,
        e.description,
        e.total_marks,
        e.duration_minutes,
        e.subject,
        e.start_time,
        e.end_time,
        d.name AS department_name
      FROM exam e
      JOIN department d ON e.department_id = d.department_id
      WHERE e.exam_id = ?
    `;

    const [rows]: any = await db.query(query, [exam_id]);
    if (!rows.length) {
      return { success: false, message: "Exam not found" };
    }

    return {
      success: true,
      exam: rows[0],
    };
  } catch (error: any) {
    console.error("Error fetching exam details:", error);
    return { success: false, message: error.message };
  }
}


export async function getExamQuestions(exam_id: number) {
  try {
    const query = `
      SELECT 
        question_id,
        exam_id,
        question_text,
        option_a,
        option_b,
        option_c,
        option_d
      FROM question
      WHERE exam_id = ?
      ORDER BY question_id ASC
    `;

    const [rows]: any = await db.query(query, [exam_id]);
    return {
      success: true,
      questions: rows,
    };
  } catch (error: any) {
    console.error("Error fetching exam questions:", error);
    return { success: false, message: error.message };
  }
}



export async function getStudentResults(student_id: number) {
  try {
    const [rows]: any = await db.query(
      `
      SELECT 
        e.exam_id,
        e.title,
        e.subject,
        e.total_marks,
        r.total_marks AS marks_obtained,
        r.percentage,
        se.end_time AS submitted_at
      FROM result r
      JOIN exam e ON r.exam_id = e.exam_id
      JOIN student_exam se ON r.student_exam_id = se.student_exam_id
      WHERE se.student_id = ?
      ORDER BY se.end_time DESC
      `,
      [student_id]
    );

    return {
      success: true,
      results: rows,
    };
  } catch (error: any) {
    console.error("Error fetching student results:", error);
    return { success: false, message: error.message };
  }
}


export async function getResultsGroupedByExam() {
  try {
    const [rows]: any = await db.query(
      `
      SELECT 
        e.exam_id,
        e.title AS exam_title,
        e.subject,
        e.total_marks AS max_marks,
        s.student_id,
        s.name AS student_name,
        r.total_marks AS marks_obtained,
        r.percentage,
        se.end_time AS submitted_at
      FROM result r
      JOIN exam e ON r.exam_id = e.exam_id
      JOIN student_exam se ON r.student_exam_id = se.student_exam_id
      JOIN student s ON se.student_id = s.student_id
      ORDER BY e.exam_id, s.name
      `
    );

    // Group results by exam_id
    const groupedResults: Record<number, any> = {};
    for (const row of rows) {
      if (!groupedResults[row.exam_id]) {
        groupedResults[row.exam_id] = {
          exam_id: row.exam_id,
          exam_title: row.exam_title,
          subject: row.subject,
          max_marks: row.max_marks,
          results: [],
        };
      }
      groupedResults[row.exam_id].results.push({
        student_id: row.student_id,
        student_name: row.student_name,
        marks_obtained: row.marks_obtained,
        percentage: row.percentage,
        submitted_at: row.submitted_at,
      });
    }

    // Convert grouped object to array for easy rendering
    const finalResults = Object.values(groupedResults);

    return {
      success: true,
      groupedResults: finalResults,
    };
  } catch (error: any) {
    console.error("Error fetching grouped results:", error);
    return { success: false, message: error.message };
  }
}