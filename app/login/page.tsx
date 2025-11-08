"use client"

import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { log } from "console"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

export default function LoginPage() {
    const router = useRouter();

    const [userType, setUserType] = useState<"student" | "admin">("student")
    const [authMode, setAuthMode] = useState<"login" | "signup">("login")


    const [loginEmail, setLoginEmail] = useState("")
    const [loginPassword, setLoginPassword] = useState("")


    return (<div className="h-[100vh] w-full flex">
        <div className="flex-1 flex flex-col md:p-[40px] p-[15px] justify-center">
            <h1 className="text-[27px] text-center">Log in to Pegasus</h1>

            <div className="flex justify-center gap-[10px] mt-[20px]">

                <Button variant={userType == "student" ? "default" : "secondary"} className={`${userType == "student" && "text-[white]"}`} onClick={() => setUserType("student")}>Student</Button>
                <Button variant={userType == "admin" ? "default" : "secondary"} className={`${userType == "admin" && "text-[white]"}`} onClick={() => setUserType("admin")}>Admin</Button>
            </div>

            <form onSubmit={async (e) => {
                e.preventDefault();
                if (!loginPassword.length || !loginEmail) return;
                const res = await fetch(`${process.env.NEXT_PUBLIC_URL!}/api/auth/login`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: loginEmail,
                        password: loginPassword,
                        role: userType
                    })
                })
                const loginData = await res.json()
                console.log(loginData)
                if (loginData.success == true) {
                    toast.success("Success")
                    if (loginData.deocodedAccessToken.role == "admin") {
                        router.push("/admin/dashboard")
                    }
                }
                if (loginData.error == "Invalid password") {
                    toast.error("Wrong Password")
                }
                if (loginData.error == "User not found") {
                    toast.error(`${userType == "admin" ? "Admin" : "Student"} not found`)
                }
            }}>


                <Card className="mt-[40px] max-w-[400px] w-full mx-auto">
                    <CardHeader>
                        <CardTitle>Account</CardTitle>
                        <CardDescription>
                            Log in as {userType == "student" ? "student and get access to your student's corner" : "admin and get access to all admin features and dashboard"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                        <div className="grid gap-3">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="yourEmail@gmail.com" />
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="password">Username</Label>
                            <Input id="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="your password" type="password" />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit">Log In</Button>
                    </CardFooter>
                </Card>
            </form>
        </div>

        <div className="flex-1 h-full md:flex hidden p-[15px]">
            <Image src={userType == "student" ? "/studentLoginWall.jpg" : "/adminLoginWall.jpg"} height={400} width={400} alt="" className="h-full w-full object-cover rounded-[15px]" unoptimized />

        </div>


    </div>)
}