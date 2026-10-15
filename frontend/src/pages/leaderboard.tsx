import React from "react";
import LeaderboardTable from "../components/LeaderboardTable";
import type { LeaderboardUser } from "../types/leaderboardTypes";
import LeaderboardPodium from "../components/LeaderboardPodium";
import useLeaderboard from "../hooks/useLeaderboard";
import Loader from "./loader";

// const MOCK_LEADERBOARD: LeaderboardUser[] = [
//   { id: "a1", rank: 1, username: "Grandmaster_Othello", avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Grandmaster", elo: 2450, wins: 182, losses: 24, winRate: "88.3%" },
//   { id: "j5", rank: 2, username: "CornerTrapper", avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Corner", elo: 2310, wins: 154, losses: 31, winRate: "83.2%" },
//   { id: "c0", rank: 3, username: "BlackDiscPro", avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=BlackDisc", elo: 2240, wins: 140, losses: 38, winRate: "78.6%" },
//   { id: "v3", rank: 4, username: "WhiteFlipper", avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Flipper", elo: 2150, wins: 128, losses: 45, winRate: "74.0%" },
//   { id: "p3", rank: 5, username: "ReversiKing", avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Reversi", elo: 2090, wins: 115, losses: 42, winRate: "73.2%" },
//   { id: "a4", rank: 6, username: "TacticalMind", avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Tactical", elo: 2010, wins: 98, losses: 39, winRate: "71.5%" },
//   { id: "v7", rank: 7, username: "NoPassNeeded", avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=NoPass", elo: 1980, wins: 89, losses: 41, winRate: "68.4%" },
//   { id: "b6", rank: 8, username: "EdgeMaster", avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Edge", elo: 1920, wins: 82, losses: 44, winRate: "65.0%" },
//   { id: "m9", rank: 9, username: "ParityWizard", avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=ParityWizard", elo: 1890, wins: 79, losses: 43, winRate: "64.8%" },
//   { id: "x2", rank: 10, username: "XSquareSniper", avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=XSquareSniper", elo: 1860, wins: 75, losses: 42, winRate: "64.1%" },
//   { id: "k1", rank: 11, username: "StableDiscGuy", avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=StableDiscGuy", elo: 1835, wins: 73, losses: 45, winRate: "61.9%" },
//   { id: "d4", rank: 12, username: "MobilityGuru", avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=MobilityGuru", elo: 1810, wins: 70, losses: 46, winRate: "60.3%" },
//   { id: "r8", rank: 13, username: "CSquareLover", avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=CSquareLover", elo: 1790, wins: 68, losses: 47, winRate: "59.1%" },
//   { id: "t5", rank: 14, username: "FrontierKiller", avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=FrontierKiller", elo: 1765, wins: 66, losses: 48, winRate: "57.9%" },
//   { id: "g3", rank: 15, username: "QuietMoveBot", avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=QuietMoveBot", elo: 1740, wins: 64, losses: 49, winRate: "56.6%" },
//   { id: "u7", rank: 16, username: "DiagonalDominator", avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=DiagonalDominator", elo: 1720, wins: 62, losses: 50, winRate: "55.4%" },
//   { id: "f2", rank: 17, username: "EndgameEngine", avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=EndgameEngine", elo: 1695, wins: 60, losses: 51, winRate: "54.1%" },
//   { id: "h9", rank: 18, username: "WipeoutRisk", avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=WipeoutRisk", elo: 1675, wins: 58, losses: 52, winRate: "52.7%" },
//   { id: "y4", rank: 19, username: "CornerGiver", avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=CornerGiver", elo: 1650, wins: 56, losses: 53, winRate: "51.4%" },
//   { id: "z6", rank: 20, username: "EvaporationStrategy", avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=EvaporationStrategy", elo: 1630, wins: 55, losses: 54, winRate: "50.5%" },
//   { id: "l3", rank: 21, username: "SweetSixteen", avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=SweetSixteen", elo: 1610, wins: 53, losses: 54, winRate: "49.5%" },
//   { id: "q8", rank: 22, username: "BoardControl", avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=BoardControl", elo: 1590, wins: 51, losses: 55, winRate: "48.1%" },
//   { id: "w1", rank: 23, username: "ReversiNoob", avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=ReversiNoob", elo: 1570, wins: 50, losses: 56, winRate: "47.2%" },
//   { id: "e5", rank: 24, username: "FlipMaster99", avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=FlipMaster99", elo: 1550, wins: 48, losses: 57, winRate: "45.7%" },
//   { id: "s2", rank: 25, username: "AlphaOthello", avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=AlphaOthello", elo: 1530, wins: 47, losses: 58, winRate: "44.8%" },
//   { id: "n7", rank: 26, username: "CenterGrabber", avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=CenterGrabber", elo: 1515, wins: 45, losses: 58, winRate: "43.7%" },
//   { id: "i0", rank: 27, username: "DiscSurfer", avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=DiscSurfer", elo: 1495, wins: 44, losses: 59, winRate: "42.7%" },
//   { id: "o4", rank: 28, username: "OthelloLover21", avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=OthelloLover21", elo: 1480, wins: 42, losses: 60, winRate: "41.2%" },
//   { id: "k9", rank: 29, username: "CornerHunter", avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=CornerHunter", elo: 1460, wins: 41, losses: 61, winRate: "40.2%" },
//   { id: "p6", rank: 30, username: "MinimaxPlayer", avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=MinimaxPlayer", elo: 1445, wins: 39, losses: 61, winRate: "39.0%" },
//   { id: "j1", rank: 31, username: "GreenGridGamer", avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=GreenGridGamer", elo: 1430, wins: 38, losses: 62, winRate: "38.0%" },
//   { id: "c8", rank: 32, username: "TempoStealer", avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=TempoStealer", elo: 1415, wins: 36, losses: 62, winRate: "36.7%" },
//   { id: "v5", rank: 33, username: "LastMoveHero", avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=LastMoveHero", elo: 1400, wins: 35, losses: 63, winRate: "35.7%" },
//   { id: "b2", rank: 34, username: "SymmetricPlay", avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=SymmetricPlay", elo: 1385, wins: 33, losses: 63, winRate: "34.4%" },
//   { id: "m7", rank: 35, username: "WipeoutMaster", avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=WipeoutMaster", elo: 1370, wins: 32, losses: 64, winRate: "33.3%" },
//   { id: "x0", rank: 36, username: "WingAttacker", avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=WingAttacker", elo: 1355, wins: 30, losses: 64, winRate: "31.9%" },
//   { id: "k4", rank: 37, username: "UnstableDisc", avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=UnstableDisc", elo: 1340, wins: 29, losses: 65, winRate: "30.9%" },
//   { id: "d1", rank: 38, username: "A1CornerOnly", avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=A1CornerOnly", elo: 1325, wins: 28, losses: 66, winRate: "29.8%" },
//   { id: "r6", rank: 39, username: "H8CornerGrab", avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=H8CornerGrab", elo: 1310, wins: 26, losses: 66, winRate: "28.3%" },
//   { id: "t2", rank: 40, username: "EarlyGamePro", avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=EarlyGamePro", elo: 1295, wins: 25, losses: 67, winRate: "27.2%" },
//   { id: "g8", rank: 41, username: "MidgameBlunder", avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=MidgameBlunder", elo: 1280, wins: 23, losses: 67, winRate: "25.6%" },
//   { id: "u1", rank: 42, username: "PassPenalty", avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=PassPenalty", elo: 1265, wins: 22, losses: 68, winRate: "24.4%" },
//   { id: "f9", rank: 43, username: "FlipItAll", avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=FlipItAll", elo: 1250, wins: 20, losses: 68, winRate: "22.7%" },
//   { id: "h3", rank: 44, username: "GreedyFlipper", avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=GreedyFlipper", elo: 1230, wins: 19, losses: 69, winRate: "21.6%" },
//   { id: "y7", rank: 45, username: "CasualOthello", avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=CasualOthello", elo: 1210, wins: 17, losses: 69, winRate: "19.8%" },
//   { id: "z1", rank: 46, username: "TileFlipperBot", avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=TileFlipperBot", elo: 1190, wins: 16, losses: 70, winRate: "18.6%" },
//   { id: "l8", rank: 47, username: "BadCornerMove", avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=BadCornerMove", elo: 1170, wins: 14, losses: 70, winRate: "16.7%" },
//   { id: "q2", rank: 48, username: "RandomMover", avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=RandomMover", elo: 1150, wins: 12, losses: 71, winRate: "14.5%" },
//   { id: "w9", rank: 49, username: "FirstTimePlaying", avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=FirstTimePlaying", elo: 1120, wins: 10, losses: 72, winRate: "12.2%" },
//   { id: "e3", rank: 50, username: "OthelloBeginner", avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=OthelloBeginner", elo: 1080, wins: 7, losses: 73, winRate: "8.8%" }
// ];

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

  // const topThree = MOCK_LEADERBOARD.slice(0, 3); //[DEBUG]
  // const topPlayers = MOCK_LEADERBOARD.slice(0); //[DEBUG]
  // const currentPlayer = MOCK_LEADERBOARD.at(10); //[DEBUG]

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