-- RenameColumn (real renames, not drop+create, to preserve any in-flight data)
ALTER TABLE "users" RENAME COLUMN "token_password" TO "password_token";
ALTER TABLE "users" RENAME COLUMN "token_password_expires_at" TO "password_token_expires_at";
ALTER TABLE "users" RENAME COLUMN "token_refresh" TO "refresh_token";
ALTER TABLE "users" RENAME COLUMN "token_refresh_expires_at" TO "refresh_token_expires_at";

-- RenameIndex (keep the unique constraint names in sync with the renamed columns)
ALTER INDEX "users_token_password_key" RENAME TO "users_password_token_key";
ALTER INDEX "users_token_refresh_key" RENAME TO "users_refresh_token_key";
