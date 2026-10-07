import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from 'react-router';
import { AuthRoute, GuestRoute } from '../components/ProtectedRoute';
import Loader from "../pages/loader";
import Home from "../pages/home";
import Notfound from "../pages/notFound";

// lazy pour ne charger les pages qu'a la demande
const Game = lazy(() => import('../pages/game'));
const Connect = lazy(() => import('../pages/connect'));
const ForgotPassword = lazy(() => import('../pages/forgotPassword'));
const ResetPassword = lazy(() => import('../pages/resetPassword'));
const Rules = lazy(() => import('../pages/rules'));
const Leaderboard = lazy(() => import('../pages/leaderboard'));
const AboutUs = lazy(() => import('../pages/aboutUs'));
const TermsOfUse = lazy(() => import('../pages/termsOfUse'));
const PrivacyPolicy = lazy(() => import('../pages/privacyPolicy'));
const UserProfile = lazy(() => import('../pages/userProfile'));

function AppRouter(): React.ReactElement {
    return (
        <Suspense fallback={<Loader />}>
            <Routes>
                {/* Public routes */}
                <Route path="/" element={<Home />} />
                <Route path="/notFound" element={<Notfound/>} />
                <Route path="/rules" element={<Rules />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/aboutUs" element={<AboutUs />} />
                <Route path="/termsOfUse" element={<TermsOfUse />} />
                <Route path="/privacyPolicy" element={<PrivacyPolicy />} />

                {/* Non-authenticated routes */}
                <Route
                    path="/connect"
                    element={
                    <GuestRoute>
                        <Connect />
                    </GuestRoute>
                    }
                />
                <Route
                    path="/forgot-password"
                    element={
                    <GuestRoute>
                        <ForgotPassword />
                    </GuestRoute>
                    }
                />
                <Route
                    path="/reset-password"
                    element={
                    <GuestRoute>
                        <ResetPassword />
                    </GuestRoute>
                    }
                />

                {/* Authenticated only routes */}
                <Route
                    path="/game"
                    element={
                    <AuthRoute>
                        <Game />
                    </AuthRoute>
                    }
                />
                <Route
                    path="/profile"
                    element={
                    <AuthRoute>
                        <UserProfile />
                    </AuthRoute>
                    }
                />
                <Route
                    path="/profile/:userId"
                    element={
                    <AuthRoute>
                        <UserProfile />
                    </AuthRoute>
                    }
                />

                {/* Catch-all route */}
                <Route path="*" element={<Navigate to="/notFound" replace />}/>

            </Routes>
        </Suspense>
    );
}

export default AppRouter;