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