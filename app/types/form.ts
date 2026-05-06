export type FormField = {
    name: string;
    label: string;
    type: string;
};

export type FormProp = {
    type: "number" | "text" | "textarea";
    label: string;
    modelValue: string | number;
    name: string;
    placeholder?: string;
    required?: boolean;
};
