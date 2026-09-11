import React from 'react';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import Game from './pages/game.tsx';
import Connect from './pages/connect.tsx';
import Rules from './pages/rules.tsx';
import Leaderboard from './pages/leaderboard.tsx';
import Watch from './pages/watch.tsx';
import AboutUs from './pages/aboutUs.tsx';
import TermsOfUse from './pages/termsOfUse.tsx';
import PrivacyPolicy from './pages/privacyPolicy.tsx';
import Layout from './components/Layout.tsx';

const App =(): React.ReactElement => {
	
	return (
		<BrowserRouter>
			<Layout>
				<main className="flex flex-col items-center justify-center min-h-screen bg-base-100">
					<Routes>
						<Route path="/" element={<Game />} />
						<Route path="/game" element={<Game />} />
						<Route path="/connect" element={<Connect />} />
						<Route path="/rules" element={<Rules />} />
						<Route path="/leaderboard" element={<Leaderboard />} />
						<Route path="/watch" element={<Watch />} />
						<Route path="/aboutUs" element={<AboutUs />} />
						<Route path="/termsOfUse" element={<TermsOfUse />} />
						<Route path="/privacyPolicy" element={<PrivacyPolicy />} />
					</Routes>
				</main>
			</Layout>
		</BrowserRouter>
	);
};

export default App;
