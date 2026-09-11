import type { FC, ReactNode } from "react";
import {Link} from "react-router-dom";

interface LayoutProps{
	children: ReactNode;
}

const Header: FC = () => {
	const navLinks = [
		{ name: "Rules", path:"/rules" },
		{ name: "Game", path:"/game" },
		{ name: "Leaderboard", path: "/leaderboard" },
		{ name: "Watch live", path: "/watch" },
		{ name: "Connect", path: "/connect" }
	];

	return (
		<header className="bg-base-200 shadow-md">
			<div className="container mx-auto px-4 py-3">
				<div className="navbar">
					<div className="flex-1">
						<Link to="/"
							className="cursor-pointer"
							>
							<img
								src="/othelloLogoWhite.svg"
								alt="Logo othello"
								className="h-18 w-18 mr-2"
							/>
						</Link>
					</div>
					<div className="flex-none hidden md:flex">
						<ul className="menu menu-horizontal px-1">
							{navLinks.map((link, index) => (
								<li key={index}>
									<Link to={link.path}
										className="btn btn-ghost rounded-btn text-lg hover:bg-base-300"
									>
										{link.name}
									</Link>
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
		{name: "About Us", path: "/aboutUs" },
		{name: "Terms of Use", path: "/termsOfUse" },
		{name: "Privacy Policy", path: "/privacyPolicy"}
	];

	return (
		<footer className="flex flex-col bg-base-200 p-4">
			<nav className="grid grid-cols-3 items-center gap-4 ml-4 mt-4 ">
				<div className="justify-self-start">
	 				<a 
	 					href="https://github.com/HopHouse13/42_ft_transcendence"
	 					className="cursor-pointer"
	 					>
	 					<img
							src="/githubLogoWhite.svg"
	 						alt="Logo GitHub"
	 						className="h-12 w-12"
	 					/>
	 				</a>
	 			</div>
				<div className="flex flex-row justify-center gap-4">
					{navLinks.map((link) => (
						<Link to={link.path} className="link link-hover" key={link.path}>
							{link.name}
						</Link>
					))}
				</div>
				<div />
			</nav>
			<div className="text-center mt-4 text-sm text-base-content/70">
				<p>© {new Date().getFullYear()} Powered by 42.</p>
			</div>
		</footer>
	);
};

export default function Layout({children}: LayoutProps) {
	return (
		<>
			<Header />
			{children}
			<Footer />
		</>
	);
}