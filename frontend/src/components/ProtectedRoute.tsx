import { Navigate } from "react-router";
import { useAuthSession } from "../hooks/useAuthSession";
import type React from "react";
import Loader from "../pages/loader";

export function AuthRoute({ children }: {children: React.ReactElement }) {
	const { isAuthenticated, loading } = useAuthSession();

	if (loading)
		return <Loader />

	return isAuthenticated 
		? children
		: <Navigate to="/connect" replace />;
};

export function GuestRoute({ children }: { children: React.ReactElement }) {
  const { isAuthenticated, loading } = useAuthSession();
  
	if (loading)
		return <Loader />

	return isAuthenticated 
		? <Navigate to="/profile" replace /> 
		: children;
};