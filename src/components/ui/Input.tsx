import { FC } from "react";
import { LucideIcon } from "lucide-react";

interface InputProps {
  label: string;
  id: string;
  type: string;
  placeholder?: string;
  name: string;
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
  icon: Icon,
  className = "",
  labelClassName = "text-lg text-white",
  centered = true,
  containerClassName = "",
}) => {
  return (
    <div className="flex flex-col items-start space-y-2">
      <label className="form-label" htmlFor={id}>
        {label}
      </label>
      <input
        className="form-input-field"
        id={id}
        type={type}
        placeholder={placeholder}
        name={name}
      />
    </div>
  );
};

export default Input;
