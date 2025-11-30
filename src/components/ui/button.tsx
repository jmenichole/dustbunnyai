import * as React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
};

export function Button({ children, variant = "default", size = "md", className = "", ...props }: ButtonProps) {
  const sizeClasses: Record<string, string> = {
    sm: "px-2 py-1 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-3 text-base",
  };
  const base = `${sizeClasses[size] || sizeClasses.md} rounded transition disabled:bg-gray-400 disabled:cursor-not-allowed`;
  const variants: Record<string, string> = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "border border-gray-300 text-gray-700 bg-white hover:bg-gray-50",
    ghost: "bg-transparent text-gray-700 hover:bg-gray-100",
  };
  const classes = `${base} ${variants[variant] || variants.default} ${className}`.trim();
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
