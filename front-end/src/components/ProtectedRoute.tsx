import { Navigate } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";
import type React from "react";

const ProtectedRoute = ({ children }: {children: React.ReactElement }) => {
    const { isAuthenticated } = useAuthContext();
    return isAuthenticated 
        ? children
        : <Navigate to="/connect" replace />;
};

export default ProtectedRoute;