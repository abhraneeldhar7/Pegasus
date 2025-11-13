"use client"

import { getExamDetails, getExamQuestions, getExamWithQuestions, submitExam } from "@/app/actions/examActions"
import { getStudentAnswers, saveStudentAnswer } from "@/app/actions/studentActions"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useUser } from "@/context/userProvider"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"


interface examType {
    exam_id: number,
    title: string,
    description: string,
    total_marks: number,
    duration_minutes: number,
    subject: string,
    start_time: Date,
    end_time: Date
}

export default function ExamPAge() {
    const exam_id = usePathname().split("/")[3]

    const [questions, setQuestions] = useState<any[] | null>(null)
    const [examDetails, setExamDEtails] = useState<examType | null>(null)
    const [studentAnswers, setStudentAnswers] = useState<any[] | null>(null)

    const { user } = useUser();


    useEffect(() => {
        if (!user) return;

        const init = async () => {
            const examDetails = await getExamDetails(Number(exam_id));
            setExamDEtails(examDetails.exam)
            const questions = await getExamQuestions(Number(examDetails.exam.exam_id));

            const studentAnswers = (await getStudentAnswers(user.id, examDetails.exam.exam_id)).answers
            console.log("studnet asnwers: ", studentAnswers)
            const questionList = questions.questions.map((q: any) => {
                const existing = studentAnswers?.find(
                    (a: any) => a.question_id === q.question_id
                );
                return {
                    ...q,
                    selected_option: existing?.selected_option || null,
                    answer_id: existing?.answer_id || null,
                };
            });

            setQuestions(questionList);
            setStudentAnswers(studentAnswers);

        }
        init();
    }, [user])

    const [currentShowingQuestionIndex, setcurrentShowingQuestionIndex] = useState(0)


    const handleSelect = async (question_id: number, option: string) => {
        if (!user) return;
        setQuestions((prev: any) => {
            if (!prev) return prev;

            return (
                prev.map((q: any) =>
                    q.question_id === question_id
                        ? { ...q, selected_option: option }
                        : q
                )
            )
        }
        );
        const result = await saveStudentAnswer(user.id, question_id, option);
        if (result.success) {
            setQuestions((prev) => {
                if (!prev) return prev;
                return (
                    prev.map((q) =>
                        q.question_id === question_id
                            ? { ...q, answer_id: result.answer_id }
                            : q
                    )
                )
            }
            );
        } else {
            console.error("Failed to save answer:", result.message);
        }
    };


    const [showCheatingWarning, setShowcheatingWarning] = useState(false)

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                setShowcheatingWarning(true);
            }
        };

        const handleBlur = () => {
            setShowcheatingWarning(true);
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("blur", handleBlur);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("blur", handleBlur);
        };
    }, []);

    const router=useRouter();
    const [submitLoader, setSubmitLaoder] = useState(false);
    const handleSubmit = async () => {
        if (!user) return;
        setSubmitLaoder(true)
        await submitExam(user.id, Number(exam_id))
        setSubmitLaoder(false)
        router.push("/student")
    }

    return (<div className="md:px-[40px] px-[10px] py-[20px] flex md:gap-[40px] min-h-[100vh] md:flex-row flex-col-reverse">

        <Dialog open={showCheatingWarning} onOpenChange={setShowcheatingWarning}>
            <DialogContent>
                <DialogTitle>Please do not cheat</DialogTitle>
                <DialogDescription>Do not open any other tabs or use your phone to answer the questions</DialogDescription>
                <DialogFooter className="mt-[30px]">
                    <DialogClose asChild>
                        <Button variant="secondary">
                            I understand
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        <div className="flex-1 flex flex-col gap-[20px]">

            {questions &&
                <div className="p-[10px] rounded-[10px] border grid grid-cols-5 gap-[4px] md:w-[200px] h-fit">
                    {questions?.map((q, index) => (
                        <div className={`select-none cursor-pointer rounded-[5px] border flex justify-center items-center ${currentShowingQuestionIndex == index ? "bg-primary text-[14px]" : "bg-muted text-[12px]"} aspect-square`} onClick={() => setcurrentShowingQuestionIndex(index)} key={index}>{index + 1}</div>
                    ))}
                </div>
            }

            <div className="flex flex-col gap-[10px]">
                <div className="flex font-[400] leading-[1em] gap-[10px] text-[14px] items-center">
                    <h1 className="font-[500]">Total Questions</h1> {questions?.length}
                </div>
                <div className="flex font-[400] leading-[1em] gap-[10px] text-[14px] items-center">
                    <h1 className="font-[500]">Answered</h1> {studentAnswers?.length}
                </div>
            </div>

        </div>


        <div className="flex-3 flex flex-col gap-[30px]">
            <div className="flex flex-col gap-[10px] rounded-[20px] bg-muted p-[20px] border">
                <div>
                    <Label>Exam Name</Label>
                    <h1 className="text-[20px] leading-[2em]">{examDetails?.title}</h1>
                </div>
                <div>
                    <Label>Subject</Label>
                    <h1 className="text-[20px] leading-[2em]">{examDetails?.subject}</h1>
                </div>
            </div>

            {questions &&
                <div className="rounded-[10px] bg-muted shadow-md border px-[15px] py-[10px] w-full flex flex-col gap-[15px]">
                    <h1 className="text-[20px]">Question {currentShowingQuestionIndex + 1}</h1>
                    <p className="text-[17px]">{questions[currentShowingQuestionIndex].question_text}</p>

                    <div className="grid md:grid-cols-2 grid-cols-1 gap-[10px]">
                        {["a", "b", "c", "d"].map((opt) => {
                            const currentQuestion = questions?.[currentShowingQuestionIndex];
                            if (!currentQuestion) return null;

                            const optionText = currentQuestion[`option_${opt}` as keyof typeof currentQuestion];
                            const isSelected = currentQuestion.selected_option === opt;

                            return (
                                <div
                                    key={opt}
                                    onClick={() => handleSelect(currentQuestion.question_id, opt)}
                                    className={`border rounded-[10px] py-[20px] px-[20px] truncate shadow-sm cursor-pointer transition
          ${isSelected ? "bg-primary text-white" : "bg-background hover:bg-primary/10"}`}
                                >
                                    {optionText}
                                </div>
                            );
                        })}
                    </div>


                </div>
            }

            {questions &&
                <div className="mt-[50px] flex gap-[30px] justify-between">
                    {currentShowingQuestionIndex > 0 &&
                        <Button variant="secondary" onClick={() => { setcurrentShowingQuestionIndex(currentShowingQuestionIndex - 1) }}>Prev</Button>
                    }
                    <div></div>
                    {currentShowingQuestionIndex < questions.length - 1 &&
                        <Button variant="secondary" onClick={() => { setcurrentShowingQuestionIndex(currentShowingQuestionIndex + 1) }}>Next</Button>
                    }
                    {currentShowingQuestionIndex == questions.length - 1 &&
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button>Submit</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogTitle>
                                    Submit your answers?
                                </DialogTitle>
                                <DialogDescription>You will not be able to change answers after submitting</DialogDescription>
                                <DialogFooter className="mt-[30px] md:gap-[30px]">
                                    <DialogClose>Cancel</DialogClose>
                                    <Button loading={submitLoader} onClick={() => handleSubmit()}>
                                        Confirm
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    }
                </div>
            }


        </div>

        <div className="flex-1">

        </div>



    </div>)
}