import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface SaleTimerProps {
    endTime: string; // ISO string
    className?: string;
    variant?: "banner" | "product" | "card-overlay"; // banner = large overlay, product = smaller badge
}

const SaleTimer = ({ endTime, className, variant = "banner" }: SaleTimerProps) => {
    const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = +new Date(endTime) - +new Date();
            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                });
            } else {
                setTimeLeft(null); // Timer expired
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, [endTime]);

    if (!timeLeft) return null;

    if (variant === "product") {
        // Enhanced for product pages - bigger and more attractive with seconds
        return (
            <div className={cn("inline-flex items-center gap-1.5 bg-gradient-to-r from-destructive to-destructive/90 text-destructive-foreground px-3 py-2 rounded-sm shadow-lg", className)}>
                <div className="flex items-center gap-1 font-mono font-bold text-sm">
                    <div className="flex flex-col items-center">
                        <span className="text-base leading-none">{String(timeLeft.days).padStart(2, '0')}</span>
                        <span className="text-[8px] opacity-80 uppercase">D</span>
                    </div>
                    <span className="opacity-60">:</span>
                    <div className="flex flex-col items-center">
                        <span className="text-base leading-none">{String(timeLeft.hours).padStart(2, '0')}</span>
                        <span className="text-[8px] opacity-80 uppercase">H</span>
                    </div>
                    <span className="opacity-60">:</span>
                    <div className="flex flex-col items-center">
                        <span className="text-base leading-none">{String(timeLeft.minutes).padStart(2, '0')}</span>
                        <span className="text-[8px] opacity-80 uppercase">M</span>
                    </div>
                    <span className="opacity-60">:</span>
                    <div className="flex flex-col items-center animate-pulse">
                        <span className="text-base leading-none">{String(timeLeft.seconds).padStart(2, '0')}</span>
                        <span className="text-[8px] opacity-80 uppercase">S</span>
                    </div>
                </div>
            </div>
        );
    }

    if (variant === "card-overlay") {
        return (
            <div className={cn("absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-[2px] text-white py-2 px-3", className)}>
                <div className="flex flex-col items-center justify-center gap-1">
                    <span className="uppercase text-[10px] tracking-wider text-white/80">Sale ends in</span>
                    <div className="flex items-center gap-2 text-center text-xs font-mono font-bold">
                        <div>
                            <span>{String(timeLeft.days).padStart(2, '0')}</span>
                            <span className="text-[8px] font-normal text-white/60 ml-[1px]">D</span>
                        </div>
                        <span className="text-white/40">:</span>
                        <div>
                            <span>{String(timeLeft.hours).padStart(2, '0')}</span>
                            <span className="text-[8px] font-normal text-white/60 ml-[1px]">H</span>
                        </div>
                        <span className="text-white/40">:</span>
                        <div>
                            <span>{String(timeLeft.minutes).padStart(2, '0')}</span>
                            <span className="text-[8px] font-normal text-white/60 ml-[1px]">M</span>
                        </div>
                        <span className="text-white/40">:</span>
                        <div className="text-red-300">
                            <span>{String(timeLeft.seconds).padStart(2, '0')}</span>
                            <span className="text-[8px] font-normal text-white/60 ml-[1px]">S</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Banner variant (Overlay style)
    return (
        <div className={cn("w-full bg-black/80 backdrop-blur-sm text-white py-4 px-6 rounded-t-lg md:rounded-lg shadow-xl", className)}>
            <div className="flex flex-col items-center justify-center gap-2">
                <span className="uppercase text-xs tracking-widest text-white/70">Sale ends in</span>
                <div className="flex items-center gap-4 text-center">
                    <div>
                        <div className="text-2xl md:text-3xl font-bold font-mono leading-none">{String(timeLeft.days).padStart(2, '0')}</div>
                        <div className="text-[10px] uppercase text-white/50 mt-1">Days</div>
                    </div>
                    <div className="text-xl md:text-2xl font-light text-white/30">:</div>
                    <div>
                        <div className="text-2xl md:text-3xl font-bold font-mono leading-none">{String(timeLeft.hours).padStart(2, '0')}</div>
                        <div className="text-[10px] uppercase text-white/50 mt-1">Hrs</div>
                    </div>
                    <div className="text-xl md:text-2xl font-light text-white/30">:</div>
                    <div>
                        <div className="text-2xl md:text-3xl font-bold font-mono leading-none">{String(timeLeft.minutes).padStart(2, '0')}</div>
                        <div className="text-[10px] uppercase text-white/50 mt-1">Min</div>
                    </div>
                    <div className="text-xl md:text-2xl font-light text-white/30">:</div>
                    <div>
                        <div className="text-2xl md:text-3xl font-bold font-mono leading-none text-red-400">{String(timeLeft.seconds).padStart(2, '0')}</div>
                        <div className="text-[10px] uppercase text-white/50 mt-1">Sec</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SaleTimer;
