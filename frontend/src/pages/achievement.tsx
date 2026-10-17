import ACHIEVEMENT_LIST from "../constants/achievementList";
import { useAuthContext } from "../hooks/useAuthContext";
import { useAchievement } from "../hooks/useAchievements";
import Loader from "./loader";
import AchievementsGrid from "../components/AchivementsGrid";

const Achievement = () => {
    const { user } = useAuthContext();
    const userId = user?.id ?? '';
    const { data, isLoading, isError } = useAchievement(userId);

/*    if (isLoading) 
        return(<Loader />);

    if (isError)
        return(
            <div className="alert alert-error max-w-md mx-auto my-8">
                <span>Failed to load achievements. Please try again.</span>
            </div>
    );*/

    const nbAchievements = ACHIEVEMENT_LIST.length;
    const nbUnlockedAchievements = data?.length ?? 0;
    const progressPercentage = Math.round((nbUnlockedAchievements / nbAchievements) * 100);

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-6">
            <div className="bg-base-100 border border-base-200 rounded-xl p-6 shadow-sm space-y-3">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold tracking-widest">Achievements</h1>
                    <span className="font-mono text-sm font-semibold text-base-content/80">
                        {nbUnlockedAchievements} / {nbAchievements} ({progressPercentage}%)
                    </span>
                </div>
                <progress 
                    className="progress progress-neutral w-full"
                    value={nbUnlockedAchievements}
                    max={nbAchievements}
                ></progress>
            </div>
            <AchievementsGrid userUnlocked={data ?? []}/>
        </div>
    )
}

export default Achievement;