import React from "react";
import { useAuth } from "../../hooks/useAuth";

const AuthButtons: React.FC = () => {
    const { authWithSocial } = useAuth();

    return (
        <div className="flex flex-col gap-2 w-full max-w-xs mx-auto bg-base-200 p-2 rounded-lg">
            <button 
                onClick={() => authWithSocial("google")}
                className="btn flex items-center justify-center gap-2 bg-base-100 border-base-300 hover:bg-base-300"
            >
                <img
                    src="/googleLogo.svg"
                    alt="Google Logo"
                    className="w-5 h-5"
                />
                Continue with Google
            </button>
            <button
                onClick={() => authWithSocial("github")}
                className="btn flex items-center justify-center gap-2 bg-base-100 border-base-300 hover:bg-base-300"
            >
                <img
                    src="/githubLogoWhite.svg"
                    alt="GitHub Logo"
                    className="w-5 h-5"
                />
                Continue with GitHub
            </button>
        </div>
    );
};

export default AuthButtons;