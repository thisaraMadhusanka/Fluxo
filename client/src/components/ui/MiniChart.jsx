import React, { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

const data = [
    { label: "Mon", value: 65 },
    { label: "Tue", value: 85 },
    { label: "Wed", value: 45 },
    { label: "Thu", value: 95 },
    { label: "Fri", value: 70 },
    { label: "Sat", value: 55 },
    { label: "Sun", value: 80 },
]

export function MiniChart() {
    const [hoveredIndex, setHoveredIndex] = useState(null)
    const [displayValue, setDisplayValue] = useState(null)
    const [isHovering, setIsHovering] = useState(false)
    const containerRef = useRef(null)
    const maxValue = Math.max(...data.map((d) => d.value))

    useEffect(() => {
        if (hoveredIndex !== null) {
            setDisplayValue(data[hoveredIndex].value)
        }
    }, [hoveredIndex])

    const handleContainerEnter = () => setIsHovering(true)
    const handleContainerLeave = () => {
        setIsHovering(false)
        setHoveredIndex(null)
        setTimeout(() => {
            setDisplayValue(null)
        }, 150)
    }

    return (
        <div
            ref={containerRef}
            onMouseEnter={handleContainerEnter}
            onMouseLeave={handleContainerLeave}
            className="group relative w-full h-[320px] p-6 rounded-3xl bg-white border border-gray-100 shadow-sm transition-all duration-500 hover:shadow-md flex flex-col gap-4"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(242,107,58,0.5)]" />
                    <span className="text-sm font-bold text-gray-500 tracking-wide uppercase">Weekly Activity</span>
                </div>
                <div className="relative h-7 flex items-center">
                    <span
                        className={cn(
                            "text-2xl font-black tabular-nums transition-all duration-300 ease-out text-gray-900",
                            isHovering && displayValue !== null ? "opacity-100" : "opacity-30",
                        )}
                    >
                        {displayValue !== null ? displayValue : "85"}
                        <span
                            className={cn(
                                "text-sm font-bold text-gray-400 ml-0.5 transition-opacity duration-300",
                                displayValue !== null ? "opacity-100" : "opacity-0",
                            )}
                        >
                            %
                        </span>
                    </span>
                </div>
            </div>

            {/* Chart */}
            <div className="flex items-end gap-2 h-full pb-2">
                {data.map((item, index) => {
                    const heightPx = (item.value / maxValue) * 160 // Scaled for height
                    const isHovered = hoveredIndex === index
                    const isNeighbor = hoveredIndex !== null && (index === hoveredIndex - 1 || index === hoveredIndex + 1)
                    const isAnyHovered = hoveredIndex !== null

                    return (
                        <div
                            key={item.label}
                            className="relative flex-1 flex flex-col items-center justify-end h-full group/bar"
                            onMouseEnter={() => setHoveredIndex(index)}
                        >
                            {/* Bar */}
                            <div
                                className={cn(
                                    "w-full max-w-[40px] rounded-2xl cursor-pointer transition-all duration-300 ease-out origin-bottom",
                                    isHovered
                                        ? "bg-primary shadow-[0_4px_20px_-4px_rgba(242,107,58,0.5)]"
                                        : isNeighbor
                                            ? "bg-primary/40"
                                            : isAnyHovered
                                                ? "bg-gray-100"
                                                : "bg-gray-100 group-hover/bar:bg-gray-200",
                                )}
                                style={{
                                    height: `${item.value}%`,
                                    transform: isHovered ? "scaleX(1.1) scaleY(1.02)" : isNeighbor ? "scaleX(1.05)" : "scaleX(1)",
                                }}
                            />

                            {/* Label */}
                            <span
                                className={cn(
                                    "text-xs font-bold mt-3 transition-all duration-300",
                                    isHovered ? "text-primary scale-110" : "text-gray-400",
                                )}
                            >
                                {item.label.charAt(0)}
                            </span>

                            {/* Tooltip */}
                            <div
                                className={cn(
                                    "absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-xl bg-gray-900 text-white text-xs font-bold transition-all duration-200 whitespace-nowrap shadow-xl z-10",
                                    isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none",
                                )}
                            >
                                {item.value}%
                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
