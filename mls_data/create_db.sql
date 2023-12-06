CREATE DATABASE MLS_DB;
USE MLS_DB;

CREATE TABLE Team (
    team_id INTEGER AUTO_INCREMENT PRIMARY KEY NOT NULL,
    team_name VARCHAR(64) NOT NULL,
    team_name_abbrev VARCHAR(10) NOT NULL,
    year_founded YEAR NOT NULL,
    year_joined YEAR NOT NULL,
    city VARCHAR(50) NOT NULL,
    primary_color VARCHAR(8),
    secondary_color VARCHAR(8)
);

CREATE TABLE Player (
    player_id INTEGER AUTO_INCREMENT PRIMARY KEY NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50),
    date_of_birth DATE NOT NULL,
    nationality VARCHAR(64) NOT NULL,
    height_cm SMALLINT,
    weight_kg SMALLINT,
    jersey_number SMALLINT,
    position ENUM('forward', 'midfielder', 'defender', 'goalkeeper') NOT NULL
);

CREATE TABLE Game (
    game_id INTEGER AUTO_INCREMENT PRIMARY KEY NOT NULL,
    date_played DATETIME NOT NULL,
    season YEAR NOT NULL,
    home_team_score SMALLINT NOT NULL,
    away_team_score SMALLINT NOT NULL,
    home_team_id INTEGER NOT NULL,
    away_team_id INTEGER NOT NULL,
    game_type ENUM('regular season', 'playoffs') NOT NULL,
    round VARCHAR(30),
    FOREIGN KEY (home_team_id) REFERENCES Team(team_id) ON DELETE CASCADE,
    FOREIGN KEY (away_team_id) REFERENCES Team(team_id) ON DELETE CASCADE
);

CREATE TABLE Home_Team_Game (
    team_id INTEGER NOT NULL,
    game_id INTEGER NOT NULL,
    season YEAR NOT NULL,
    FOREIGN KEY (team_id) REFERENCES Team(team_id) ON DELETE CASCADE,
    FOREIGN KEY (game_id) REFERENCES Game(game_id) ON DELETE CASCADE,
    PRIMARY KEY (team_id, game_id, season)
);

CREATE TABLE Away_Team_Game (
    team_id INTEGER NOT NULL,
    game_id INTEGER NOT NULL,
    season YEAR NOT NULL,
    FOREIGN KEY (team_id) REFERENCES Team(team_id) ON DELETE CASCADE,
    FOREIGN KEY (game_id) REFERENCES Game(game_id) ON DELETE CASCADE,
    PRIMARY KEY (team_id, game_id, season)
);

CREATE TABLE Player_Team_Season (
    player_id INTEGER NOT NULL,
    team_id INTEGER NOT NULL,
    season YEAR NOT NULL,
    games_played SMALLINT DEFAULT 0,
    FOREIGN KEY (team_id) REFERENCES Team(team_id) ON DELETE CASCADE,
    FOREIGN KEY (player_id) REFERENCES Player(player_id) ON DELETE CASCADE,
    PRIMARY KEY (team_id, player_id, season)
);

CREATE TABLE Player_Game_Stats (
    player_id INTEGER NOT NULL,
    game_id INTEGER NOT NULL,
    season YEAR NOT NULL,
    -- stats:
    goals SMALLINT DEFAULT 0,
    assists SMALLINT DEFAULT 0,
    saves SMALLINT DEFAULT 0,
    shots_faced SMALLINT DEFAULT 0,
    goals_conceded SMALLINT DEFAULT 0,
    shots_on_goal SMALLINT DEFAULT 0,
    minutes_played SMALLINT DEFAULT 0,
    yellow_cards SMALLINT DEFAULT 0,
    red_cards SMALLINT DEFAULT 0,
    FOREIGN KEY (game_id) REFERENCES Game(game_id) ON DELETE CASCADE,
    FOREIGN KEY (player_id) REFERENCES Player(player_id) ON DELETE CASCADE,
    PRIMARY KEY (game_id, player_id, season)
);

CREATE TRIGGER update_games_played
AFTER INSERT ON Player_Game_Stats
FOR EACH ROW
BEGIN
    IF NEW.minutes_played > 0 THEN
        UPDATE Player_Team_Season
        SET games_played = games_played + 1
        WHERE player_id = NEW.player_id AND season = NEW.season;
    END IF;
END;

CREATE TRIGGER decrement_games_played
AFTER DELETE ON Player_Game_Stats
FOR EACH ROW
BEGIN
    IF OLD.minutes_played > 0 THEN
        UPDATE Player_Team_Season
        SET games_played = games_played - 1
        WHERE team_id = OLD.player_id AND season = OLD.season;
    END IF;
END;
