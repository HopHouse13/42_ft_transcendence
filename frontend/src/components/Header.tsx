import { useState } from "react";
import { NavLink, useNavigate } from "react-router";
import { useAuthSession } from "../hooks/useAuthSession";
import { useAuth } from "../hooks/useAuth";
import { resolveAvatar } from "../utils/resolveAvatar";

const NAV_LINKS = [
	{ name: "Rules", path: "/rules" },
	{ name: "Game", path: "/game" },
  { name: "Watch", path: "/watch" },
  { name: "Leaderboard", path: "/leaderboard" },
];

const NAV_BUTTON_CLASS = "btn btn-ghost rounded-btn text-lg h-10 hover:bg-base-300";

const HamburgerIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		aria-hidden="true"
		className="h-6 w-6"
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor"
	>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth="2"
			d="M4 6h16M4 12h16M4 18h16"
		/>
	</svg>
);

const Header = () => {
	const { user, isAuthenticated, loading } = useAuthSession();
	const { logout } = useAuth();
	const navigate = useNavigate();
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	const closeMobileMenu = () => setMobileMenuOpen(false);

	const handleLogout = async () => {
		closeMobileMenu();
		await logout();
		navigate("/", { replace: true });
	};

	const authMenuItems = loading ? null : isAuthenticated ? (
		<>
			<li>
				<NavLink
					to="/profile"
					onClick={closeMobileMenu}
					className={NAV_BUTTON_CLASS}
				>
					Profile
				</NavLink>
				<NavLink
					to="/achievements"
					onClick={closeMobileMenu}
					className={NAV_BUTTON_CLASS}
				>
					Achievements
				</NavLink>
				<NavLink
					to="/friend"
					onClick={closeMobileMenu}
					className={NAV_BUTTON_CLASS}
				>
					Friends
				</NavLink>
			</li>
			<li>
				<button
					onClick={handleLogout}
					className="btn btn-error rounded-btn text-lg hover:bg-base-300 hover:text-error"
				>
					Log out
				</button>
			</li>
		</>
	) : (
		<li>
			<NavLink
				to="/connect"
				onClick={closeMobileMenu}
				className={NAV_BUTTON_CLASS}
			>
				Login
			</NavLink>
		</li>
	);

	return (
		<header className="flex w-full min-w-max sticky top-0 z-50 bg-base-200 shadow-md">
			<div className="navbar w-full justify-between px-4 py-3">
				<div className="flex flex-1">
					<NavLink
						to="/"
						onClick={closeMobileMenu}
						className="flex cursor-pointer shrink-0 items-center gap-2 text-lg font-bold"
					>
						<img
							src="/othelloLogoWhite.svg"
							alt="Logo othello"
							className="h-14 w-14"
						/>
						OTHELLO
					</NavLink>
				</div>

				<div
					aria-label="Main navigation"
					className="hidden flex-none items-center gap-2 md:flex"
				>
					<ul className="menu menu-horizontal items-center gap-1 px-1">
						{NAV_LINKS.map((link) => (
							<li key={link.path}>
								<NavLink to={link.path} className={NAV_BUTTON_CLASS}>
									{link.name}
								</NavLink>
							</li>
						))}
					</ul>
				</div>

				{/* Auth section: desktop only */}
				<div className="hidden flex-1 justify-end md:flex">
					{loading ? (
						<div
							aria-hidden="true"
							className="h-10 w-24 animate-pulse rounded-btn bg-base-300"
						/>
					) : isAuthenticated ? (
						<div className="dropdown dropdown-end">
							<button
								type="button"
								aria-haspopup="menu"
								aria-label={`Account menu: ${user?.username ?? ""}`}
								className={NAV_BUTTON_CLASS}
							>
								<img
									src={resolveAvatar(user?.avatarUrl) ?? '/api/uploads/avatars/default.png'}
									alt="User avatar"
									className="h-8 w-8 rounded-full"
								/>
								<p className="max-w-40 truncate">{user?.username}</p>
							</button>
							<ul
								aria-label="Account"
								tabIndex={0}
								className="menu dropdown-content z-[1] mt-3 w-60 gap-2 rounded-box bg-base-200 p-2 shadow"
							>
								{authMenuItems}
							</ul>
						</div>
					) : (
						<NavLink to="/connect" className={NAV_BUTTON_CLASS}>
							Login
						</NavLink>
					)}
				</div>

				{/* Hamburger menu: mobile only */}
				<div className="dropdown dropdown-end flex-none md:hidden">
					<button
						type="button"
						className="btn btn-ghost rounded-btn"
						aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
						aria-expanded={mobileMenuOpen}
						aria-haspopup="true"
						aria-controls="mobile-menu"
						onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
					>
						<HamburgerIcon />
					</button>
					{mobileMenuOpen && (
						<>
							<div
								className="fixed inset-0 z-0"
								onClick={closeMobileMenu}
								aria-hidden="true"
							/>
							<ul
								id="mobile-menu"
								aria-label="Main navigation"
								className="menu dropdown-content z-[1] mt-3 w-60 gap-2 rounded-box bg-base-200 p-2 shadow"
							>
								{NAV_LINKS.map((link) => (
									<li key={link.path}>
										<NavLink
											to={link.path}
											onClick={closeMobileMenu}
											className={NAV_BUTTON_CLASS}
										>
											{link.name}
										</NavLink>
									</li>
								))}
								{loading ? null : (
									<>
										<div role="separator" className="divider my-1" />
										{authMenuItems}
									</>
								)}
							</ul>
						</>
					)}
				</div>
			</div>
		</header>
	);
};

export default Header;
