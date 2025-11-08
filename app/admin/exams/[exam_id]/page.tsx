"use client"
import { getDepartmentTableData } from "@/app/actions/departmentActions";
import { addQuestion, deleteQuestion, getExamWithQuestions, saveExam, saveQuestions } from "@/app/actions/examActions";
import ClockComponent from "@/components/clock";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { departmentType, examType, questionType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { PopoverClose } from "@radix-ui/react-popover";
import { Check, ChevronDownIcon, ChevronLeft, ChevronsUpDown, PlusIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ExamDetailsPage() {
    const exam_id = usePathname().split("/")[3];


    const [examDetails, setExamDetails] = useState<examType | null>(null)
    const [questions, setQuestions] = useState<questionType[] | null>(null)


    useEffect(() => {
        const init = async () => {
            const examQuestionRes = await getExamWithQuestions(Number(exam_id));
            setExamDetails(examQuestionRes.exam);
            setQuestions(examQuestionRes.questions);
            console.log(examQuestionRes)


            const departmentRes = await getDepartmentTableData();
            setDepartments(departmentRes)

        }
        init();
    }, [])

    const handleAddQuestion = async () => {
        const newQ: questionType = {
            exam_id: Number(exam_id),
            question_id: questions?.length || 0 + 1,
            question_text: "",
            option_a: "",
            option_b: "",
            option_c: "",
            option_d: "",
            correct_option: "",
        }

        // 1. Add locally (for instant UI)
        setQuestions((prev) => [...prev || [], newQ])


        const res = await addQuestion(newQ)

        if (res?.success && res?.insertedId) {
            setQuestions((prev) => {
                if (!prev || prev.length === 0) {
                    return [{ ...newQ, quesion_id: res.insertedId }]
                }
                const updated = [...prev]
                const lastIndex = updated.length - 1
                updated[lastIndex] = { ...updated[lastIndex], question_id: res.insertedId }
                return updated
            })
        }

    }

    const [departments, setDepartments] = useState<departmentType[] | null>(null)

    const handleChange = (index: number, field: keyof questionType, value: string) => {
        const updated = [...questions || []]
        updated[index] = { ...updated[index], [field]: value }
        setQuestions(updated)
    }

    const handleDeleteQuestion = async (index: number) => {
        if (!questions) return;

        const qToDelete = questions[index];
        const updated = questions.filter((_, i) => i !== index);
        setQuestions(updated);

        // ✅ Only delete from DB if it exists there
        if (qToDelete?.question_id) {
            const res = await deleteQuestion(qToDelete.question_id);
            if (!res.success) {
                toast.error("Failed to delete question");
                return;
            }
        }
        toast.info("Deleted")
    };

    const [saveLoader, setSaveLoader] = useState(false);


    const handleSave = async () => {
        if (!questions || !examDetails) return;

        setSaveLoader(true)
        const res = await saveQuestions(questions)

        if (res.success) {
            toast.success("Questions saved successfully!")
            console.log("Inserted IDs:", res.insertedIds)
        } else {
            toast.error("Failed to save questions")
        }

        const res2 = await saveExam(examDetails);
        setSaveLoader(false)
    }

    return (<div className="min-h-[100vh] max-w-[800px] w-full mx-auto md:py-[40px] py-[55px] px-[15px]">

        <Link href="/admin/dashboard" className="z-[2] fixed md:top-[40px] md:left-[25px] top-[15px] left-[15px]">
            <Button variant="secondary">
                <ChevronLeft />
            </Button>
        </Link>

        <div className="flex gap-[20px] items-start justify-between">
            <div className="flex-1">
                <div className="flex justify-between w-full flex-wrap">
                    <h1 className="text-[32px] font-[400]">Exam Details</h1>
                </div>


                {examDetails &&
                    <div className="flex flex-col gap-[15px] mt-[30px]">

                        <div className="flex flex-col gap-[5px]">
                            <Label>Exam name</Label>
                            <Input placeholder="exam name..." value={examDetails.title}
                                onChange={(e) => {
                                    setExamDetails(prev => {
                                        if (!prev) return prev;
                                        return {
                                            ...prev,
                                            title: e.target.value
                                        }
                                    })
                                }}
                                className="max-w-[400px]" />
                        </div>

                        <div className="flex flex-col gap-[5px]">
                            <Label>Description</Label>
                            <Input placeholder="exam description..." value={examDetails.description}
                                onChange={(e) => {
                                    setExamDetails(prev => {
                                        if (!prev) return prev;
                                        return {
                                            ...prev,
                                            description: e.target.value
                                        }
                                    })
                                }}
                                className="max-w-[400px]" />
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

                                            {examDetails.department_id
                                                ? departments?.find(
                                                    (dept) => dept.department_id === examDetails.department_id
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
                                                    setExamDetails(prev => {
                                                        if (!prev) return prev;
                                                        return {
                                                            ...prev,
                                                            department_id: selectedId
                                                        }
                                                    })

                                                }}
                                                className="truncate w-full"
                                            >
                                                <p className="max-w-[240px] truncate">
                                                    {dept.name}
                                                </p>
                                                <Check
                                                    className={cn(
                                                        "ml-auto",
                                                        dept.department_id === examDetails.department_id
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


                        <div className="flex flex-col gap-[5px]">
                            <Label>Start Time</Label>
                            <div className="flex gap-4">
                                <div className="flex flex-col gap-3">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                id="date-picker"
                                                className="w-32 justify-between font-normal"
                                            >
                                                {examDetails.start_time ? examDetails.start_time.toLocaleDateString() : "Select date"}
                                                <ChevronDownIcon />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={examDetails.start_time || undefined}
                                                captionLayout="dropdown"
                                                onSelect={(date: Date | undefined) => {
                                                    if (!date) return

                                                    // preserve old time if it exists
                                                    let updatedDate = new Date(date)
                                                    if (examDetails.start_time) {
                                                        updatedDate.setHours(
                                                            examDetails.start_time.getHours(),
                                                            examDetails.start_time.getMinutes(),
                                                            examDetails.start_time.getSeconds()
                                                        )
                                                    }

                                                    setExamDetails(prev => {
                                                        if (!prev) return prev;
                                                        return {
                                                            ...prev,
                                                            start_time: updatedDate
                                                        }
                                                    })
                                                }}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <Input
                                        type="time"
                                        id="time-picker"
                                        step="1"
                                        defaultValue="00:00:00"
                                        onChange={(e) => {
                                            if (!examDetails.start_time) return

                                            // parse time safely
                                            const parts = e.target.value.split(":").map((v) => Number(v));
                                            const hours = Number.isFinite(parts[0]) ? parts[0] : 0;
                                            const minutes = Number.isFinite(parts[1]) ? parts[1] : 0;
                                            const seconds = Number.isFinite(parts[2]) ? parts[2] : 0;

                                            // update date in one call (avoids leaving seconds undefined)
                                            const updatedDate = new Date(examDetails.start_time);
                                            updatedDate.setHours(hours, minutes, seconds);

                                            setExamDetails(prev => {
                                                if (!prev) return prev;
                                                return {
                                                    ...prev,
                                                    start_time: updatedDate
                                                }
                                            })
                                        }}
                                        className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                                    />
                                </div>
                            </div>
                        </div>




                        <div className="flex flex-col gap-[5px]">
                            <Label>End Time</Label>
                            <div className="flex gap-4">
                                <div className="flex flex-col gap-3">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                id="date-picker"
                                                className="w-32 justify-between font-normal"
                                            >
                                                {examDetails.end_time ? examDetails.end_time.toLocaleDateString() : "Select date"}
                                                <ChevronDownIcon />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={examDetails.end_time || undefined}
                                                captionLayout="dropdown"
                                                onSelect={(date: Date | undefined) => {
                                                    if (!date) return

                                                    // preserve old time if it exists
                                                    let updatedDate = new Date(date)
                                                    if (examDetails.end_time) {
                                                        updatedDate.setHours(
                                                            examDetails.end_time.getHours(),
                                                            examDetails.end_time.getMinutes(),
                                                            examDetails.end_time.getSeconds()
                                                        )
                                                    }
                                                    setExamDetails(prev => {
                                                        if (!prev) return prev;
                                                        return {
                                                            ...prev,
                                                            end_time: updatedDate
                                                        }
                                                    })
                                                }}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <Input
                                        type="time"
                                        id="time-picker"
                                        step="1"
                                        defaultValue="00:00:00"
                                        onChange={(e) => {
                                            if (!examDetails.end_time) return

                                            // parse time safely
                                            const parts = e.target.value.split(":").map((v) => Number(v));
                                            const hours = Number.isFinite(parts[0]) ? parts[0] : 0;
                                            const minutes = Number.isFinite(parts[1]) ? parts[1] : 0;
                                            const seconds = Number.isFinite(parts[2]) ? parts[2] : 0;

                                            // update date in one call (avoids leaving seconds undefined)
                                            const updatedDate = new Date(examDetails.end_time);
                                            updatedDate.setHours(hours, minutes, seconds);
                                            setExamDetails(prev => {
                                                if (!prev) return prev;
                                                return {
                                                    ...prev,
                                                    end_time: updatedDate
                                                }
                                            })
                                        }}
                                        className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                }
            </div>

            <div className="hidden md:block">
                <ClockComponent />
            </div>

        </div>




        <div className="mt-[40px] w-full">
            <h1 className="text-[20px]">Questions</h1>

            <div className="flex flex-col gap-[20px] mt-[10px]">
                {questions?.map((q, index) => (
                    <div key={index} className="bg-muted border px-[18px] py-[14px] shadow-sm rounded-[15px] flex flex-col gap-[15px]">

                        <div className="flex justify-between items-start">
                            <h3 className="font-[500] font-[Poppins] text-[16px]">Question {index + 1}</h3>
                            <Button
                                variant="destructive"
                                onClick={() => handleDeleteQuestion(index)}
                            >
                                Delete
                            </Button>
                        </div>

                        <Textarea
                            value={q.question_text}
                            onChange={(e) => handleChange(index, "question_text", e.target.value)}
                            placeholder="Enter question text"
                            className="rounded-[10px] h-[100px]"
                        />

                        <div className="grid grid-cols-2 gap-3">
                            <Input
                                value={q.option_a}
                                onChange={(e) => handleChange(index, "option_a", e.target.value)}
                                placeholder="Option A"
                            />
                            <Input
                                value={q.option_b}
                                onChange={(e) => handleChange(index, "option_b", e.target.value)}
                                placeholder="Option B"
                            />
                            <Input
                                value={q.option_c}
                                onChange={(e) => handleChange(index, "option_c", e.target.value)}
                                placeholder="Option C"
                            />
                            <Input
                                value={q.option_d}
                                onChange={(e) => handleChange(index, "option_d", e.target.value)}
                                placeholder="Option D"
                            />
                        </div>

                        <div className="flex flex-col gap-[10px]">
                            <Label>Correct Option</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant={q.correct_option === "" ? `outline` : `default`} className="w-fit h-[40px]">
                                        {q.correct_option === "" ? "Select correct option" : q.correct_option}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="p-[5px] w-[120px]">
                                    {["A", "B", "C", "D"].map((option, i) => (
                                        <PopoverClose asChild key={i}>
                                            <Button variant="ghost" className="flex justify-start w-full" onClick={() => {
                                                handleChange(index, "correct_option", option)
                                            }}>Option {option}</Button>
                                        </PopoverClose>
                                    ))}
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                ))}

                {questions && questions.length == 0 && <div className="h-[200px] border bg-accent flex items-center justify-center w-full rounded-[15px] select-none cursor-pointer gap-[15px] font-[500] text-[black] shadow-lg hover:scale-[0.98] transition-all duration-300" onClick={handleAddQuestion}>
                    <p>Add Questions</p> <PlusIcon size={19} />
                </div>}

                {questions && questions.length > 0 &&
                    <Button
                        onClick={handleAddQuestion}
                        className="w-[150px]"
                    >
                        + Add Question
                    </Button>
                }

                {/* For debugging — remove this after testing */}
                {/* <pre>{JSON.stringify(questions, null, 2)}</pre> */}
            </div>
        </div>



        <div className="mt-[50px] flex justify-end">
            <Button loading={saveLoader} onClick={() => { handleSave() }}>Confirm</Button>
        </div>
    </div>)
}