-- Utilisateurs
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username        VARCHAR(50) UNIQUE NOT NULL,
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   VARCHAR(255),          -- nullable si login via OAuth uniquement
    avatar_url      VARCHAR(255),
    is_2fa_enabled  BOOLEAN DEFAULT FALSE,
    twofa_secret    VARCHAR(255),
    oauth_provider  VARCHAR(50),           -- '42', 'google', null
    oauth_id        VARCHAR(255),
    status          VARCHAR(20) DEFAULT 'offline', -- online/offline/in_game
    created_at      TIMESTAMP DEFAULT now(),
    updated_at      TIMESTAMP DEFAULT now()
);

-- Statistiques (dénormalisées pour perf, mise à jour à chaque fin de partie)
CREATE TABLE user_stats (
    user_id         UUID PRIMARY KEY REFERENCES users(id),
    wins            INT DEFAULT 0,
    losses          INT DEFAULT 0,
    draws           INT DEFAULT 0,
    total_games     INT DEFAULT 0
);

-- Relations sociales
CREATE TABLE friendships (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id),
    friend_id       UUID REFERENCES users(id),
    status          VARCHAR(20) DEFAULT 'pending', -- pending/accepted/blocked
    created_at      TIMESTAMP DEFAULT now(),
    UNIQUE(user_id, friend_id)
);

-- Parties
CREATE TABLE games (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_black_id UUID REFERENCES users(id),
    player_white_id UUID REFERENCES users(id),   -- nullable si IA
    is_vs_ai        BOOLEAN DEFAULT FALSE,
    status          VARCHAR(20) DEFAULT 'waiting', -- waiting/ongoing/finished/abandoned
    board_state     JSONB,                 -- plateau 8x8 sérialisé (état courant)
    current_turn    VARCHAR(10),           -- 'black' / 'white'
    winner_id       UUID REFERENCES users(id) NULL,
    score_black     INT DEFAULT 2,
    score_white     INT DEFAULT 2,
    tournament_id   UUID REFERENCES tournaments(id) NULL,
    created_at      TIMESTAMP DEFAULT now(),
    finished_at     TIMESTAMP
);

-- Historique des coups (utile pour replay / anti-triche / debug)
CREATE TABLE game_moves (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id         UUID REFERENCES games(id),
    player_id       UUID REFERENCES users(id),
    row             INT NOT NULL,
    col             INT NOT NULL,
    flipped_cells   JSONB,                 -- liste des pions retournés à ce coup
    move_number     INT NOT NULL,
    created_at      TIMESTAMP DEFAULT now()
);

-- Tournois
CREATE TABLE tournaments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100) NOT NULL,
    status          VARCHAR(20) DEFAULT 'pending', -- pending/ongoing/finished
    max_players     INT DEFAULT 8,
    created_by       UUID REFERENCES users(id),
    created_at      TIMESTAMP DEFAULT now()
);

CREATE TABLE tournament_participants (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id   UUID REFERENCES tournaments(id),
    user_id         UUID REFERENCES users(id),
    alias           VARCHAR(50),           -- pseudo pour ce tournoi (souvent requis dans le sujet)
    eliminated       BOOLEAN DEFAULT FALSE,
    joined_at       TIMESTAMP DEFAULT now(),
    UNIQUE(tournament_id, user_id)
);

-- Bracket / matchs de tournoi (lie un game à une position dans l'arbre)
CREATE TABLE tournament_matches (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id   UUID REFERENCES tournaments(id),
    game_id         UUID REFERENCES games(id) NULL,
    round           INT NOT NULL,
    match_index     INT NOT NULL          -- position dans le round
);
