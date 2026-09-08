// import { link } from "fs";
// import path from "path";
// import React, { ReactNode } from "react";
import type { FC, ReactNode } from "react";

interface LayoutProps{
	children: ReactNode;
}

const Header: FC = () => {
	const navLinks = [
		{ name: "Rules", path:"/rules" },
		{ name: "Game", path:"/game" },
		{ name: "Leaderboard", path: "/leaderboard" },
		{ name: "Watch live", path: "/spec" },
		{ name: "Connect", path: "/connection" }
	];

	return (
		<header className="bg-base-200 shadow-md">
			<div className="container mx-auto px-4 py-3">
				<div className="navbar">
					<div className="flex-1">
						<a 
							href="/"
							className="btn btn-ghost text-xl font-bold normal-case"
							>
							<img
								src="/logo1.png"
								alt="Logo othello"
								className="h-8 w-8 mr-2"
							/>
						</a>
					</div>
					<div className="flex-none hidden md:flex">
						<ul className="menu menu-horizontal px-1">
							{navLinks.map((link, index) => (
								<li key={index}>
									<a
										href={link.path}
										className="btn btn-ghost rounded-btn hover:bg-base-300"
									>
										{link.name}
									</a>
								</li>
							))}
						</ul>
					</div>
				</div>
			</div>
		</header>
	);
};

const Footer: FC = () => {
	const navLinks = [
		{name: "GitHub", path: "https://github.com/HopHouse13/42_ft_transcendence"},
		{name: "about", path: "/about" },
		{name: "Terms of Use", path: "/terms" },
		{name: "Privacy Policy", path: "/privacy"}
	];

	return (
	<footer className="bg-base-200 shadow-md">
		<div className="container mx-auto px-3 py-2">
			<div className="navbar">
				<div className="flex-none hidden md:flex">
					<ul className= "menu menu-horizontal px-1">
						{navLinks.map((link, index) => (
							<li key={index}>
								<a
									href= {link.path}
									className="btn btn-ghost rounded-btn hover:bg-base-300"
								>
									{link.name}
								</a>
							</li>
						))}
					</ul>
				</div>
			</div>
			<div className="text-center mt-4 text-sm text-base-content/70 ">
				<p>© 2026 Powered by 42.</p>
			</div>
		</div>
	</footer>
	);
};

export default function Layout({children}: LayoutProps) {
	return (
		<div className="game-layout">

			<Header />

			<main className="game-main">{children}</main>

			<Footer />
		</div>
	);
}
