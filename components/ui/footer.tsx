import { AnimatedThemeToggler } from "./animated-theme-toggler";

export default function FooterPage() {
    return (<div className="w-full md:p-[40px] p-[15px] flex justify-between">

        <div className="flex flex-col">
            <h1 className="text-[30px]">Pegasus</h1>
            <p className="opacity-[0.5] text-[12px]">by</p>
            <p className="mt-[5px] text-[14px] opacity-[0.8] font-[300]">Abhraneel Dhar</p>
            <p className="text-[14px] opacity-[0.8] font-[300]">Abhinandan Rakshit</p>
        </div>

        <div className="flex gap-[10px] items-end md:items-center md:flex-row flex-col-reverse">
<p className="text-[14px] opacity-[0.5] leading-[1em]">Change Theme</p>
            <AnimatedThemeToggler />
        </div>
    </div>)
}