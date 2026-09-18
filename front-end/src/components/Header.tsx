import type { FC } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";

const Header: FC = () => {
	const { user, isAuthenticated, loading, logout } = useAuthContext();
	const navigate = useNavigate();

	const navLinks = [
		{ name: "Rules", path:"/rules" },
		{ name: "Game", path:"/game" },
		{ name: "Leaderboard", path: "/leaderboard" },
		{ name: "Watch live", path: "/watch" },
	];

	const handleLogout = async () => {
		await logout();
		navigate("/", {replace: true});
	}

	return (
		<header className="sticky top-0 z-1 bg-base-200 shadow-md">
			<div className="navbar justify-between px-4 py-3">
				<NavLink to="/"
					className="flex flex-1 items-center gap-2 shrink-0 cursor-pointer text-lg font-bold"
					>
					<img
						src="/othelloLogoWhite.svg"
						alt="Logo othello"
						className="h-14 w-14"
					/>
					OTHELLO
				</NavLink>
				<div className="flex-none hidden md:flex items-center gap-2">
					<ul className="menu menu-horizontal px-1 items-center gap-1">
						{navLinks.map((link) => (
							<li key={link.path}>
								<NavLink to={link.path}
									className="btn btn-ghost rounded-btn text-lg hover:bg-base-300"
								>
									{link.name}
								</NavLink>
							</li>
						))}
					</ul>
				</div>
				<div className="flex flex-1 justify-end">
					<ul>
						<li>
							{ loading ?( 
								<div className="w-24 h-10 animate-pulse bg-base-300 rounded-btn"/>
							) : isAuthenticated ? (
								<div className="dropdown dropdown-end">
									<label tabIndex={0} className="btn btn-ghost rounded-btn text-lg hover:bg-base-300">
										{user?.username}
									</label>
									<ul tabIndex={0} className="menu dropdown-content mt-3 z-[1] p-2 shadow bg-base-200 rounded-box w-40">
										<li>
											<button onClick={handleLogout}>Log out</button>
										</li>
									</ul>
								</div>
							) : (
								<NavLink to="connect" className=" btn btn-ghost rounded-btn text-lg hover:bg-base-300">
									Login
								</NavLink>
							)}
						</li>
				   </ul>
				</div>
			</div>
		</header>
	);
};

export default Header;
 