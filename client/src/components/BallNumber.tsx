import { FC } from "react";
import { cn } from "@/lib/utils";

interface BallNumberProps {
  number: number;
  highlight?: boolean;
  size?: "sm" | "md" | "lg";
  colorIndex?: number;
}

const colorClasses = [
  "bg-[hsl(var(--chart-1))] text-white", // Orange
  "bg-[hsl(var(--chart-2))] text-white", // Blue
  "bg-[hsl(var(--chart-3))] text-black", // Green
  "bg-[hsl(var(--chart-4))] text-white", // Pink
  "bg-[hsl(var(--chart-5))] text-black", // Cyan
];

const BallNumber: FC<BallNumberProps> = ({
  number,
  highlight = false,
  size = "md",
  colorIndex,
}) => {
  // Format the number to always be 2 digits
  const formattedNumber = number < 10 ? `0${number}` : `${number}`;
  
  // Determine the color based on the index or highlight status
  let ballClass = "";
  
  if (highlight) {
    ballClass = "bg-primary text-white font-bold";
  } else if (colorIndex !== undefined && colorIndex >= 0 && colorIndex < colorClasses.length) {
    ballClass = colorClasses[colorIndex];
  } else {
    // Default color rotation based on number modulo 5
    ballClass = colorClasses[number % 5];
  }
  
  // Size classes
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
  };
  
  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-mono font-medium",
        ballClass,
        sizeClasses[size]
      )}
    >
      {formattedNumber}
    </div>
  );
};

export default BallNumber;
