const ResetPassword = (): React.ReactElement => {
    return (
        <form className="fieldset bg-base-200 border-base-300 rounded-box border p-4">
            <div className="flex flex-col items-center justify-center">
                <h1 className="text-4xl font-bold mb-4">Enter Your New Password</h1>
                <p className="text-lg mb-4">You need to change your password. </p>
                <label className="fieldset">
                    <span className="label">Password</span>
                    <input type="password" className="input validator" required placeholder="Password" minLength={8} maxLength={255} pattern="^(?=.*\d)(?=.*[a-zA-Z])(?=.*[.@#$*!?_+-]).{8,255}&" title="Must be more than 8 characters, including number, lowercase letter, uppercase letter" />
                    <span className="validator-hint hidden">
                        Must be more than 8 characters, including
                        <br/> At least one number
                        <br/> At least one letter
                        <br/> At least one special character (e.g., .@#$*!?_+-)
                    </span>
                </label>
                <label className="fieldset">
                    <span className="label">Confirm Password</span>
                    <input type="password" className="input validator" required placeholder="Confirm Password"  />
                    <span className="validator-hint hidden">
                        Must be the same as the password above
                    </span>
                </label>
                <button type="submit" className="btn btn-neutral mt-4 mb-2">
                    Continue
                </button>
            </div>
        </form> 
    );
};

export default ResetPassword;