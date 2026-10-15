import type { LeaderboardUser } from "../types/leaderboardTypes";

interface LeaderboardPodiumProps {
    users: LeaderboardUser[];
};

const LeaderboardPodium = ({users}: LeaderboardPodiumProps) => {
    return (
        <div className="grid grid-cols-3 gap-3 md:gap-6 items-end my-2">

            {/* Rank 1 - Gold */}
            {users.length > 0 &&
                <div className="order-2 card aura aura-gold p-4 rounded-2xl flex flex-col items-center text-center gap-2 relative shadow-lg shadow-neutral/10">
                    <div className="avatar">
                    <div className="w-16 bg-base-100/90 md:w-24 rounded-full">
                        <img src={users[0].avatarUrl} alt={users[0].username} />
                    </div>
                    </div>
                    <div className="flex flex-col items-center">
                    <span className="font-black text-sm md:text-base bg-stone-200/30 rounded-full px-2 text-primary-content truncate max-w-[120px] md:max-w-full">
                        {users[0].username}
                    </span>
                    <span className="text-xs font-mono text-primary-content font-extrabold px-2 py-0.5 rounded-md mt-1">
                        {users[0].elo} ELO
                    </span>
                    </div>
                </div>
            }

            {/* Rank 2 - Silver */}
            {users.length > 1 &&
                <div className="order-1 card aura aura-silver p-4 rounded-2xl flex flex-col items-center text-center gap-2 relative">
                    <div className="avatar">
                    <div className="w-12 md:w-14 bg-base-100/90 lg:w-20 rounded-full">
                        <img src={users[1].avatarUrl} alt={users[1].username} />
                    </div>
                    </div>
                    <div className="flex flex-col items-center">
                    <span className="font-bold text-xs md:text-sm bg-stone-200/30 rounded-full px-2 text-primary-content truncate max-w-[100px] md:max-w-none">
                        {users[1].username}
                    </span>
                    <span className="text-xs font-mono text-primary-content/70 font-semibold mt-0.5">
                        {users[1].elo} ELO
                    </span>
                    </div>
                </div>
            }

            {/* Rank 3 - Bronze */}
            {users.length > 2 &&
                <div className="order-3 card bg-[repeating-conic-gradient(from_var(--aura-angle,7.21deg),oklch(0.44_0.12_42),oklch(0.72_0.12_55),oklch(0.52_0.13_45),oklch(0.70_0.11_55),oklch(0.35_0.08_38),oklch(0.44_0.12_42)_50%)] bg-[oklch(0.58_0.14_48)] animate-[aura_6s_linear_infinite] rounded-2xl shadow-[0_0_15px_oklch(0.58_0.14_48/0.3)] p-4 flex flex-col items-center text-center gap-2 relative">
                    <div className="avatar">
                    <div className="w-14 bg-base-100/90 md:w-20 rounded-full p-1">
                        <img src={users[2].avatarUrl} alt={users[2].username} />
                    </div>
                    </div>
                    <div className="flex flex-col items-center">
                    <span className="font-bold text-xs md:text-sm bg-stone-200/30 rounded-full px-2 text-primary-content truncate max-w-[100px] md:max-w-none">
                        {users[2].username}
                    </span>
                    <span className="text-xs font-mono text-primary-content/70 font-semibold mt-0.5">
                        {users[2].elo} ELO
                    </span>
                    </div>
                </div>
            }
        </div>
    )
};

export default LeaderboardPodium;