/*
  Warnings:

  - The values [INGAME,BREAK] on the enum `game_status` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[auth_mode,provider_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "game_status_new" AS ENUM ('IN_PROGRESS', 'FINISHED', 'ABANDONED');
ALTER TABLE "public"."games" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "games" ALTER COLUMN "status" TYPE "game_status_new" USING ("status"::text::"game_status_new");
ALTER TYPE "game_status" RENAME TO "game_status_old";
ALTER TYPE "game_status_new" RENAME TO "game_status";
DROP TYPE "public"."game_status_old";
ALTER TABLE "games" ALTER COLUMN "status" SET DEFAULT 'IN_PROGRESS';
COMMIT;

-- AlterTable
ALTER TABLE "games" ALTER COLUMN "status" SET DEFAULT 'IN_PROGRESS';

-- CreateIndex
CREATE UNIQUE INDEX "users_auth_mode_provider_id_key" ON "users"("auth_mode", "provider_id");
