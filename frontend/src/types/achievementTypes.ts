export default interface AchievementProps{
    id: string;
    title: string;
    description: string;
    icon: string;
};

export interface UserAchievement{
    achievementId: string;
    unlockedAt: string;
}