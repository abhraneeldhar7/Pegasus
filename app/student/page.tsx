"use client"
import ClockComponent from "@/components/clock";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/context/userProvider";
import { departmentType, examType } from "@/lib/types";
import { Ellipsis, GraduationCap, LayersIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getStudentDepartment } from "../actions/studentActions";
import { getStudentExams, getStudentResults, getUpcomingExams } from "../actions/examActions";
import { formatDateTime } from "@/lib/utils";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface studentExamType {
    student_exam_id: number,
    duration_minutes: number,
    end_time: Date,
    exam_description: string,
    exam_id: number,
    exam_title: string,
    start_time: Date,
    status: string,
    subject: string,
    total_marks: number,
    title: string
}



export default function StudentDashboard() {

    const { user, setUser } = useUser();

    const [studentDept, setStudentDept] = useState<departmentType | null>(null)
    const [activeExam, setActiveExam] = useState<studentExamType[] | null>(null)
    const [upcommingExams, setUpcommingExams] = useState<any[] | null>(null)
    const [completedExams, setCompletedExams] = useState<any[] | null>(null)



    useEffect(() => {
        if (!user) return;
        const init = async () => {

            const deptRes = await getStudentDepartment(user.id)
            setStudentDept(deptRes as departmentType)
            console.log(deptRes)

            const studentExams = await getStudentExams(user.id);
            console.log(studentExams)


            const activeExams: studentExamType[] = [];

            studentExams.exams.forEach((exam: studentExamType) => {
                if (exam.status === "not_started") {
                    activeExams.push(exam);
                }
            });
            setActiveExam(activeExams);

            const upcommingExams = await getUpcomingExams(user.id);
            console.log("upcoming exams: ", upcommingExams)
            setUpcommingExams(upcommingExams.upcomingExams)


            const studentResults = await getStudentResults(user.id);
            setCompletedExams(studentResults.results)
        }
        init();
    }, [user])


    const router = useRouter();

    const logOut = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        setUser(null);
        router.push("/login");
    }



    return (<div className="min-h-[100vh] max-w-[800px] w-full mx-auto py-[40px] px-[15px]">


        <div className="flex justify-between items-start">
            <div className="flex flex-col gap-[10px] w-full">
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

                <div className="rounded-[8px] md:w-fit w-full truncate px-[25px] py-[20px] bg-muted/70 shadow-md border leading-[1.2em]">
                    <p className="text-[14px]">Department :</p>
                    <p className="mt-[10px] text-[18px] font-[400]">{studentDept?.name}</p>
                </div>

            </div>
            <div className="md:block hidden">
                <ClockComponent />
            </div>
        </div>


        {/* <div className="mt-[30px]">
            <div className="rounded-[15px] shadow-sm h-[100px] relative overflow-hidden bg-[#454746] flex px-[15px] py-[8px] md:flex-1 max-w-[200px] flex-col justify-end text-[white]  transition-all duration-300 hover:translate-y-[-4px] active:translate-y-[4px] select-none cursor-pointer">
                <div className="absolute h-[120px] w-[100%] rounded-[50%] top-[-60px] bg-[#e5faf7] rotate-[-20deg] blur-[30px]" />
                <GraduationCap size={25} className="absolute z-[2] right-[15px] top-[15px]" />
                <h1 className="text-[17px] z-[2]">View Results</h1>
            </div>
        </div> */}



        <div className="mt-[50px] flex flex-col gap-[10px] min-h-[150px]">
            <h1 className="text-[20px] font-[400]">Active Exams</h1>

            {activeExam && activeExam.length == 0 &&
                <p className="text-[15px] opacity-[0.7]">No active exams</p>
            }

            {activeExam && activeExam.length > 0 && activeExam?.map((exam, index) => (
                <Link href={`/student/exam/${exam.exam_id}`} className="rounded-[15px] h-[150px] shadow-md md:max-w-[300px] relative overflow-hidden px-[15px] py-[10px] bg-muted flex flex-col justify-between group select-none cursor-pointer" key={index}>
                    <LayersIcon size={90} className="opacity-[0.4] absolute bottom-[-10px] right-[-10px] text-primary transition-all duration-300 group-hover:bottom-[0px] group-hover:opacity-[0.8]" />
                    <div className="flex gap-[10px] justify-between flex-col leading-[1.2em] pt-[5px]">
                        <h1 className="md:text-[19px] text-[22px] truncate">{exam.title}</h1>
                        <p>{exam.subject}</p>
                    </div>
                    <div className="mt-auto">
                        <p className="md:text-[12px] text-[15px] font-[Mono]">{formatDateTime(exam.start_time)}</p>
                    </div>
                </Link>
            ))}
        </div>

        <div className="mt-[40px]">
            <h1 className="text-[20px] font-[400]">Upcomming Exams</h1>
            <Table className="mt-[20px]">
                <TableHeader>
                    <TableRow>
                        <TableHead>Exam name</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Total Marks</TableHead>
                        <TableHead>Duration</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {upcommingExams?.map((exam, index) => (
                        <TableRow key={index}>
                            <TableCell>{exam.title}</TableCell>
                            <TableCell>{exam.subject}</TableCell>
                            <TableCell>{formatDateTime(exam.start_time)}</TableCell>
                            <TableCell>{exam.total_marks}</TableCell>
                            <TableCell>{exam.duration_minutes}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>

        {completedExams && completedExams.length > 0 &&
            <div className="mt-[40px]">
                <h1 className="text-[20px] font-[400]">Completed Exams</h1>
                <Table className="mt-[20px]">
                    <TableHeader>
                        <TableRow>
                            <TableHead>Exam name</TableHead>
                            <TableHead>Subject</TableHead>
                            <TableHead>Marks</TableHead>
                            <TableHead>Total Marks</TableHead>
                            <TableHead>Percentage</TableHead>
                            <TableHead>Submitted At</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {completedExams?.map((exam, index) => (
                            <TableRow key={index}>
                                <TableCell>{exam.title}</TableCell>
                                <TableCell>{exam.subject}</TableCell>
                                <TableCell>{exam.marks_obtained}</TableCell>
                                <TableCell>{exam.total_marks}</TableCell>
                                <TableCell>{exam.percentage}</TableCell>
                                <TableCell>{formatDateTime(exam.submitted_at)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        }



    </div>)
}