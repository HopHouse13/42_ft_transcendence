import React, { useMemo, useState } from "react";
import { useAuth } from "./useAuth";
import type { AuthMode } from "../types/authTypes";
import { useNavigate } from "react-router-dom";

export function useAuthForm() {
	const [mode, setMode] = useState<AuthMode>("login");
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	const { loading, error, login, register } = useAuth();
	const navigate = useNavigate();

	const isLogin = mode === "login";

	const confirmPasswordError = useMemo(() => {
		if (isLogin || confirmPassword.length === 0 )
			return undefined;
		return confirmPassword !== password ? "Passwords do not match" : undefined;
	}, [isLogin, password, confirmPassword]);

	const switchMode = (next: AuthMode ) => {
		setMode(next);
		setUsername("");
		setEmail("");
		setPassword("");
		setConfirmPassword("");
	};

	const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!isLogin && confirmPasswordError)
			return;

		const result = isLogin ? await login(email, password) : await register(username, email, password);

		if (result.success) {
			console.log(`${mode} successful`);
			navigate("/game");
		}
	};

	return {
		mode,
		isLogin,
		username, setUsername,
		email, setEmail,
		password, setPassword,
		confirmPassword, setConfirmPassword,
		confirmPasswordError,
		loading,
		error,
		switchMode,
		handleSubmit,
	};
}