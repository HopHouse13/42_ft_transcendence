/*
  Warnings:

  - A unique constraint covering the columns `[token_password]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "users_token_password_key" ON "users"("token_password");
