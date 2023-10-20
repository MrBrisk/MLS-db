import mysql from 'mysql2';

import dotenv from 'dotenv';
dotenv.config();

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
}).promise();

export async function addTeam(team_id, team_name, team_name_abbrev, year_founded, year_joined, city) {
  return await pool.query(`
  INSERT IGNORE INTO team (team_id, team_name, team_name_abbrev, year_founded, year_joined, city)
    VALUES(?, ?, ?, ?, ?, ?)`,
    [team_id, team_name, team_name_abbrev, year_founded, year_joined, city]
  );
}

export async function addPlayer(player_id, first_name, last_name, date_of_birth, nationality, height_cm, weight_kg, jersey_number, position) {
  return await pool.query(`
  INSERT IGNORE INTO player (player_id, first_name, last_name, date_of_birth, nationality, height_cm, weight_kg, jersey_number, position)
    VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [player_id, first_name, last_name, date_of_birth, nationality, height_cm, weight_kg, jersey_number, position]
  );
}

export async function addGame(game_id, date_played, home_team_score, away_team_score, home_team_id, away_team_id, game_type, round) {
  return await pool.query(`
  INSERT IGNORE INTO game (game_id, date_played, home_team_score, away_team_score, home_team_id, away_team_id, game_type, round)
    VALUES(?, ?, ?, ?, ?, ?, ?, ?)`,
    [game_id, date_played, home_team_score, away_team_score, home_team_id, away_team_id, game_type, round]
  );
}

export async function addHomeTeamGame(team_id, game_id, season) {
  return await pool.query(`
  INSERT IGNORE INTO home_team_game (team_id, game_id, season)
    VALUES(?, ?, ?)`,
    [team_id, game_id, season]
  );
}

export async function addAwayTeamGame(team_id, game_id, season) {
  return await pool.query(`
  INSERT IGNORE INTO away_team_game (team_id, game_id, season)
    VALUES(?, ?, ?)`,
    [team_id, game_id, season]
  );
}

export async function addPlayerToTeamSeason(player_id, team_id, season) {
  return await pool.query(`
  INSERT IGNORE INTO player_team_season (player_id, team_id, season, games_played)
    VALUES(?, ?, ?, 0)`,
    [player_id, team_id, season]
  );
}

export async function addPlayerGameStats(player_id, game_id, season, goals, assists, saves, shots_faced, goals_conceded, shots_on_goal, minutes_played, yellow_cards, red_cards) {
  return await pool.query(`
  INSERT IGNORE INTO player_game_stats (player_id, game_id, season, goals, assists, saves, shots_faced, goals_conceded, shots_on_goal, minutes_played, yellow_cards, red_cards)
    VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [player_id, game_id, season, goals, assists, saves, shots_faced, goals_conceded, shots_on_goal, minutes_played, yellow_cards, red_cards]
  );
}
