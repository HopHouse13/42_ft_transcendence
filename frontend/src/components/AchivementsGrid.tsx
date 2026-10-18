import ACHIEVEMENT_LIST from "../constants/achievementList";
import AchievementCard from "./AchievementCard";
import type { UserAchievement } from "../types/achievementTypes";

const AchievementsGrid = ({userUnlocked}: {userUnlocked: UserAchievement[]}) => {
    const unlockedAchievements = new Map(userUnlocked.map((item) => [item.achievementId, item.unlockedAt]))

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {ACHIEVEMENT_LIST.map((achievement) => {
                const isUnlocked = unlockedAchievements.has(achievement.id);
                const unlockedAt = unlockedAchievements.get(achievement.id);
                return (
                    <AchievementCard
                        key={achievement.id}
                        achievement={achievement}
                        isUnlocked={isUnlocked}
                        unlockedAt={unlockedAt}
                    />
                )
            })}
        </div>
    )
}; 

export default AchievementsGrid;