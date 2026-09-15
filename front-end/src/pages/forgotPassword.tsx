const ForgotPassword = (): React.ReactElement => {
    return (
        <form className="fieldset bg-base-200 border-base-300 rounded-box border p-4">
            <div className="flex flex-col items-center justify-center">
                <h1 className="text-4xl font-bold mb-4">Forgot Your Password?</h1>
                <p className="text-lg">Enter your email address below. </p>
                <p className="text-lg"> We will send you a link to set a new password.</p>
                <label className="fieldset mt-4">
                    <span className="label">Email</span>
                    <input type="email" className="input validator" placeholder="Email" required title="Email is required"/>
                    <p className="validator-hint hidden">Required</p>
                </label>
                <button type="submit" className="btn btn-neutral mt-4 mb-2">
                    Reset Password
                </button>
            </div>
        </form>
    );
};

export default ForgotPassword;