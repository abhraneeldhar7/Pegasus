"use client"

import { createDepartment, getDepartments, getDepartmentTableData } from "@/app/actions/departmentActions";
import ClockComponent from "@/components/clock";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useUser } from "@/context/userProvider"
import { departmentType } from "@/lib/types";
import { Label } from "@radix-ui/react-label";
import { Ellipsis, FileTextIcon, GraduationCap, NotebookIcon, PaperclipIcon, PlusIcon, UsersRoundIcon, Warehouse } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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
        await fetch("/auth/logout");
        setUser(null);
        router.push("/login");
    }


    const [departments, setDepartments] = useState<deptTableType[] | null>(null)

    useEffect(() => {
        const init = async () => {
            const departmentRes = await getDepartmentTableData();
            console.log("depts ", departmentRes)
            setDepartments(departmentRes)

        }
        init();
    }, [])


    const [newDepartmentName, setNewDepartmentName] = useState("");
    const [newDepartmentCode, setNewDepartmentCode] = useState("");
    const [newDeptLoader, setNewDeptLoader] = useState(false);
    const [newDeptDialogOpen, setnewDeptDialogOpen] = useState(false);
    const [showAllDept, setShowAllDept] = useState(false);



    return (

        <div className="min-h-[100vh] max-w-[1000px] w-full mx-auto py-[40px] px-[15px]">

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



            <div className="grid md:grid-cols-4 grid-cols-2 gap-[15px] mt-[40px] max-w-[800px] mx-auto">

                <div className="rounded-[15px] shadow-sm h-[100px] relative overflow-hidden bg-[#785417] flex px-[15px] py-[8px] md:flex-1 max-w-[200px] flex-col justify-end text-[white]  transition-all duration-300 hover:translate-y-[-4px] active:translate-y-[4px] select-none cursor-pointer">
                    <div className="absolute h-[120px] w-[200px] rounded-[50%] top-[-60px] right-0 rotate-[40deg] bg-[#f7a10c] blur-[20px]" />

                    <UsersRoundIcon size={25} className="absolute z-[2] right-[15px] top-[15px]" />

                    <h1 className="text-[17px] z-[2]">Add students</h1>
                </div>

                <div className="rounded-[15px] shadow-sm h-[100px] relative overflow-hidden bg-[#10613b] flex px-[15px] py-[8px] md:flex-1 max-w-[200px] flex-col justify-end text-[white] transition-all duration-300 hover:translate-y-[-4px] active:translate-y-[4px] select-none cursor-pointer">
                    <div className="absolute h-[120px] w-[200px] rounded-[50%] top-[-60px] right-[-20px] bg-[#03f584] blur-[25px]" />
                    <FileTextIcon size={25} className="absolute z-[2] right-[15px] top-[15px]" />
                    <h1 className="text-[17px] z-[2]">Exams</h1>
                </div>

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
                    <DialogContent>
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
                            <DialogTitle>New Department Details</DialogTitle>
                            <DialogDescription>Enter name and code of the new department</DialogDescription>
                            <div className="flex flex-col gap-[15px]">
                                <div className="flex flex-col gap-[5px]">
                                    <Label>Department Name</Label>
                                    <Input placeholder="new dept name..." value={newDepartmentName} onChange={(e) => { setNewDepartmentName(e.target.value) }} className="max-w-[400px]" />
                                </div>
                            </div>

                            <div className="flex flex-col gap-[15px]">
                                <div className="flex flex-col gap-[5px]">
                                    <Label>Department Code</Label>
                                    <Input placeholder="new dept code..." value={newDepartmentCode} onChange={(e) => { setNewDepartmentCode(e.target.value) }} className="max-w-[400px]" />
                                </div>
                            </div>

                            <DialogFooter className="mt-[10px] gap-[15px]">
                                <DialogClose>Cancel</DialogClose>
                                <Button loading={newDeptLoader} type="submit">Create</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>

                </Dialog>




            </div>


            <div className="mt-[40px] max-w-[800px] mx-auto">

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

                <div className="flex justify-center">
                    <Button variant={`${!showAllDept ? "default" : "secondary"}`} className="h-[30px] mt-[20px]" onClick={() => { setShowAllDept(!showAllDept) }}>Show {showAllDept ? "less" : "more"}</Button>
                </div>

                {!departments && <div className="my-[30px] flex justify-center"> <Spinner size={30} variant="bars" /></div>}

            </div>




        </div >
    )
}