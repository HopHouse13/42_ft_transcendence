import React from 'react';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import { AuthProvider } from './contexts/AuthProvider.tsx';
import Game from './pages/game.tsx';
import Connect from './pages/connect.tsx';
import ForgotPassword from './pages/forgotPassword.tsx';
import ResetPassword from './pages/resetPassword.tsx';
import Rules from './pages/rules.tsx';
import Leaderboard from './pages/leaderboard.tsx';
import Watch from './pages/watch.tsx';
import AboutUs from './pages/aboutUs.tsx';
import TermsOfUse from './pages/termsOfUse.tsx';
import PrivacyPolicy from './pages/privacyPolicy.tsx';
import Layout from './components/Layout.tsx';
import UserProfile from './pages/userProfile.tsx';

const App =(): React.ReactElement => {
	
	return (
		<AuthProvider>
			<BrowserRouter>
				<Layout>
					<main className="flex flex-col flex-grow items-center justify-center bg-base-100 py-2">
						<Routes>
							<Route path="/" element={<Game />} />
							<Route path="/game" element={<Game />} />
							<Route path="/connect" element={<Connect />} />
							<Route path="/forgot-password" element={<ForgotPassword />} />
							<Route path="/reset-password" element={<ResetPassword />} />
							<Route path="/rules" element={<Rules />} />
							<Route path="/profile" element={<UserProfile />} />
							<Route path="/leaderboard" element={<Leaderboard />} />
							<Route path="/watch" element={<Watch />} />
							<Route path="/aboutUs" element={<AboutUs />} />
							<Route path="/termsOfUse" element={<TermsOfUse />} />
							<Route path="/privacyPolicy" element={<PrivacyPolicy />} />
						</Routes>
					</main>
				</Layout>
			</BrowserRouter>
		</AuthProvider>
	);
};

export default App;
