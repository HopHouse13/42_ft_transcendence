import React, { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AuthCard from "../components/authentication/AuthCard";
import FormField from "../components/ui/FormField";
import { useAuth } from "../hooks/useAuth";
import { PASSWORD_PATTERN, PASSWORD_TITLE, PASSWORD_HINT } from "../constants/authConstants";

const ResetPassword = (): React.ReactElement => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token") ?? undefined;
    const { loading, error, resetPassword } = useAuth();

	const navigate = useNavigate();

    const confirmPasswordError = useMemo(() => {
        if (confirmPassword.length === 0)
            return undefined;
        return (confirmPassword !== password ? "Password don not match" : undefined)
    }, [password, confirmPassword]);

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (confirmPasswordError)
            return;
        await resetPassword(password, token);
        navigate("/connect", {replace: true});
    };

    return (
        <AuthCard
            title="Enter Your New Password"
            description={<p className="text-lg mb-4">You need to change your password.</p>}
            onSubmit={handleSubmit}
            submitLabel="Continue"
            loading={loading}
            error={error}
        >
            <FormField
                label="Password"
                type="password"
                value={password}
                onChange={setPassword}
                placeholder="Password"
                required
                minLength={8}
                maxLength={255}
                pattern={PASSWORD_PATTERN}
                title={PASSWORD_TITLE}
                hint={PASSWORD_HINT}
            />
            <FormField
                label="Confirm password"
                type="password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="Confirm password"
                required
                error={confirmPasswordError}
                hint="Must be the same as the password above."
            />
        </AuthCard>
    );
};

export default ResetPassword;