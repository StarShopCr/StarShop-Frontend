import * as React from "react";

interface TextareaProps extends React.ComponentProps<"textarea"> {
  className?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, value, onChange, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        value={value}
        onChange={onChange}
        className={`w-full bg-[#0E0E1B] border-[1px] border-[rgba(168,85,247,0.2)] text-[#E2E8F0] p-3 rounded-md outline-none focus:border-[#A855F7] focus:ring-0 transition resize-none ${className}`}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea };
