import { Link } from "react-router-dom";
import FormField from "./FormField";
import AuthCard from "./AuthCard";
import { PASSWORD_PATTERN, PASSWORD_TITLE, PASSWORD_HINT } from "../../constants/authConstants";
import type { AuthMode } from "../../types/authTypes";
import type React from "react";

interface AuthFormProps {
	mode: AuthMode;
	username: string; setUsername: (value: string) => void;
	email: string; setEmail: (value: string) => void;
	password: string; setPassword: (value: string) => void;
	confirmPassword: string; setConfirmPassword: (value: string) => void;
	confirmPasswordError?: string;
	loading: boolean;
	error: string | null;
	onSubmit: (e: React.SubmitEvent<HTMLFormElement>) => void;
}

const AuthForm = ({
	mode,
	username, setUsername,
	email, setEmail,
	password, setPassword,
	confirmPassword, setConfirmPassword,
	confirmPasswordError,
	loading,
	error,
	onSubmit
}: AuthFormProps ) => {
	const isLogin = mode === "login";

	return (
		<AuthCard
			title={isLogin ? "Connect" : "Create Your Account" }
			onSubmit={onSubmit}
			submitLabel={ isLogin ? "Log in" : "Register" }
			loading={loading}
			error={error}
		>
			{!isLogin && (
				<FormField
					label="Username"
					type="text"
					value={username}
					onChange={setUsername}
					placeholder="Username"
					required
					minLength={3}
					maxLength={50}
					pattern="^[a-zA-Z0-9][a-zA-Z0-9_]{2,49}$"
					title="Username is required"
					hint="Must be 3-50 letters, digits or underscores. Can't start with an underscore"
				/>
			)}
			<FormField
				label="Email"
				type="email"
				value={email}
				onChange={setEmail}
				placeholder="Email"
				required
				title="Email is required"
				hint="Required"
			/>
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
			{!isLogin && (
				<FormField
					label="Confirm Password"
					type="password"
					value={confirmPassword}
					onChange={setConfirmPassword}
					placeholder="Confirm Password"
					required
					error={confirmPasswordError}
					hint="Must be the same as the password above"
					/>
			)}

			{isLogin && (
				<label className="fieldset">
					<span className="text-xs justify-center flex">
						<Link to="/forgot-password" className="link link-hover">
							Forgot your password? Reset it
						</Link>
					</span>
				</label>
			)}
			</AuthCard>
	);
};

export default AuthForm;