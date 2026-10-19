import { useMemo } from 'react';
import { useAchievement } from "../../hooks/useAchievements";
import ACHIEVEMENT_LIST from "../../constants/achievementList";
import AchievementCard from "../AchievementCard";

interface AchievementPreviewProps {
    userId: string;
}

const AchievementPreview = ({ userId }: AchievementPreviewProps) => {
  const { data } = useAchievement(userId);

  const last4Unlocked = useMemo(() => {
    if (!data) return [];

    const unlockedAchievements = new Map(
      data.map((item) => [item.achievementId, item.unlockedAt])
    );

    return Array.from(unlockedAchievements.entries())
      .filter(([, unlockedAt]) => Boolean(unlockedAt))
      .sort(([, a], [, b]) => new Date(b).getTime() - new Date(a).getTime())
      .map(([achievementId, unlockedAt]) => {
        const details = ACHIEVEMENT_LIST.find((ach) => ach.id === achievementId);
        if (!details) return null; // Sécurité si l'ID n'existe pas dans la liste

        return {
          ...details,
          achievementId,
          unlockedAt,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }, [data]);

  if (!data) return null; // ou un loader/skeleton

  return (
    <div className="card bg-base-200 border border-base-300 shadow-xl w-full max-w-full">
      <div className="card-body">
        <h2 className="card-title text-lg mb-2">Achievements</h2>
        {last4Unlocked.length === 0 ?(
        <span className="opacity-60">
            No achievement unlocked yet.
        </span>
        ) : (
        <div className="flex flex-row flex-nowrap gap-2 overflow-x-auto pb-2 items-stretch">
            {last4Unlocked.map((achievement) => (
                <div className="w-48 shrink-0 flex" key={achievement.achievementId}>
                    <AchievementCard
                        achievement={achievement}
                        isUnlocked={true}
                        unlockedAt={achievement.unlockedAt}
                        />
                </div>
            ))}
        </div>
        )}
      </div>
    </div>
  );
};

export default AchievementPreview;