"use client"
import { getResultsGroupedByExam } from "@/app/actions/examActions";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateTime } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ResultsPage() {

    const [groupedResults, setGroupedResults] = useState<any[] | null>(null)

    useEffect(() => {
        const init = async () => {
            const groupedResults = await getResultsGroupedByExam();
            setGroupedResults(groupedResults.groupedResults || null)
        }
        init()
    }, [])

    return (<div className="min-h-[100vh] md:p-[40px] p-[15px] flex flex-col gap-[20px] relative max-w-[800px] w-full mx-auto">

        <Link href="/admin/dashboard" className="z-[2] fixed md:top-[40px] md:left-[25px] top-[15px] left-[15px]">
            <Button variant="secondary">
                <ChevronLeft />
            </Button>
        </Link>

        <h1 className="text-[30px] font-[550] text-center">Results</h1>

        <div className="flex flex-col gap-[40px]">
            {groupedResults?.map((result, index) => (
                <div className="flex flex-col text-[14px]" key={index}>
                    <div className="flex flex-col gap-[5px]">
                        <h1 className="text-[20px]">{result.exam_title}</h1>
                        <p className="font-[500] text-[14px]">{result.subject}</p>
                        <p>Total Marks: {result.max_marks}</p>
                        <p>Submitted: {result.results.length}</p>
                    </div>
                    <div>
                        <Table className="mt-[20px]">
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Roll Number</TableHead>
                                    <TableHead>Student Name</TableHead>
                                    <TableHead>Marks</TableHead>
                                    <TableHead>Percentage</TableHead>
                                    <TableHead>Submitted At</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {result.results?.map((result: any, resultIndex: number) => (
                                    <TableRow key={`${index}-${resultIndex}`}>
                                        <TableCell>{result.student_id}</TableCell>
                                        <TableCell>{result.student_name}</TableCell>
                                        <TableCell>{result.marks_obtained}</TableCell>
                                        <TableCell>{result.percentage}</TableCell>
                                        <TableCell>{formatDateTime(result.submitted_at)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            ))}
        </div>
    </div>)
}