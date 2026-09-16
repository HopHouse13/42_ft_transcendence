-- AlterTable
ALTER TABLE "users" ADD COLUMN     "token_password" VARCHAR(64),
ADD COLUMN     "token_password_expires_at" TIMESTAMP(3);
