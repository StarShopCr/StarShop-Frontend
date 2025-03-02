import { FC } from "react";
import { LucideIcon } from "lucide-react";
interface SelectProps {
  label: string;
  id: string;
  name: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  icon?: LucideIcon;
}
const Select: FC<SelectProps> = ({
  label,
  id,
  name,
  options,
  placeholder = "Select an option",
  icon: Icon,
}) => {
  return (
    <div className="flex flex-col items-start space-y-2">
      <label className="form-label" htmlFor={id}>
        {label}
      </label>
      <select className="form-input-field" id={id} name={name} defaultValue="">
        <option value="" disabled className="text-gray-400">
          {placeholder}
        </option>
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="bg-[#1a1b26] text-white"
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;
