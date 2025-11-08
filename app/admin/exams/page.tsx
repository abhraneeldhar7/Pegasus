import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronLeft, Ellipsis, GraduationCap, LayersIcon, Pencil, SquareArrowUpRightIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";

export default function ExamsPage() {
    return (<div className="min-h-[100vh] max-w-[800px] w-full mx-auto md:py-[40px] py-[55px] px-[15px]">

        <Link href="/admin/dashboard" className="z-[2] fixed md:top-[40px] md:left-[25px] top-[15px] left-[15px]">
            <Button variant="secondary">
                <ChevronLeft />
            </Button>
        </Link>

        <div className="flex justify-between w-full">
            <h1 className="text-[32px] font-[400]">Exam Manager</h1>

            <div className="rounded-[15px] shadow-sm h-[100px] relative overflow-hidden bg-[#3f8a85] flex px-[15px] py-[8px] w-[200px] flex-col justify-end text-[white] transition-all duration-300 hover:translate-y-[-4px] active:translate-y-[4px] select-none cursor-pointer">
                <div className="absolute h-[120px] w-full rounded-[50%] top-[-50px] bg-[#0dfaec] blur-[30px] rotate-[-20deg]" />
                <GraduationCap size={25} className="absolute z-[2] right-[15px] top-[15px]" />
                <h1 className="text-[17px] z-[2]">View Results</h1>
            </div>
        </div>


        <div className="mt-[30px] flex flex-col gap-[10px] min-h-[150px]">
            <h1 className="text-[22px] font-[400]">Active Exams</h1>
            {/* <p className="text-[15px] opacity-[0.7]">No active exams</p> */}

            <div className="rounded-[15px] md:h-[120px] h-[150px] shadow-md md:max-w-[220px] relative overflow-hidden px-[15px] py-[10px] bg-muted flex flex-col justify-between group select-none cursor-pointer">
                <LayersIcon size={90} className="opacity-[0.4] absolute bottom-[-10px] right-[-10px] text-primary transition-all duration-300 group-hover:bottom-[0px] group-hover:opacity-[0.8]" />
                <div className="flex gap-[10px] justify-between">
                    <h1 className="md:text-[19px] text-[22px] truncate">Semester exam final</h1>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" className="h-[35px] w-[35px] rounded-[50%]"><Ellipsis /></Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-[5px] w-[120px]">
                            <Button className="w-full flex justify-start" variant="ghost"><SquareArrowUpRightIcon /> Details</Button>
                            <Button className="w-full flex justify-start" variant="ghost"><Pencil /> Edit</Button>
                            <Button className="w-full flex justify-start text-[red]" variant="ghost"><Trash2Icon /> Delete</Button>
                        </PopoverContent>
                    </Popover>
                </div>
                <div className="mt-auto">
                    <p className="md:text-[12px] text-[15px] font-[Mono]">15th Nov 14:35</p>
                </div>
            </div>



            








        </div>







    </div>)
}