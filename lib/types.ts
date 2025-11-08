export interface departmentType {
    department_id: number,
    name: string,
    code: string
}

export interface studentType {
    student_id: number;
    name: string;
    email: string;
    department_id: number;
}

export interface examType {
    exam_id: number,
    title: string,
    description: string,
    department: string,
    department_id: number,
    total_marks: number,
    start_time: Date,
    end_time: Date,
    duration_minutes: number
}

export interface questionType {
    question_id: number,
    exam_id: number,
    question_text: string,
    option_a: string,
    option_b: string,
    option_c: string,
    option_d: string,
    correct_option: string
}