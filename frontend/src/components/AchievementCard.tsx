import type AchievementProps from '../types/achievementTypes';

interface AchievementCardProps {
    achievement: AchievementProps;
    isUnlocked: boolean;
    unlockedAt?: string;
}

const AchievementCard = ({achievement, isUnlocked, unlockedAt}: AchievementCardProps) => {
    return (
        <div className={`card shadow-sm 
            ${isUnlocked 
                ? "bg-base-200" 
                : "bg-base-100 text-base-content/40 grayscale opacity-60"} 
        `}>
            <figure className="text-6xl mt-4 p-3">
                {achievement.icon}
            </figure>
            <div className="card-body">
                <h2 className="card-title font-bold">{achievement.title}</h2>
                <p className="text-sm">{achievement.description}</p>
                {isUnlocked && unlockedAt && (
                    <span className="text-xs opacity-80 mt-2 font-mono items-end">
                        {new Date(unlockedAt).toLocaleDateString()}
                    </span>
                )}
            </div>
        </div>
    );
};

export default AchievementCard;