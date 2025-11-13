"use client"

import { createDepartment, getDepartments, getDepartmentTableData } from "@/app/actions/departmentActions";
import { deleteExam, getExamCount } from "@/app/actions/examActions";
import { getStudentCount, insertStudents } from "@/app/actions/studentActions";
import { getAdminCount } from "@/app/actions/userActions";
import ClockComponent from "@/components/clock";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useUser } from "@/context/userProvider"
import { departmentType, studentType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Label } from "@radix-ui/react-label";
import { PopoverClose } from "@radix-ui/react-popover";
import { Check, ChevronsUpDown, Command, Ellipsis, FileTextIcon, GraduationCap, NotebookIcon, PaperclipIcon, PlusIcon, UsersRoundIcon, Warehouse } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

var Papa = require("papaparse")

interface deptTableType {
    department_id: number,
    code: string,
    name: string,
    hod_name: string,
    hod_email: string,
    student_count: number
}

export default function AdminDashboard() {
    const router = useRouter();
    const { user, setUser } = useUser();

    const logOut = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        setUser(null);
        router.push("/login");
    }

    const [departments, setDepartments] = useState<deptTableType[] | null>(null)

    useEffect(() => {
        const init = async () => {
            const departmentRes = await getDepartmentTableData();
            setDepartments(departmentRes)


            const studentCount = await getStudentCount();
            setStudentCount(studentCount);

            const adminCount = await getAdminCount();
            setAdminCount(adminCount);

            const examCount = await getExamCount();
            setExamCount(examCount);
        }
        init();
    }, [])



    const [newDepartmentName, setNewDepartmentName] = useState("");
    const [newDepartmentCode, setNewDepartmentCode] = useState("");
    const [newDeptLoader, setNewDeptLoader] = useState(false);
    const [newDeptDialogOpen, setnewDeptDialogOpen] = useState(false);
    const [showAllDept, setShowAllDept] = useState(false);


    const [studentCount, setStudentCount] = useState<number | null>(null)
    const [examCount, setExamCount] = useState<number | null>(null)
    const [adminCount, setAdminCount] = useState<number | null>(null)




    const [newStudentName, setNewStudentName] = useState("")
    const [newStudentRoll, setNewStudentRoll] = useState("")
    const [newStudentEmail, setNewStudentEmail] = useState("")
    const [newStudentDeptId, setNewStudentDeptId] = useState<number | null>(null)
    const [newStudentDialogOpen, setNewStudentDialogOpen] = useState(false);
    const [newStudentLoading, setNewStudentLoading] = useState(false);


    const [csvImportedStudents, setCSVImportedStudents] = useState<studentType[] | null>(null)

    const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.name.endsWith(".csv")) {
            toast.error("Please upload a valid .csv file");
            return;
        }

        setNewStudentLoading(true);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: function (results: any) {
                const data = results.data as any[];
                const errors: string[] = [];
                const validStudents: studentType[] = [];

                if (data.length === 0) {
                    toast.error("CSV file is empty!");
                    setNewStudentLoading(false);
                    return;
                }

                data.forEach((row, index) => {
                    const lineNumber = index + 2;

                    // if (!row.student_id || !row.name || !row.email || !row.department_id) {
                    //     errors.push(`Missing field(s) at line ${lineNumber}`);
                    //     return;
                    // }

                    const student_id = Number(row.student_id);
                    const department_id = Number(row.department_id);
                    if (isNaN(student_id) || isNaN(department_id)) {
                        errors.push(`Invalid numeric value at line ${lineNumber}`);
                        return;
                    }

                    if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(row.email)) {
                        errors.push(`Invalid email format at line ${lineNumber}`);
                        return;
                    }

                    validStudents.push({
                        student_id,
                        name: row.name.trim(),
                        email: row.email.trim(),
                        department_id,
                    });
                });

                // 🔥 Display errors or send valid data
                if (errors.length > 0) {
                    errors.forEach((err) => toast.error(err));
                } else {
                    toast.success(`Successfully validated ${validStudents.length} students`);
                    setCSVImportedStudents(validStudents);
                    console.log(validStudents)
                }

                setNewStudentLoading(false);
            },
            error: function () {
                toast.error("Error parsing the CSV file");
                setNewStudentLoading(false);
            },
        });
    };

    const csvInputRef = useRef<HTMLInputElement>(null)





    return (

        <div className="min-h-[100vh] max-w-[800px] w-full mx-auto py-[40px] px-[15px]">

            <div className="flex justify-between items-start">
                <div className="flex gap-[30px] justify-between md:justify-start items-center flex-wrap">
                    <h1 className="text-[25px] flex items-center gap-[15px]">Welcome {user?.name}
                        {!user && <Skeleton className="h-[25px] w-[100px]" />}
                    </h1>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button className="rounded-[50%] h-[35px] w-[35px]" variant="outline">
                                <Ellipsis />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-[5px] w-[100px]">
                            <Button variant="ghost" className="text-[red] w-full" onClick={() => logOut()}>Log Out</Button>
                        </PopoverContent>
                    </Popover>
                </div>
                <div className="md:block hidden">
                    <ClockComponent />
                </div>
            </div>



            <div className="grid md:grid-cols-4 grid-cols-2 gap-[15px] mt-[40px] mx-auto">

                <Dialog open={newStudentDialogOpen} onOpenChange={(e) => {
                    setNewStudentDialogOpen(e)
                    setNewStudentDeptId(null);
                    setNewStudentEmail("");
                    setNewStudentLoading(false);
                    setNewStudentName("");
                    setNewStudentRoll("");
                    setCSVImportedStudents(null);
                }}>
                    <DialogTrigger asChild>
                        <div className="rounded-[15px] shadow-sm h-[100px] relative overflow-hidden bg-[#785417] flex px-[15px] py-[8px] md:flex-1 max-w-[200px] flex-col justify-end text-[white]  transition-all duration-300 hover:translate-y-[-4px] active:translate-y-[4px] select-none cursor-pointer">
                            <div className="absolute h-[120px] w-[200px] rounded-[50%] top-[-60px] right-0 rotate-[40deg] bg-[#f7a10c] blur-[20px]" />
                            <UsersRoundIcon size={25} className="absolute z-[2] right-[15px] top-[15px]" />
                            <h1 className="text-[17px] z-[2]">Add students</h1>
                        </div>
                    </DialogTrigger>
                    <DialogContent className="md:max-w-[450px]">
                        <DialogTitle>Add new Student</DialogTitle>
                        <DialogDescription>Fill out the details of student or import from csv</DialogDescription>

                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            if (!csvImportedStudents) {

                                if (!newStudentRoll.length || !newStudentName.length || !newStudentEmail.length) return;
                                if (!newStudentDeptId) return;
                                setNewStudentLoading(true)
                                try {

                                    const res = await insertStudents([{
                                        student_id: Number(newStudentRoll),
                                        name: newStudentName,
                                        email: newStudentEmail,
                                        department_id: newStudentDeptId
                                    }])
                                    console.log(res)
                                    toast.success("Added student")
                                }
                                catch (e) {
                                    toast.error("Error uploading")
                                }

                                setNewStudentLoading(false);
                            }
                            else {
                                setNewStudentLoading(true);
                                try {
                                    const res = await insertStudents(csvImportedStudents);
                                    console.log(res)
                                }
                                catch (e) {
                                    toast.error("Error uploading")
                                    console.log(e)
                                }
                                setNewStudentLoading(false);
                            }
                            setNewStudentDialogOpen(false)
                        }}>
                            {!csvImportedStudents &&
                                <div className="flex flex-col gap-[15px] mt-[20px]">
                                    <div className="flex flex-col gap-[5px]">
                                        <Label>Roll Number</Label>
                                        <Input placeholder="student roll..." value={newStudentRoll} onChange={(e) => { setNewStudentRoll(e.target.value) }} className="max-w-[400px]" />
                                    </div>

                                    <div className="flex flex-col gap-[5px]">
                                        <Label>Student Name</Label>
                                        <Input placeholder="student name..." value={newStudentName} onChange={(e) => { setNewStudentName(e.target.value) }} className="max-w-[400px]" />
                                    </div>

                                    <div className="flex flex-col gap-[5px]">
                                        <Label>Student Email</Label>
                                        <Input placeholder="student email..." value={newStudentEmail} onChange={(e) => { setNewStudentEmail(e.target.value) }} className="max-w-[400px]" />
                                    </div>

                                    <div className="flex flex-col gap-[5px]">
                                        <Label>Department</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className="w-[200px] justify-between"
                                                    disabled={!departments}
                                                >
                                                    <p className="max-w-[200px] truncate">

                                                        {newStudentDeptId
                                                            ? departments?.find(
                                                                (dept) => dept.department_id === newStudentDeptId
                                                            )?.name ?? "Select department..."
                                                            : "Select department..."}
                                                    </p>
                                                    <ChevronsUpDown className="opacity-50" />
                                                </Button>
                                            </PopoverTrigger>

                                            <PopoverContent className="w-[300px] p-[15px]">

                                                {departments?.map((dept, index) =>
                                                (
                                                    <PopoverClose asChild key={index}>
                                                        <Button
                                                            variant="ghost"
                                                            value={String(dept.department_id)}
                                                            onClick={() => {
                                                                const selectedId = Number(dept.department_id);
                                                                setNewStudentDeptId(
                                                                    selectedId === newStudentDeptId ? null : selectedId
                                                                );
                                                            }}
                                                            className="truncate w-full"
                                                        >
                                                            <p className="max-w-[240px] truncate">
                                                                {dept.name}
                                                            </p>
                                                            <Check
                                                                className={cn(
                                                                    "ml-auto",
                                                                    dept.department_id === newStudentDeptId
                                                                        ? "opacity-100"
                                                                        : "opacity-0"
                                                                )}
                                                            />
                                                        </Button>
                                                    </PopoverClose>
                                                )
                                                )}

                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>}
                            {csvImportedStudents && (
                                <div className="flex items-center justify-center h-[100px]">
                                    {csvImportedStudents.length} students imported
                                </div>
                            )}

                            <DialogFooter className="mt-[30px]">
                                {csvImportedStudents ?
                                    <Button onClick={() => {
                                        setCSVImportedStudents(null)
                                        if (!csvInputRef.current) return;
                                        csvInputRef.current.value = ""
                                    }} variant="outline">Clear</Button>
                                    :
                                    <Button variant="secondary" onClick={() => { csvInputRef.current?.click() }}>Import from CSV</Button>
                                }
                                <input
                                    ref={csvInputRef}
                                    type="file"
                                    accept=".csv"
                                    className="hidden"
                                    onChange={handleCSVUpload}
                                    disabled={newStudentLoading}
                                />
                                <Button type="submit" loading={newStudentLoading}>Add Student</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>








                <Link href="/admin/exams">
                    <div className="rounded-[15px] shadow-sm h-[100px] relative overflow-hidden bg-[#10613b] flex px-[15px] py-[8px] md:flex-1 max-w-[200px] flex-col justify-end text-[white] transition-all duration-300 hover:translate-y-[-4px] active:translate-y-[4px] select-none cursor-pointer">
                        <div className="absolute h-[120px] w-[200px] rounded-[50%] top-[-60px] right-[-20px] bg-[#03f584] blur-[25px]" />
                        <FileTextIcon size={25} className="absolute z-[2] right-[15px] top-[15px]" />
                        <h1 className="text-[17px] z-[2]">Exams</h1>
                    </div>
                </Link>









                <div className="rounded-[15px] shadow-sm h-[100px] relative overflow-hidden bg-[#454746] flex px-[15px] py-[8px] md:flex-1 max-w-[200px] flex-col justify-end text-[white]  transition-all duration-300 hover:translate-y-[-4px] active:translate-y-[4px] select-none cursor-pointer">
                    <div className="absolute h-[120px] w-[100%] rounded-[50%] top-[-60px] bg-[#e5faf7] rotate-[-20deg] blur-[30px]" />
                    <GraduationCap size={25} className="absolute z-[2] right-[15px] top-[15px]" />
                    <h1 className="text-[17px] z-[2]">View Results</h1>
                </div>



                <Dialog open={newDeptDialogOpen} onOpenChange={(e) => {
                    setNewDepartmentName("")
                    setNewDepartmentCode("")
                    setNewDeptLoader(false)
                    setnewDeptDialogOpen(e)
                }}>
                    <DialogTrigger asChild>
                        <div className="rounded-[15px] shadow-sm h-[100px] relative overflow-hidden bg-[#3f8a85] flex px-[15px] py-[8px] md:flex-1 max-w-[200px] flex-col justify-end text-[white] transition-all duration-300 hover:translate-y-[-4px] active:translate-y-[4px] select-none cursor-pointer">
                            <div className="absolute h-[120px] w-full rounded-[50%] top-[-50px] bg-[#0dfaec] blur-[30px] rotate-[-20deg]" />
                            <Warehouse size={25} className="absolute z-[2] right-[15px] top-[15px]" />
                            <h1 className="text-[17px] z-[2]">New Department</h1>
                        </div>
                    </DialogTrigger>
                    <DialogContent className="md:max-w-[450px]">
                        <DialogTitle>New Department Details</DialogTitle>
                        <DialogDescription>Enter name and code of the new department</DialogDescription>
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            if (!newDepartmentCode.length || !newDepartmentName.length) return;
                            setNewDeptLoader(true);
                            const res = await createDepartment(newDepartmentName, newDepartmentCode);
                            setNewDeptLoader(false);
                            if (res.message == "code_already_exists") {
                                toast.error("Department code already exists")
                                return;
                            }
                            const prev = departments;
                            setDepartments([res as deptTableType, ...prev || []])
                            setnewDeptDialogOpen(false);
                            toast.success("Created New Department")
                            console.log(res)

                        }}>

                            <div className="flex flex-col gap-[15px] mt-[20px]">
                                <div className="flex flex-col gap-[5px]">
                                    <Label>Department Name</Label>
                                    <Input placeholder="new dept name..." value={newDepartmentName} onChange={(e) => { setNewDepartmentName(e.target.value) }} className="max-w-[400px]" />
                                </div>

                                <div className="flex flex-col gap-[5px]">
                                    <Label>Department Code</Label>
                                    <Input placeholder="new dept code..." value={newDepartmentCode} onChange={(e) => { setNewDepartmentCode(e.target.value) }} className="max-w-[400px]" />
                                </div>
                            </div>

                            <DialogFooter className="mt-[20px] gap-[15px]">
                                <DialogClose>Cancel</DialogClose>
                                <Button loading={newDeptLoader} type="submit">Create</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>


            </div>


            <div className="mt-[40px] mx-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Code</TableHead>
                            <TableHead className="w-[50px]">Students</TableHead>
                            <TableHead className="text-right">HOD</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {departments?.slice(0, showAllDept ? departments.length || 0 : 5).map((dept, index) => (
                            <TableRow key={index} className="select-none cursor-pointer">
                                <TableCell className="max-w-[200px] truncate">
                                    {dept.name}
                                </TableCell>
                                <TableCell>
                                    {dept.code}
                                </TableCell>
                                <TableCell>
                                    {dept.student_count}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Tooltip>
                                        <TooltipTrigger>
                                            {dept.hod_name}
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <Link href={`mailto:${dept.hod_email}`} target="_blank" className="select-none cursor-pointer">
                                                {dept.hod_email}
                                            </Link>
                                        </TooltipContent>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>

                        ))}
                    </TableBody>
                </Table>

                {departments &&
                    <div className="flex justify-center">
                        <Button variant={`${!showAllDept ? "default" : "secondary"}`} className="h-[40pxc] mt-[20px]" onClick={() => { setShowAllDept(!showAllDept) }}>Show {showAllDept ? "less" : "more"}</Button>
                    </div>
                }

                {!departments && <div className="flex flex-col gap-[5px] mt-[30px]">
                    <Skeleton className="w-full h-[25px]" />
                    <Skeleton className="w-full h-[25px]" />
                    <Skeleton className="w-full h-[25px]" />
                    <Skeleton className="w-full h-[25px]" />
                    <Skeleton className="w-full h-[25px]" />
                </div>}

            </div>


            <div className="mt-[40px]">
                <h1 className="text-[22px]">Analytics</h1>
                <div className="grid md:grid-cols-4 grid-cols-2 mt-[20px] gap-[15px]">

                    <div className="rounded-[15px] h-[100px] relative overflow-hidden shadow-md bg-[#fff8ff] dark:bg-[#050614] flex flex-col justify-between p-[15px]">
                        <div className="dark:bg-[#595fab] bg-[#f713f5] absolute rounded-[50%] h-[70px] w-full rotate-[-30deg] top-0 left-[-30px] blur-[35px] opacity-[0.1] dark:opacity-[0.7]" />
                        <h1 className="z-[2] text-[40px] leading-[1em]">{studentCount}</h1>
                        <p className="z-[2] opacity-[0.8]">Students</p>
                    </div>
                    <div className="rounded-[15px] h-[100px] relative overflow-hidden shadow-md bg-[#fff8ff] dark:bg-[#050614] flex flex-col justify-between p-[15px]">
                        <div className="dark:bg-[#595fab] bg-[#f713f5] absolute rounded-[50%] h-[70px] w-full rotate-[-30deg] top-0 left-[-30px] blur-[35px] opacity-[0.1] dark:opacity-[0.7]" />
                        <h1 className="z-[2] text-[40px] leading-[1em]">{adminCount}</h1>
                        <p className="z-[2] opacity-[0.8]">Admins</p>
                    </div>
                    <div className="rounded-[15px] h-[100px] relative overflow-hidden shadow-md bg-[#fff8ff] dark:bg-[#050614] flex flex-col justify-between p-[15px]">
                        <div className="dark:bg-[#595fab] bg-[#f713f5] absolute rounded-[50%] h-[70px] w-full rotate-[-30deg] top-0 left-[-30px] blur-[35px] opacity-[0.1] dark:opacity-[0.7]" />
                        <h1 className="z-[2] text-[40px] leading-[1em]">{departments?.length}</h1>
                        <p className="z-[2] opacity-[0.8]">Departments</p>
                    </div>
                    <div className="rounded-[15px] h-[100px] relative overflow-hidden shadow-md bg-[#fff8ff] dark:bg-[#050614] flex flex-col justify-between p-[15px]">
                        <div className="dark:bg-[#595fab] bg-[#f713f5] absolute rounded-[50%] h-[70px] w-full rotate-[-30deg] top-0 left-[-30px] blur-[35px] opacity-[0.1] dark:opacity-[0.7]" />
                        <h1 className="z-[2] text-[40px] leading-[1em]">{examCount}</h1>
                        <p className="z-[2] opacity-[0.8]">Exams</p>
                    </div>

                </div>
            </div>





        </div>


    )
}