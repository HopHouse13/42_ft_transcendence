import AuthTabs from "../components/authentication/AuthTabs";
import AuthForm from "../components/authentication/AuthForm";
import { useAuthForm } from "../hooks/useAuthForm";

const Connect = () => {
	const {
		mode,
		username, setUsername,
		email, setEmail,
		password, setPassword,
		confirmPassword, setConfirmPassword,
		confirmPasswordError, 
		loading,
		error,
		switchMode,
		handleSubmit
 	} = useAuthForm();

	console.log("[DEBUG] Display Connect starting");

  return (
	<div className="size-full flex flex-col items-center justify-center">
		<div className="flex flex-col items-center max-w-xs gap-8 w-full px-4">
			<AuthTabs mode={mode} onSwitch={switchMode}/>
			<AuthForm
				mode={mode}
				username={username} setUsername={setUsername}
				email={email} setEmail={setEmail}
				password={password} setPassword={setPassword}
				confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword}
				confirmPasswordError={confirmPasswordError}
				loading={loading}
				error={error}
				onSubmit={handleSubmit}
			/>
		</div>
	</div>
  );
};

export default Connect;