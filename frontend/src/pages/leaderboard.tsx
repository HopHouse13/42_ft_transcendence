import React from "react";
import LeaderboardTable from "../components/LeaderboardTable";
import LeaderboardPodium from "../components/LeaderboardPodium";
import useLeaderboard from "../hooks/useLeaderboard";
import Loader from "./loader";

const Leaderboard = (): React.ReactElement => {
  const { data, isLoading, isError, error } = useLeaderboard();

  if (isLoading)
    return (<Loader/>);

  if (isError)
    return (
      <div className="alert alert-error">
        <span>{error.message}</span>
      </div>
  )

  const topPlayers = data?.topUsers.slice(0, 25) ?? [];
  const topThree = data?.topUsers.slice(0, 3) ?? [];
  const currentPlayer = data?.currentUser;

  return (
    <div className="flex max-w-full">
    <div className="min-h-full bg-base-100 md:py-10 px-4 flex justify-center items-center">
      <div className="max-w-4xl rounded-3xl p-6 md:p-10">
        <div className="flex flex-col gap-4">
          
          {/* Header */}
          <div className="text-center flex flex-col items-center gap-2 mb-4">
            <h1 className="text-4xl font-black text-base-content tracking-tight">
              Leaderboard
            </h1>
            <p className="text-sm text-base-content/60 max-w-md">
              The highest ranked Othello masters in global matchmaking.
            </p>
          </div>

          <LeaderboardPodium users={topThree}/>
          <div className="divider"/> 
          <LeaderboardTable users={topPlayers} currentUser={currentPlayer}/>

        </div>
      </div>
    </div>
    </div>
  );
};

export default Leaderboard;