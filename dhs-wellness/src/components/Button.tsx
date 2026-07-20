import type { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  variant?: "primary" | "outline";
  className?: string;
}

const Button = ({ children, variant = "primary", className }: ButtonProps) => {
  const baseStyle =
    "px-6 py-2 rounded-full font-medium transition duration-300";

  const variants = {
    primary: "bg-[#F59E0B] text-white hover:opacity-90",
    outline:
      "border border-white text-white hover:bg-white hover:text-black",
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

export default Button;
