import { useState } from "react"

type FormState<T> = {
  [K in keyof T]: T[K];
};

const useFormSetter = <T extends Record<string, any>>(initialState: T) => {
    const [formState, setFormState] = useState<FormState<T>>(initialState);
  
    const createFormSetter = (fieldName: keyof T) => {
        const setter = (fieldValue: T[keyof T]) => {
            const newFormState: FormState<T> = {
                ...formState,
                [fieldName]: fieldValue,
            };
  
            setFormState(() => newFormState);
        };
        return setter;
    };
  
    return [formState, createFormSetter] as const; 
};

export default useFormSetter;