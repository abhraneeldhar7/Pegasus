'use client';

import { useEffect, useState } from 'react';

export default function ClockComponent() {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000 * 30); // update every 30 seconds
        return () => clearInterval(timer);
    }, []);

    const hours = time.getHours().toString().padStart(2, '0');
    const minutes = time.getMinutes().toString().padStart(2, '0');

    const day = time.toLocaleString('en-US', { weekday: 'long' });
    const date = time.getDate();
    const month = time.toLocaleString('en-US', { month: 'long' });

    return (
        <div className="flex flex-col items-center text-center bg-white/5 p-[15px] rounded-2xl shadow-md backdrop-blur-sm w-[160px] h-[100px] justify-between ">
            <div className="text-4xl font-semibold tracking-wide text-primary font-[Mono]">
                {hours}:{minutes}
            </div>
            <div className="flex justify-between w-full leading-[1em] text-[14px] opacity-[0.7]">
                <p>
                    {day.slice(0, 3)}
                </p>
                <p> {date} {month.slice(0, 3)}</p>

            </div>
        </div>
    );
}
