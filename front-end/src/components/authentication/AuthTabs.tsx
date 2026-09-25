import type { AuthMode } from "../../types/authTypes";

interface AuthTabsProps {
	mode: AuthMode;
	onSwitch: (mode: AuthMode) => void;
}

const AuthTabs = ({ mode, onSwitch }: AuthTabsProps ) => (
	<div className="justify-center bg-base-300 p-2 rounded-full">
		<div className="tabs tabs-boxed border-base-300 rounded-box">
			<input
				type="radio"
				name="auth_tab"
				className="tab"
				aria-label="Login"
				checked={mode === "login"}
				onChange={() => onSwitch("login")}
			/>
			<input
				type="radio"
				name="auth_tab"
				className="tab"
				aria-label="Register"
				checked={mode === "register"}
				onChange={() => onSwitch("register")}
			/>
		</div>
	</div>
);

export default AuthTabs;