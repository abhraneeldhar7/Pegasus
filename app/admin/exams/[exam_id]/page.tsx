"use client"
import { getDepartmentTableData } from "@/app/actions/departmentActions";
import { addQuestion, deleteQuestion, getExamWithQuestions, saveExam, saveQuestions } from "@/app/actions/examActions";
import ClockComponent from "@/components/clock";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { departmentType, examType, questionType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { PopoverClose } from "@radix-ui/react-popover";
import { Check, ChevronDownIcon, ChevronLeft, ChevronsUpDown, PlusIcon, SaveIcon, Trash2Icon, TrashIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
        toast.info("Wait...")
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
        await addQuestion(newQ)
        setQuestions((prev) => [...prev || [], newQ])
        toast.info("Added question")

        if (!questions || !examDetails) return;
        await saveQuestions(questions)
        await saveExam(examDetails);

    }

    const [departments, setDepartments] = useState<departmentType[] | null>(null)

    const handleChange = (questionId: number, field: keyof questionType, value: string) => {
        setQuestions((prev) => {
            if (!prev) return [];
            return prev.map((q) =>
                q.question_id === questionId ? { ...q, [field]: value } : q
            );
        });
    };

    const handleDeleteQuestion = async (index: number) => {
        if (!questions) return;

        toast.info("Wait...")
        const qToDelete = questions[index];
        const updated = questions.filter((_, i) => i !== index);

        if (qToDelete?.question_id) {
            const res = await deleteQuestion(qToDelete.question_id);
            if (!res.success) {
                toast.error("Failed to delete question");
                return;
            }
        }
        setQuestions(updated);
        toast.info("Deleted");

        if (!questions || !examDetails) return;
        await saveQuestions(questions)
        await saveExam(examDetails);
    };

    useEffect(() => {
        console.log(questions)
    }, [questions])

    const [saveLoader, setSaveLoader] = useState(false);

    const router = useRouter();

    const handleSave = async () => {
        if (!questions || !examDetails) return;

        setSaveLoader(true)
        const res = await saveQuestions(questions)
        const res2 = await saveExam(examDetails);

        if (res.success && res2.success) {
            toast.success("Questions saved successfully!")
            console.log("Inserted IDs:", res.insertedIds)
        } else {
            toast.error("Failed to save questions")
        }
        setSaveLoader(false)
    }

    return (<div className="min-h-[100vh] max-w-[700px] w-full mx-auto md:py-[40px] py-[55px] px-[15px]">

        <Link href="/admin/exams" className="z-[2] fixed md:top-[40px] md:left-[25px] top-[15px] left-[15px]">
            <Button variant="secondary">
                <ChevronLeft />
            </Button>
        </Link>

        <Button className="z-[2] fixed md:top-[40px] md:right-[25px] top-[15px] right-[15px]" loading={saveLoader} onClick={() => { handleSave() }}><SaveIcon /> Save</Button>


        <div className="flex gap-[20px] items-start justify-between">
            <div className="flex-1">
                <div className="flex justify-between w-full flex-wrap">
                    <h1 className="text-[32px] font-[400]">Exam Details</h1>
                </div>


                {examDetails &&
                    <div className="flex flex-col gap-[25px] mt-[30px]">

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
                                        className="w-[300px] justify-between"
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

                        <div className="flex gap-[30px]">
                            <div className="flex flex-col gap-[10px] w-fit justify-center">
                                <Label>Duration</Label>
                                <Input className="w-[60px]" type="number" value={examDetails.duration_minutes} onChange={(e) => {
                                    if (Number(e.target.value) < 0) return
                                    setExamDetails(prev => {
                                        if (!prev) return prev;
                                        return {
                                            ...prev,
                                            duration_minutes: Number(e.target.value)
                                        }
                                    })
                                }} />
                            </div>

                            <div className="flex flex-col gap-[10px] w-fit justify-center">
                                <Label>Total Marks</Label>
                                <h1 className="text-center text-[22px]">{questions?.length}</h1>
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
                    <div key={index} className="bg-muted dark:bg-muted/40 border px-[18px] py-[14px] shadow-sm rounded-[15px] flex flex-col gap-[15px]">

                        <div className="flex justify-between items-start">
                            <h3 className="font-[500] text-[17px]">Question {index + 1}</h3>
                            <Button
                                className="dark:hover:bg-[unset]"
                                variant="ghost"
                                onClick={() => handleDeleteQuestion(index)}
                            >
                                <Trash2Icon color="red" />
                            </Button>
                        </div>

                        <Textarea
                            value={q.question_text}
                            onChange={(e) => handleChange(q.question_id, "question_text", e.target.value)}
                            placeholder="Enter question text"
                            className="rounded-[10px] h-[100px] bg-background"
                        />

                        <div className="grid grid-cols-2 gap-3">
                            <Input
                                className="bg-background"
                                value={q.option_a}
                                onChange={(e) => handleChange(q.question_id, "option_a", e.target.value)}
                                placeholder="Option A"
                            />
                            <Input
                                className="bg-background"
                                value={q.option_b}
                                onChange={(e) => handleChange(q.question_id, "option_b", e.target.value)}
                                placeholder="Option B"
                            />
                            <Input
                                className="bg-background"
                                value={q.option_c}
                                onChange={(e) => handleChange(q.question_id, "option_c", e.target.value)}
                                placeholder="Option C"
                            />
                            <Input
                                className="bg-background"
                                value={q.option_d}
                                onChange={(e) => handleChange(q.question_id, "option_d", e.target.value)}
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
                                                handleChange(q.question_id, "correct_option", option)
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
                        variant="outline"
                        onClick={handleAddQuestion}
                        className="w-[160px] h-[50px] mx-auto hover:bg-muted/40 shadow-sm"
                    >
                        + Add Question
                    </Button>
                }

                {/* For debugging — remove this after testing */}
                {/* <pre>{JSON.stringify(questions, null, 2)}</pre> */}
            </div>
        </div>


        <div className="mt-[50px] text-[17px] opaicty-[0.8] flex flex-col gap-[20px]">
            <div>
                <h1 className="text-[17px] font-[500]">
                    Saving an Exam
                </h1>
                <p className="opacity-[0.8] text-[14px] font-[450]">
                    Once you've filled in all the exam details, click the <span className="text-primary font-[500]">Save</span> button to store your exam. This ensures all your entered information is safely saved to the system.
                </p>
            </div>

            <div>
                <h1 className="text-[17px] font-[500]">
                    Adding Questions
                </h1>
                <p className="opacity-[0.8] text-[14px] font-[450]">
                    To create new questions for the exam, simply click the <span className="text-primary font-[500]">Add Question</span> button. You can add as many questions as needed before publishing.
                </p>
            </div>

            <div>
                <h1 className="text-[17px] font-[500]">
                    Deleting an Exam
                </h1>
                <p className="opacity-[0.8] text-[14px] font-[450]">
                    If you wish to remove an existing exam, use the <span className="text-primary font-[500]">Delete Exam</span> button. This action will permanently remove the exam from the system.
                </p>
            </div>

            <div>
                <h1 className="text-[17px] font-[500]">
                    Publishing an Exam
                </h1>
                <p className="opacity-[0.8] text-[14px] font-[450]">
                    When your exam is ready to go live, click the <span className="text-primary font-[500]">Publish</span> button. The exam will then be visible to students and marked as Live.
                </p>
            </div>
        </div>

        <div className="mt-[50px] flex gap-[20px] justify-between">
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="secondary" className="text-[red]">Delete this exam</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogTitle>
                        Delete this exam?
                    </DialogTitle>
                    <DialogDescription>This will delete the exam and it's questions. Students will not be able to attempt it.</DialogDescription>
                    <DialogFooter className="md:gap-[30px]">
                        <DialogClose>Cancel</DialogClose>
                        <Button>
                            Delete Exam
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>






            <Dialog>
                <DialogTrigger asChild>
                    <Button >Publish</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogTitle>Publish exam?</DialogTitle>
                    <DialogDescription>This will set the exam to live and students can attempt and submit their answers</DialogDescription>

                    <DialogFooter className="md:gap-[30px]">
                        <DialogClose>Cancel</DialogClose>
                        <Button>
                            Publish
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    </div >)
}