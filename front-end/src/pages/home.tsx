import { NavLink } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";

const DISCS = {
	W: "bg-neutral-content",
	B: "bg-base-300",
};

/** Position d'ouverture classique de l'Othello + un coup jouable */
const MINI_BOARD: Array<"W" | "B" | "hint" | null> = [
	null, null, null, null, null, null, null, null,
	null, null, null, null, null, null, null, null,
	null, null, null, null, null, null, null, null,
	null, null, null, "W", "B", null, null, null,
	null, null, null, "B", "W", null, null, null,
	null, null, null, null, null, "hint", null, null,
	null, null, null, null, null, null, null, null,
	null, null, null, null, null, null, null, null,
];

const FEATURES = [
	{
		title: "Play online",
		description: "Face opponents in real-time ranked matches and climb the ladder.",
		path: "/game",
		action: "Start a game",
	},
	{
		title: "Watch live",
		description: "Spectate ongoing games and learn from the best players.",
		path: "/watch",
		action: "Watch a game",
	},
	{
		title: "Leaderboard",
		description: "Track your ranking and compare yourself with the community.",
		path: "/leaderboard",
		action: "See rankings",
	},
	{
		title: "Learn the rules",
		description: "New to Othello? Master the basics in a couple of minutes.",
		path: "/rules",
		action: "Read the rules",
	},
];

const MiniBoard = () => (
	<div
		aria-hidden="true"
		className="grid grid-cols-8 gap-1 rounded-box bg-primary/20 p-2 shadow-xl"
	>
		{MINI_BOARD.map((cell, index) => (
			<div
				key={index}
				className={`flex aspect-square items-center justify-center rounded-sm bg-secondary/60 ${
					cell === "hint" ? "ring-2 ring-accent" : ""
				}`}
			>
				{cell && cell !== "hint" ? (
					<div className={`size-[75%] rounded-full ${DISCS[cell]} shadow`} />
				) : cell === "hint" ? (
					<div className="size-[75%] rounded-full border-2 border-dashed border-accent" />
				) : null}
			</div>
		))}
	</div>
);

const FeatureCard = ({ feature }: { feature: (typeof FEATURES)[number] }) => (
	<NavLink
		to={feature.path}
		className="card bg-base-200 transition-transform duration-150 hover:-translate-y-1 hover:shadow-xl"
	>
		<div className="card-body gap-1 p-5">
			<h3 className="card-title text-lg">{feature.title}</h3>
			<p className="grow-0 text-sm text-base-content/70">
				{feature.description}
			</p>
			<p className="pt-2 text-sm font-semibold text-accent">
				{feature.action} &rarr;
			</p>
		</div>
	</NavLink>
);

const Home = (): React.ReactElement => {
	const { user, isAuthenticated, loading } = useAuthContext();

	return (
		<div className="flex w-full flex-col items-center justify-center gap-16 px-4 py-12">
			{/* Hero */}
			<section className="flex flex-col-reverse items-center gap-10 md:flex-row md:gap-16">
				<div className="flex max-w-xl flex-col items-center gap-6 text-center md:items-start md:text-left">
					<h1 className="text-5xl font-bold tracking-wide md:text-6xl">
						OTHELLO
					</h1>
					<p className="text-lg text-base-content/70">
						{loading
							? "The classic strategy game of capture and flips."
							: isAuthenticated
								? `Welcome back, ${user?.username}. Ready for your next match?`
								: "One board, two colors, infinite strategies. Capture, flip and dominate your opponent."}
					</p>
					<div className="flex flex-wrap justify-center gap-3 md:justify-start">
						{isAuthenticated ? (
							<NavLink to="/game" className="btn btn-soft btn-primary rounded-btn text-lg">
								Play now
							</NavLink>
						) : (
							<NavLink to="/connect" className="btn btn-soft btn-primary rounded-btn text-lg">
								Get started
							</NavLink>
						)}
						<NavLink to="/rules" className="btn btn-ghost rounded-btn text-lg">
							How to play
						</NavLink>
					</div>
				</div>
				<MiniBoard />
			</section>

			{/* Features */}
			<section aria-label="Features" className="grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2">
				{FEATURES.map((feature) => (
					<FeatureCard key={feature.path} feature={feature} />
				))}
			</section>
		</div>
	);
};

export default Home;
