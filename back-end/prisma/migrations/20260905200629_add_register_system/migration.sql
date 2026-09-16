/*
  Warnings:

  - The values [IN_PROGRESS] on the enum `game_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
ALTER TYPE "auth_mode" ADD VALUE 'AUTH42';

-- AlterEnum
BEGIN;
CREATE TYPE "game_status_new" AS ENUM ('INGAME', 'BREAK', 'FINISHED', 'ABANDONED');
ALTER TABLE "public"."games" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "games" ALTER COLUMN "status" TYPE "game_status_new" USING ("status"::text::"game_status_new");
ALTER TYPE "game_status" RENAME TO "game_status_old";
ALTER TYPE "game_status_new" RENAME TO "game_status";
DROP TYPE "public"."game_status_old";
ALTER TABLE "games" ALTER COLUMN "status" SET DEFAULT 'INGAME';
COMMIT;

-- AlterTable
ALTER TABLE "games" ALTER COLUMN "status" SET DEFAULT 'INGAME';
