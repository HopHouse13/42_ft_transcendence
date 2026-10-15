import React, { useState } from "react";
import AuthCard from "../components/authentication/AuthCard";
import FormField from "../components/ui/FormField";
import { useAuth } from "../hooks/useAuth";

const ForgotPassword = () => {
	const [email, setEmail] = useState("");
	const [sent, setSent] = useState(false);
	const {loading, error, forgotPassword } = useAuth();

	const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();
		const result = await forgotPassword(email);
		if (result.success)
			setSent(true);
	};

	if (sent) {
		return (
			<div className="flex flex-col items-center justify-center">
				<h1 className="text-4xl font-bold mb-4">Check Your Inbox</h1>
				<p className="text-lg">A reset link has been sent to {email}.</p>
			</div>
		);
	}

	return (
		<AuthCard
			title="Forgot Your password?"
			description={
				<>
					<p className="text-lg">Enter your email address below.</p>
					<p className="text-lg">We will send you a link to set a new password.</p>
				</>
			}
			onSubmit={handleSubmit}
			submitLabel="Reset Password"
			loading={loading}
			error={error}
		>
			<FormField
				label="Email"
				type="email"
				value={email}
				onChange={setEmail}
				placeholder="Email"
				required
				title="Email is required"
				hint="Required"
				className="mt-4"
			/>
		</AuthCard>
	);
};

export default ForgotPassword;