"use client"

import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useState } from "react"

export default function LoginPage() {

    const [userType, setUserType] = useState<"student" | "admin">("student")
    const [authMode, setAuthMode] = useState<"login" | "signup">("login")

    return (<div className="h-[100vh] w-full flex">
        <div className="flex-1 flex flex-col md:p-[40px] p-[15px]">
            <h1 className="text-[24px] text-center">Log in to Pegasus</h1>

            {authMode == "login" && <div>
                
                </div>}
        </div>

        <div className="flex-1 h-full md:flex hidden p-[15px]">
            <Image src={userType == "student" ? "/studentLoginWall.jpg" : "/adminLoginWall.jpg"} unoptimized height={400} width={400} alt="" className="h-full w-full object-cover rounded-[15px]" />

        </div>


    </div>)
}