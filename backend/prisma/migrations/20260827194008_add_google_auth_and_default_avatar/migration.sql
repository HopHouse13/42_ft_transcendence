/*
  Warnings:

  - Made the column `avatar_url` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "auth_mode" AS ENUM ('LOCAL', 'GOOGLE');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "auth_mode" "auth_mode" NOT NULL DEFAULT 'LOCAL',
ADD COLUMN     "provider_id" VARCHAR(255),
ALTER COLUMN "password_hash" DROP NOT NULL,
ALTER COLUMN "avatar_url" SET NOT NULL,
ALTER COLUMN "avatar_url" SET DEFAULT '/uploads/avatars/default.png';
