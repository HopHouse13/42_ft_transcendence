-- CreateEnum
CREATE TYPE "player_color" AS ENUM ('BLACK', 'WHITE');

-- CreateEnum
CREATE TYPE "game_status" AS ENUM ('IN_PROGRESS', 'FINISHED', 'ABANDONED');

-- CreateTable
CREATE TABLE "games" (
    "id" UUID NOT NULL,
    "status" "game_status" NOT NULL DEFAULT 'IN_PROGRESS',
    "black_player_id" UUID NOT NULL,
    "white_player_id" UUID NOT NULL,
    "winner_id" UUID,
    "black_score" INTEGER,
    "white_score" INTEGER,
    "current_player" "player_color" NOT NULL DEFAULT 'BLACK',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "games_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "moves" (
    "game_id" UUID NOT NULL,
    "move_number" INTEGER NOT NULL,
    "color_player" "player_color" NOT NULL,
    "position" INTEGER,
    "board_after" CHAR(64) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "moves_pkey" PRIMARY KEY ("game_id","move_number")
);

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_black_player_id_fkey" FOREIGN KEY ("black_player_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_white_player_id_fkey" FOREIGN KEY ("white_player_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_winner_id_fkey" FOREIGN KEY ("winner_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moves" ADD CONSTRAINT "moves_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
