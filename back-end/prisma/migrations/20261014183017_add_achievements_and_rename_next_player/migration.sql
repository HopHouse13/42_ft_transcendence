-- AlterTable
ALTER TABLE "games" RENAME COLUMN "current_player" TO "next_player";

-- CreateTable
CREATE TABLE "achievements" (
    "user_id" UUID NOT NULL,
    "achievement_id" VARCHAR(50) NOT NULL,
    "unlocked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("user_id","achievement_id")
);

-- AddForeignKey
ALTER TABLE "achievements" ADD CONSTRAINT "achievements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
