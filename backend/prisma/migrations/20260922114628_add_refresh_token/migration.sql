/*
  Warnings:

  - A unique constraint covering the columns `[token_refresh]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "token_refresh" VARCHAR(64),
ADD COLUMN     "token_refresh_expires_at" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "users_token_refresh_key" ON "users"("token_refresh");
