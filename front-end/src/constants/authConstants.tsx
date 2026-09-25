// eslint-disable-next-line no-useless-escape
export const PASSWORD_PATTERN ="^(?=.*\\d)(?=.*[a-zA-Z])(?=.*[.@$#*!?_\+\-]){8,255}$";

export const PASSWORD_TITLE = "Must be more than 8 characters, including number, lowercase letter, uppercase letter";

export const PASSWORD_HINT = (
	<>
		Must be more than 8 characters, including
		<br /> At least one letter
		<br /> At least one number
		<br /> At least one special character (e.g., .@#$*!?_+-)
	</>
)
