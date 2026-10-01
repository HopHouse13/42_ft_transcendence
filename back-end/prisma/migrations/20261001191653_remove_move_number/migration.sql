/*
  Warnings:

  - The primary key for the `moves` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `move_number` on the `moves` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "moves" DROP CONSTRAINT "moves_pkey",
DROP COLUMN "move_number",
ADD CONSTRAINT "moves_pkey" PRIMARY KEY ("game_id", "created_at");
