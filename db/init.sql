-- Une seule ligne représente "la partie en cours".
-- id fixe = 1, comme convenu, pour rester simple à ce stade.
CREATE TABLE IF NOT EXISTS games (
    id INTEGER PRIMARY KEY,
    board JSONB NOT NULL,
    current_player VARCHAR(5) NOT NULL,
    is_game_over BOOLEAN NOT NULL DEFAULT FALSE
);
