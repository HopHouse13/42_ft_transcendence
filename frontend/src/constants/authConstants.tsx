export const USERNAME_PATTERN = "^[a-zA-Z0-9][a-zA-Z0-9_.]{2,49}$";

export const PASSWORD_PATTERN = "(?=.*\\d)(?=.*[a-zA-Z])(?=.*[.@$#*!?_+\\x2D]).{8,255}";

export const PASSWORD_TITLE = "Must be more than 8 characters, including at least one letter, one number, and one special character";

export const PASSWORD_HINT = (
	<>
		Must be more than 8 characters, including
		<br /> At least one letter
		<br /> At least one number
		<br /> At least one special character (e.g., .@#$*!?_+-)
	</>
)
