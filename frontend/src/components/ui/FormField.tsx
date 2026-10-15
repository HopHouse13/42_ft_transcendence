import type React from "react";

interface FormFieldProps {
	label: string;
	type: "text" | "email" | "password"; 
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	hint?: React.ReactNode;
	error?: string;
	required?: boolean;
	minLength?: number;
	maxLength?: number;
	pattern?: string;
	title?: string;
	className?: string;
}

const FormField = ({
	label,
	type,
	value,
	onChange,
	placeholder,
	hint,
	error,
	required,
	minLength,
	maxLength,
	pattern,
	title,
	className,
}: FormFieldProps) => (
	<label className={`fieldset w-full mt-2 ${className ?? ""}`}>
		<span className="label">{label}</span>
		<input
			type={type}
			className={`input validator w-full ${error ? "input-error" : ""}`}
			value={value}
			onChange={(e) => onChange(e.target.value)}
			placeholder={placeholder}
			required={required}
			minLength={minLength}
			maxLength={maxLength}
			pattern={pattern}
			title={title}
			aria-invalid={error ? true : undefined}
		/>
		{error ? (
			<span className="text-error text-xs mt-1">{error}</span>
		) : (
			hint && <span className="validator-hint hidden">{hint}</span>
		)}
	</label>
);

export default FormField;