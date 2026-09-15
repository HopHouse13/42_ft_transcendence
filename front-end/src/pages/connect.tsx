import { Link } from "react-router-dom";
import { useState } from "react";

const Connect = () => {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const isLogin = mode === "login";

  const handleSwitch = (next: "login" | "register") => {
    setMode(next);
    setUsername("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    if ( !isLogin && password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    console.log("Form submitted", { mode, username, email, password, confirmPassword });
  };

  return (
    <div className="size-full flex flex-col items-center justify-center" >
      <h1 className="text-4xl font-bold mb-8">{isLogin ? "Connect" : "Create Your Account"}</h1>
      <div className="flex flex-col items-center max-w-xs gap-8 w-full px-4">
        {/* Ajouter le bouton pour Google */}

        {/* <div className=""> */}
          <div className="justify-center bg-base-300 p-2 rounded-full">
            <div className="tabs tabs-boxed border-base-300 rounded-box">
              <input type="radio" name="login_tab" id="login" className="tab" aria-label="Login" checked={isLogin} onChange={() => handleSwitch("login")} defaultChecked/>
              <input type="radio" name="register_tab" id="register" className="tab" aria-label="Sign In" checked={!isLogin} onChange={() => handleSwitch("register")} />
            </div>
          </div>

          {/* Form */}
          <form className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4" onSubmit={handleSubmit}>
            <>
            { !isLogin && (
              <label className="fieldset">
                <span className="label">Username</span>
                <input type="text" className="input validator" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" required title="Username is required" minLength={3} maxLength={50} pattern="^[a-zA-Z0-9][a-zA-Z0-9_]{3,50}$"/>
                <span className="validator-hint hidden">
                  Must be 3-50 letters, digit or underscore.
                  <br/> Can't start with an underscore.
                </span>
              </label>
            )}
            </>

            <label className="fieldset">
                <label className="label">Email</label>
                <input type="email" className="input validator" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required title="Email is required"/>
                <p className="validator-hint hidden">Required</p>
            </label>

            <label className="fieldset">
              <span className="label">Password</span>
              <input type="password" className="input validator" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Password" minLength={8} maxLength={255} pattern="^(?=.*\d)(?=.*[a-zA-Z])(?=.*[.@#$*!?_+-]).{8,255}$" title="Must be more than 8 characters, including number, lowercase letter, uppercase letter" />
              <span className="validator-hint hidden">
                  Must be more than 8 characters, including
                <br/> At least one number
                <br/> At least one letter
                <br/> At least one special character (e.g., .@#$*!?_+-)
              </span>
            </label>

            {!isLogin ? (
              <label className="fieldset">
              <span className="label">Confirm Password</span>
              <input type="password" className="input validator" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required placeholder="Confirm Password"  />
              <span className="validator-hint hidden">
                  Must be the same as the password above
              </span>
            </label>
            ) : (
              <label className="fieldset">
                <span className="text-xs justify-center flex">
                  <Link to="/forgotPassword" className="link link-hover">
                    Forgot your password? Reset it
                  </Link>
                </span>
              </label>
            )}

            <button className="btn btn-neutral mt-4 mb-2" type="submit">
              {isLogin ? "Log In" : "Sign In"}
            </button>
          </form>

          {/* Hint */}
          {isLogin && ( <p className="text-xs"> démo · <span>player1 / 1234</span> </p> )}
        </div>
      </div>
    // </div>
  );
}

export default Connect;