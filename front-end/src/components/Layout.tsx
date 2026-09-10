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
							className="cursor-pointer"
							>
							<img
								src="/logo1.png"
								alt="Logo othello"
								className="h-18 w-18 mr-2"
							/>
						</a>
					</div>
					<div className="flex-none hidden md:flex">
						<ul className="menu menu-horizontal px-1">
							{navLinks.map((link, index) => (
								<li key={index}>
									<a
										href={link.path}
										className="btn btn-ghost rounded-btn text-lg hover:bg-base-300"
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
		{name: "About Us", path: "/about" },
		{name: "Terms of Use", path: "/terms" },
		{name: "Privacy Policy", path: "/privacy"}
	];

	return (
		<footer className="footer sm:footer-horizontal footer-center bg-base-200 rounded p-10 text-base-content">
			<nav className="grid grid-flow-col gap-4">
				<div className="grid-flow-col md:justify-self-start">
	 				<a 
	 					href="https://github.com/HopHouse13/42_ft_transcendence"
	 					className="cursor-pointer"
	 					>
	 					<img
							src="/githubLogo.png"
	 						alt="Logo GitHub"
	 						className="h-16 w-16 mr-2"
	 					/>
	 				</a>
	 			</div>
				{navLinks.map((link, index) => (
					<a className="link link-hover" href={link.path} key={index}>
						{link.name}
					</a>
				))}
			</nav>
			<div>
				<p>© {new Date().getFullYear()} Powered by 42.</p>
			</div>
		</footer>
	);
};

export default function Layout({children}: LayoutProps) {
	return (
		<>

			<Header />

			<main className="game-main">{children}
				<br />
			</main>

			<Footer />
		</>
	);
}

// <footer className="bg-base-200 shadow-md">
	// 	<div className="container mx-auto px-3 py-2">
	// 		<div className="navbar">
	// 			<div className="flex-1">
	// 				<a 
	// 					href="https://github.com/HopHouse13/42_ft_transcendence"
	// 					className="cursor-pointer"
	// 					>
	// 					<img
	// 						src="/githubLogo.png"
	// 						alt="Logo GitHub"
	// 						className="h-10 w-10 mr-2"
	// 					/>
	// 				</a>
	// 			</div>
	// 			<div className="flex-none hidden md:flex">
	// 				<ul className="menu menu-horizontal px-1">
	// 					{navLinks.map((link, index) => (
	// 						<li key={index}>
	// 							<a
	// 								href= {link.path}
	// 								className="cursor-pointer"
	// 							>
	// 								{link.name}
	// 							</a>
	// 						</li>
	// 					))}
	// 				</ul>
	// 			</div>
	// 		</div>
	// 		<div className="text-center mt-4 text-sm text-base-content/70 ">
	// 			<span>© 2026 Powered by 42.</span>
	// 			{/* <p>© 2026 Powered by 42.</p> */}
	// 		</div>
	// 	</div>
	// </footer>