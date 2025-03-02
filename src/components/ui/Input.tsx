import { FC } from "react";
import { LucideIcon } from "lucide-react";

interface InputProps {
  label?: string;
  id: string;
  type: string;
  placeholder?: string;
  name: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: LucideIcon;
  className?: string;
  labelClassName?: string;
  centered?: boolean;
  containerClassName?: string;
}

const Input: FC<InputProps> = ({
  label,
  id,
  type,
  placeholder,
  name,
  value,
  onChange,
  icon: Icon,
  className = "",
  labelClassName = "text-xs font-semibold tracking-wide text-white uppercase",
  centered = false,
  containerClassName = "",
}) => {
  return (
    <div className={`flex flex-col items-start gap-2 ${containerClassName}`}>
      {label && (
        <label htmlFor={id} className={labelClassName}>
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white" />
        )}
        <input
          className={`w-full bg-[#0E0E1B] border border-[rgba(168,85,247,0.2)]
            text-[#9CA3AF] p-3 rounded-md outline-none transition
            focus:border-[#A855F7] focus:ring-2 focus:ring-[#A855F7]
            placeholder-gray-500 ${Icon ? "pl-14" : "pl-3"} ${className}`}
          id={id}
          type={type}
          placeholder={placeholder}
          name={name}
          value={value}
          onChange={onChange}
        />
      </div>
    </div>
  );
};

export default Input;
