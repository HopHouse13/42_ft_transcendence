import type AchievementProps from "../types/achievementTypes";

const ACHIEVEMENT_LIST: AchievementProps[] = [
  {
    id: "win_first",
    title: "First blood",
    description: "Win your very first online Othello match.",
    icon: "🏅",
  },
  {
    id: "win_both_sides",
    title: "Ambidextrous",
    description: "Win a match with Black and a match with White.",
    icon: "🎭",
  },
  {
    id: "brd_corner",
    title: "Real Estate Investor",
    description: "Claim your first corner of the board.",
    icon: "🏠",
  },
  {
    id: "brd_4corners",
    title: "Corner Monopoly",
    description: "Control all 4 corners by the end of the game.",
    icon: "🏰",
  },
  {
    id: "brd_edges",
    title: "Gated Community",
    description: "Lock down every single edge tile with your color.",
    icon: "🔒",
  },
  {
    id: "mov_flip10",
    title: "Domino Effect",
    description: "Flip 10 or more discs in a single move.",
    icon: "💥",
  },
  {
    id: "mov_pass1",
    title: "Access Denied",
    description: "Force your opponent to pass their turn.",
    icon: "🤐",
  },
  {
    id: "mov_pass3",
    title: "You're fired !",
    description: "Force your opponent to pass their turn at least 3 times in one game.",
    icon: "🔇",
  },
  {
    id: "win_close",
    title: "By a Hair",
    description: "Win a match by a razor-thin 2-disc margin or less.",
    icon: "🤏",
  },
  {
    id: "win_blowout",
    title: "No Contest",
    description: "Win convincingly with 50+ discs on the board.",
    icon: "🪦",
  },
  {
    id: "win_wipeout",
    title: "Clean Slate",
    description: "Completely wipe every opponent disc off the board before the end.",
    icon: "🔞",
  },
  {
    id: "win_comeback",
    title: "Back From The Dead",
    description: "Come back to win after trailing by 15+ discs.",
    icon: "🧟",
  },
  {
    id: "win_3corners_down",
    title: "Against The Odds",
    description: "Win after your opponent controlled 3 corners during the match.",
    icon: "🏴‍☠️",
  },
  {
    id: "stk_win5",
    title: "On Fire",
    description: "Secure 5 ranked wins in a row.",
    icon: "🔥",
  },
  {
    id: "cum_win50",
    title: "Overtime Worker",
    description: "Reach 50 total victories on the platform.",
    icon: "🏆",
  },
  {
    id: "soc_rival10",
    title: "Rivalry Initiated",
    description: "Complete 10 matches against the same player on your friends list.",
    icon: "🙏",
  },
  {
    id: "elo_1200",
    title: "Promotion Granted",
    description: "Cross the 1,200 Elo rating threshold.",
    icon: "📝",
  },
  {
    id: "elo_1500",
    title: "Senior Partner",
    description: "Reach a 1,500+ Elo rating on the platform.",
    icon: "👔",
  },
  {
    id: "elo_1800",
    title: "Chief strategy officer",
    description: "Peak at an Elo rating of 1,800 or higher.",
    icon: "🧠",
  },
  {
    id: "elo_giant_slayer",
    title: "David vs. Goliath",
    description: "Demolish a player rated 150+ Elo points above you.",
    icon: "🧌",
  },
];

export default  ACHIEVEMENT_LIST ;