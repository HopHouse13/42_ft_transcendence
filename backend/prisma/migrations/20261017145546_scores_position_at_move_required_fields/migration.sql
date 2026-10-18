/*
  Warnings:

  - Made the column `position` on table `moves` required. This step will fail if there are existing NULL values in that column.
  - Made the column `black_score` on table `moves` required. This step will fail if there are existing NULL values in that column.
  - Made the column `white_score` on table `moves` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "moves" ALTER COLUMN "position" SET NOT NULL,
ALTER COLUMN "black_score" SET NOT NULL,
ALTER COLUMN "white_score" SET NOT NULL;
