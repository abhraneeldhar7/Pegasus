"use client"
import { getDepartmentTableData } from "@/app/actions/departmentActions";
import { createExam, deleteExam, getActiveExams, getExamManagerTableData } from "@/app/actions/examActions";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { departmentType, examType } from "@/lib/types";
import { cn, formatDateTime } from "@/lib/utils";
import { PopoverClose } from "@radix-ui/react-popover";
import { Check, ChevronDownIcon, ChevronLeft, ChevronsUpDown, Ellipsis, FileTextIcon, GraduationCap, LayersIcon, Pencil, PlusCircle, SquareArrowUpRightIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ExamsPage() {

    interface tableDataType {
        exam_id: number,
        exam_name: string,
        department_name: string,
        start_time: Date,
        end_time: Date,
        total_marks: number,
        subject: string,
        total_students_enrolled: number
    }

    const [examTableData, setExamTableData] = useState<tableDataType[] | null>(null)
    const [activeExam, setActiveExam] = useState<examType[] | null>(null)

    useEffect(() => {
        const init = async () => {
            const tableDataRes = await getExamManagerTableData()
            setExamTableData(tableDataRes);

            const departmentRes = await getDepartmentTableData();
            setDepartments(departmentRes)

            const activeExamRes = await getActiveExams();
            setActiveExam(activeExamRes)
        }
        init();
    }, [])


    const deleteFunction = async (examId: number) => {
        await deleteExam(examId);
        setExamTableData(null);
        const tableDataRes = await getExamManagerTableData();
        setExamTableData(tableDataRes);
    }



    const [departments, setDepartments] = useState<departmentType[] | null>(null)

    const [newExamTitle, setNewExamTitle] = useState("")
    const [newExamDescripton, setNewExamDescription] = useState("")
    const [newExamSubject, setNewExamSubject] = useState("")
    const [newExamDeptId, setNewExamDeptId] = useState<number | null>(null)
    const [newExamDialogOpen, setNewExamDialogOpen] = useState(false)
    const [newExamLoading, setNewExamLoading] = useState(false)


    const router = useRouter();


    return (<div className="min-h-[100vh] max-w-[800px] w-full mx-auto md:py-[40px] py-[55px] px-[15px]">

        <Link href="/admin/dashboard" className="z-[2] fixed md:top-[40px] md:left-[25px] top-[15px] left-[15px]">
            <Button variant="secondary">
                <ChevronLeft />
            </Button>
        </Link>

        <div className="flex justify-between w-full flex-wrap">
            <h1 className="text-[32px] font-[400]">Exam Manager</h1>
            <div className="grid grid-cols-2 gap-[15px] md:w-[400px] w-full min-w-[250px]">
                <Dialog open={newExamDialogOpen} onOpenChange={(e) => {
                    setNewExamDialogOpen(e);
                    setNewExamTitle("")
                    setNewExamDescription("")
                    setNewExamDeptId(null)
                }}>
                    <DialogTrigger asChild>
                        <div className="rounded-[15px] shadow-sm h-[100px] relative overflow-hidden bg-[#10613b] flex px-[15px] py-[8px] md:flex-1 max-w-[200px] flex-col justify-end text-[white] transition-all duration-300 hover:translate-y-[-4px] active:translate-y-[4px] select-none cursor-pointer">
                            <div className="absolute h-[120px] w-[200px] rounded-[50%] top-[-60px] right-[-20px] bg-[#03f584] blur-[25px]" />
                            <FileTextIcon size={25} className="absolute z-[2] right-[15px] top-[15px]" />

                            <h1>New Exam</h1>
                        </div>
                    </DialogTrigger>
                    <DialogContent className="md:max-w-[450px]">
                        <DialogTitle>Create new exam</DialogTitle>
                        <DialogDescription>Enter the details of the exam and proceed</DialogDescription>

                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            if (!newExamDeptId || !newExamDescripton.length || !newExamTitle.length) return;

                            setNewExamLoading(true)
                            const res = await createExam({
                                department_id: newExamDeptId,
                                title: newExamTitle,
                                description: newExamDescripton,
                                subject: newExamSubject
                            })
                            console.log(res)
                            if (res.success) {
                                toast.success("New Exam Created")
                                setNewExamDialogOpen(false);

                                setExamTableData(null);
                                const tableDataRes = await getExamManagerTableData()
                                setExamTableData(tableDataRes);
                                router.push(`/admin/exams/${res.exam_id}`)
                            }
                            else {
                                toast.error("Error")
                            }
                            setNewExamLoading(false)

                        }}>

                            <div className="flex flex-col gap-[15px] mt-[20px]">
                                <div className="flex flex-col gap-[5px]">
                                    <Label>Exam name</Label>
                                    <Input placeholder="exam name..." value={newExamTitle} onChange={(e) => { setNewExamTitle(e.target.value) }} className="max-w-[400px]" />
                                </div>

                                <div className="flex flex-col gap-[5px]">
                                    <Label>Description</Label>
                                    <Input placeholder="exam description..." value={newExamDescripton} onChange={(e) => { setNewExamDescription(e.target.value) }} className="max-w-[400px]" />
                                </div>

                                <div className="flex flex-col gap-[5px]">
                                    <Label>Subject</Label>
                                    <Input placeholder="exam description..." value={newExamSubject} onChange={(e) => { setNewExamSubject(e.target.value) }} className="max-w-[400px]" />
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

                                                    {newExamDeptId
                                                        ? departments?.find(
                                                            (dept) => dept.department_id === newExamDeptId
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
                                                            setNewExamDeptId(
                                                                selectedId === newExamDeptId ? null : selectedId
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
                                                                dept.department_id === newExamDeptId
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
                            </div>


                            <DialogFooter className="mt-[30px]">
                                <Button variant="secondary" onClick={() => { setNewExamDialogOpen(false) }}>Cancel</Button>
                                <Button type="submit" loading={newExamLoading}>Create</Button>
                            </DialogFooter>

                        </form>

                    </DialogContent>
                </Dialog>

                <div className="rounded-[15px] shadow-sm h-[100px] relative overflow-hidden bg-[#454746] flex px-[15px] py-[8px] md:flex-1 max-w-[200px] flex-col justify-end text-[white]  transition-all duration-300 hover:translate-y-[-4px] active:translate-y-[4px] select-none cursor-pointer">
                    <div className="absolute h-[120px] w-[100%] rounded-[50%] top-[-60px] bg-[#e5faf7] rotate-[-20deg] blur-[30px]" />
                    <GraduationCap size={25} className="absolute z-[2] right-[15px] top-[15px]" />
                    Results
                </div>
            </div>
        </div>


        {activeExam && activeExam.length > 0 &&
            <div className="mt-[30px] flex flex-col gap-[10px] min-h-[150px]">
                <h1 className="text-[20px] font-[400]">Active Exams</h1>
                {activeExam?.map((exam, index) => (
                    <Link href={`/admin/exams/${exam.exam_id}`} className="rounded-[15px] md:h-[120px] h-[150px] shadow-md md:max-w-[220px] relative overflow-hidden px-[15px] py-[10px] bg-muted flex flex-col justify-between group select-none cursor-pointer" key={index}>
                        <LayersIcon size={90} className="opacity-[0.4] absolute bottom-[-10px] right-[-10px] text-primary transition-all duration-300 group-hover:bottom-[0px] group-hover:opacity-[0.8]" />
                        <div className="flex gap-[10px] justify-between">
                            <h1 className="md:text-[19px] text-[22px] truncate">{exam.title}</h1>
                        </div>
                        <div className="mt-auto">
                            <p className="md:text-[12px] text-[15px] font-[Mono]">{formatDateTime(exam.start_time)}</p>
                        </div>
                    </Link>
                ))}
            </div>}



        <div className="mt-[50px] flex flex-col gap-[10px]">
            <h1 className="text-[20px] font-[400]">Exams Listed</h1>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Dept</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Total Marks</TableHead>
                        <TableHead>Enrolled</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {examTableData?.map((exam, index) => (
                        <TableRow key={index}>
                            <TableCell className="max-w-[150px] truncate">{exam.exam_name}</TableCell>
                            <TableCell className="max-w-[220px] truncate">{exam.department_name}</TableCell>
                            <TableCell>{exam.subject}</TableCell>
                            <TableCell>{exam.total_marks}</TableCell>
                            <TableCell>{exam.total_students_enrolled}</TableCell>
                            <TableCell className="text-right">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="ghost">
                                            <Ellipsis size={19} />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="p-[5px] w-[120px]">
                                        <Link href={`/admin/exams/${exam.exam_id}`}>
                                            <Button className="w-full flex justify-start" variant="ghost"><Pencil /> Edit</Button>
                                        </Link>
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button className="w-full flex justify-start text-[red]" variant="ghost"><Trash2Icon /> Delete</Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogTitle>Delete this Exam?</DialogTitle>
                                                <DialogDescription>Delete {exam.exam_name} for {exam.department_name}?</DialogDescription>
                                                <DialogFooter className="mt-[30px]">
                                                    <DialogClose asChild>
                                                        <Button variant="secondary">
                                                            Cancel
                                                        </Button>
                                                    </DialogClose>
                                                    <DialogClose asChild>
                                                        <Button onClick={() => deleteFunction(exam.exam_id)}>Delete</Button>
                                                    </DialogClose>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </PopoverContent>
                                </Popover>

                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            {!examTableData &&
                <div className="flex flex-col gap-[5px]">
                    <Skeleton className="h-[25px] w-full" />
                    <Skeleton className="h-[25px] w-full" />
                    <Skeleton className="h-[25px] w-full" />
                    <Skeleton className="h-[25px] w-full" />
                    <Skeleton className="h-[25px] w-full" />
                </div>
            }

        </div>






    </div >)
}