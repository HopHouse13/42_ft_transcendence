import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { AuthMode } from "../types/authTypes";
import { useAuthContext } from "./useAuthContext";
import { useAuth } from "./useAuth";

export function useAuthForm() {
	const [mode, setMode] = useState<AuthMode>("login");
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	const { loading, error, login, register } = useAuth();
	const { setUser } = useAuthContext();
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

		const result = isLogin 
			? await login(email, password) 
			: await register(username, email, password);

		if (result.success && result.user ) {
			console.log(`[DEBUG] ${mode} successful`);
			setUser(result.user);
			navigate("/game", {replace: true});
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