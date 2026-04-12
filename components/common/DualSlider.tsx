import React, { useRef, useEffect, useState } from 'react';

interface DualSliderProps {
    min: number;
    max: number;
    value: [number, number];
    onChange: (val: [number, number]) => void;
    colorClass: string;
}

export function DualSlider({ min, max, value, onChange, colorClass }: DualSliderProps) {
    const [minVal, setMinVal] = useState(value[0]);
    const [maxVal, setMaxVal] = useState(value[1]);
    const minValRef = useRef<HTMLInputElement>(null);
    const maxValRef = useRef<HTMLInputElement>(null);
    const range = useRef<HTMLDivElement>(null);

    // Convert to percentage
    const getPercent = (value: number) => Math.round(((value - min) / (max - min)) * 100);

    useEffect(() => {
        setMinVal(value[0]);
        setMaxVal(value[1]);
    }, [value]);

    useEffect(() => {
        if (maxValRef.current) {
            const minPercent = getPercent(minVal);
            const maxPercent = getPercent(maxValRef.current.valueAsNumber);
            if (range.current) {
                range.current.style.left = `${minPercent}%`;
                range.current.style.width = `${maxPercent - minPercent}%`;
            }
        }
    }, [minVal, getPercent]);

    useEffect(() => {
        if (minValRef.current) {
            const minPercent = getPercent(minValRef.current.valueAsNumber);
            const maxPercent = getPercent(maxVal);
            if (range.current) {
                range.current.style.width = `${maxPercent - minPercent}%`;
            }
        }
    }, [maxVal, getPercent]);

    const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Math.min(Number(e.target.value), maxVal - 1);
        setMinVal(value);
        onChange([value, maxVal]);
    };

    const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Math.max(Number(e.target.value), minVal + 1);
        setMaxVal(value);
        onChange([minVal, value]);
    };

    return (
        <div className="relative w-full h-10 flex items-center">
            <input
                type="range"
                min={min}
                max={max}
                value={minVal}
                onChange={handleMinChange}
                className="absolute w-full h-0 pointer-events-none appearance-none z-20"
                style={{ WebkitAppearance: 'none' }}
            />
            <input
                type="range"
                min={min}
                max={max}
                value={maxVal}
                onChange={handleMaxChange}
                className="absolute w-full h-0 pointer-events-none appearance-none z-20"
                style={{ WebkitAppearance: 'none' }}
            />
            <style jsx>{`
                input[type=range]::-webkit-slider-thumb {
                    pointer-events: all;
                    width: 20px;
                    height: 20px;
                    background-color: white;
                    border: 2px solid currentColor;
                    border-radius: 50%;
                    -webkit-appearance: none;
                    cursor: pointer;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.3);
                }
            `}</style>
            
            <div className="relative w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full z-10">
                <div 
                    ref={range} 
                    className={`absolute h-full rounded-full ${colorClass}`} 
                />
            </div>
        </div>
    );
}
