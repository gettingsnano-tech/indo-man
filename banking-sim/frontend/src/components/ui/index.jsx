import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Button Component
export const Button = ({ children, variant = 'primary', className, ...props }) => {
    const base = "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50 disabled:opacity-50 disabled:pointer-events-none";
    const variants = {
        primary: "bg-[#2563EB] text-white hover:bg-[#2563EB]/90 px-4 py-2",
        secondary: "bg-[#1E1E2A] text-white hover:bg-[#1E1E2A]/80 border border-gray-800 px-4 py-2",
        danger: "bg-[#EF4444] text-white hover:bg-[#EF4444]/90 px-4 py-2",
        ghost: "hover:bg-[#1E1E2A] text-gray-300 hover:text-white px-4 py-2"
    };
    return (
        <button className={cn(base, variants[variant], className)} {...props}>
            {children}
        </button>
    );
};

// Card Component
export const Card = ({ children, className }) => (
    <div className={cn("bg-[#111118] border border-[#1E1E2A] rounded-xl overflow-hidden", className)}>
        {children}
    </div>
);

// Input Component
export const Input = ({ label, className, ...props }) => (
    <div className="space-y-1">
        {label && <label className="text-sm font-medium text-gray-300">{label}</label>}
        <input 
            className={cn("w-full bg-[#0A0A0F] border border-[#1E1E2A] rounded-lg px-4 py-2.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-colors", className)} 
            {...props} 
        />
    </div>
);

// Badge Component
export const Badge = ({ children, variant = 'default', className }) => {
    const variants = {
        default: "bg-gray-800 text-gray-300",
        success: "bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20",
        warning: "bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20",
        danger: "bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20",
        info: "bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/20",
    };
    return (
        <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider", variants[variant], className)}>
            {children}
        </span>
    );
};

// Spinner
export const Spinner = ({ className }) => (
    <div className={cn("animate-spin rounded-full border-t-2 border-b-2 border-[#2563EB] h-5 w-5", className)}></div>
);

// Table Base
export const Table = ({ children, className }) => (
    <div className="w-full overflow-x-auto rounded-lg border border-[#1E1E2A]">
        <table className={cn("w-full text-left text-sm text-gray-400", className)}>
            {children}
        </table>
    </div>
);
