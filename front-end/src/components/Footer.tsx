import type { FC } from "react";
import { NavLink } from "react-router-dom";

const Footer: FC = () => {
	const navLinks = [
		{name: "About Us", path: "/aboutUs" },
		{name: "Terms of Use", path: "/termsOfUse" },
		{name: "Privacy Policy", path: "/privacyPolicy"}
	];

	return (
		<footer className="flex flex-col bg-base-200 py-2 px-8 gap-4">
			<nav className="flex flex-row items-center justify-between pt-2 w-full">
				<div className="justify-self-start">
	 				<a 
	 					href="https://github.com/HopHouse13/42_ft_transcendence"
						target="_blank"
						rel="noopener noreferrer"
						aria-label="Go to our GitHub repository"
	 					className="cursor-pointer"
	 					>
	 					<img
							src="/githubLogoWhite.svg"
	 						alt="GitHub logo"
	 						className="h-12 w-12"
	 					/>
	 				</a>
	 			</div>
				<div className="flex flex-row justify-stretch gap-4">
					{navLinks.map((link) => (
						<NavLink to={link.path} className="link link-hover" key={link.path}>
							{link.name}
						</NavLink>
					))}
				</div>
				<div className="w-12"/>
			</nav>
			<div className="text-center pt-2 border-t border-base-300 text-sm text-base-content/70">
				<p>© {new Date().getFullYear()} Powered by 42.</p>
			</div>
		</footer>
	);
};

export default Footer;