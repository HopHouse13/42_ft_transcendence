/*
  Warnings:

  - You are about to drop the column `auth_mode` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `provider_id` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[google_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[git_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "users_auth_mode_provider_id_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "auth_mode",
DROP COLUMN "provider_id",
ADD COLUMN     "git_id" VARCHAR(255),
ADD COLUMN     "google_id" VARCHAR(255);

-- DropEnum
DROP TYPE "auth_mode";

-- CreateIndex
CREATE UNIQUE INDEX "users_google_id_key" ON "users"("google_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_git_id_key" ON "users"("git_id");
