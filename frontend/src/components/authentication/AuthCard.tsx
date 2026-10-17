import type React from "react";

interface AuthCardProps {
    title: string;
    description?: React.ReactNode;
    submitLabel: string;
    onSubmit: (e: React.SubmitEvent<HTMLFormElement>) => void;
    loading: boolean;
    error?: string | null;
    children: React.ReactNode;
}

const AuthCard = ({
    title,
    description,
    submitLabel,
    onSubmit,
    loading,
    error,
    children,
}: AuthCardProps) => (
    <form
        className="fieldset w-full bg-base-200 border-base-200 rounded-box border p-4"
        onSubmit={onSubmit}
    >
        <div className="flex flex-col items-center justify-center">
            <h1 className="text-4xl font-bold text-center mb-4">{title}</h1>
            {description}
            {children}
            {error && <p className="text-error text-sm mt-2">{error}</p>}
            <button type="submit" className="btn btn-neutral mt-4 mb-2" disabled={loading}>
                {loading ? "..." : submitLabel}
            </button>
        </div>
    </form>
);

export default AuthCard;
