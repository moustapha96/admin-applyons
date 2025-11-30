import React from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "full" | "symbol" | "text";
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = "md",
  variant = "full",
  className = "",
}) => {
  const sizeClasses = {
    sm: "text-lg gap-1",
    md: "text-2xl gap-2",
    lg: "text-3xl gap-3",
  };

  return (
    <div className={`flex items-center ${sizeClasses[size]} ${className}`}>
      {variant !== "text" && (
        <div className="applyons-logo-symbol">
          <svg
            viewBox="0 0 100 100"
            className={`w-${size === "sm" ? "6" : size === "md" ? "8" : "10"} h-auto`}
          >
            <path
              fill="#e28743" // burnt-sienna
              d="M20,30 Q40,5 60,20 Q70,40 50,60 Q30,70 20,50 Z"
              stroke="#1e81b0" // eastern-blue
              strokeWidth="1.5"
            />
          </svg>
        </div>
      )}
      {variant !== "symbol" && (
        <span className="font-nunito font-extrabold text-applyons-catalina-blue dark:text-applyons-green-white">
          applyons
        </span>
      )}
    </div>
  );
};
