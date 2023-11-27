import mysql from 'mysql2';

import dotenv from 'dotenv';
dotenv.config();

export const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
}).promise();

export async function addTeam(team_name, team_name_abbrev, year_founded, year_joined, city, primary_color, secondary_color) {
  return await pool.query(`
  INSERT INTO team (team_name, team_name_abbrev, year_founded, year_joined, city, primary_color, secondary_color)
    VALUES(?, ?, ?, ?, ?, ?, ?)`,
    [team_name, team_name_abbrev, year_founded, year_joined, city, primary_color, secondary_color]
  );
}

export async function addPlayer(first_name, last_name, date_of_birth, nationality, height_cm, weight_kg, jersey_number, position) {
  return await pool.query(`
  INSERT INTO player (first_name, last_name, date_of_birth, nationality, height_cm, weight_kg, jersey_number, position)
    VALUES(?, ?, ?, ?, ?, ?, ?, ?)`,
    [first_name, last_name, date_of_birth, nationality, height_cm, weight_kg, jersey_number, position]
  );
}

export async function addGame(date_played, home_team_score, away_team_score, home_team_id, away_team_id, game_type, round) {
  return await pool.query(`
  INSERT INTO game (date_played, home_team_score, away_team_score, home_team_id, away_team_id, game_type, round)
    VALUES(?, ?, ?, ?, ?, ?, ?)`,
    [date_played, home_team_score, away_team_score, home_team_id, away_team_id, game_type, round]
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

export async function getPlayers() {
  return await pool.query(`
  SELECT *
    FROM player`
  );
}

export async function getTeams() {
  return await pool.query(`
  SELECT *
    FROM team`
  );
}

export async function getGames() {
  return await pool.query(`
  SELECT *
    FROM game`
  );
}

export async function getPlayerIds() {
  return await pool.query(`
  SELECT player_id
    FROM player`
  );
}

export async function getTeamIds() {
  return await pool.query(`
  SELECT team_id
    FROM team`
  );
}

export async function getGameIds() {
  return await pool.query(`
  SELECT game_id
    FROM game`
  );
}

export async function editTeam(data) {
  let query = 'UPDATE team\nSET ';
  for (const [key, value] of Object.entries(data)) {
    if (key != 'team_id') {
      query += `${key}='${value}', `;
    }
  }
  query = query.slice(0, -2);
  query += `\nWHERE team_id = ${data['team_id']};`;
  return await pool.query(query);
}

export async function deleteTeam(team_id) {
  return await pool.query(`
  DELETE FROM team
    WHERE team_id = ${team_id}`
  );
}

export async function editPlayer(data) {
  let query = 'UPDATE player\nSET ';
  for (const [key, value] of Object.entries(data)) {
    if (key != 'player_id') {
      query += `${key}='${value}', `;
    }
  }
  query = query.slice(0, -2);
  query += `\nWHERE player_id = ${data['player_id']};`;
  return await pool.query(query);
}

export async function deletePlayer(player_id) {
  return await pool.query(`
  DELETE FROM player
    WHERE player_id = ${player_id}`
  );
}

export async function editGame(data) {
  let query = 'UPDATE game\nSET ';
  for (const [key, value] of Object.entries(data)) {
    if (key != 'game_id') {
      query += `${key}='${value}', `;
    }
  }
  query = query.slice(0, -2);
  query += `\nWHERE game_id = ${data['game_id']};`;
  return await pool.query(query);
}

export async function deleteGame(game_id) {
  return await pool.query(`
  DELETE FROM game
    WHERE game_id = ${game_id}`
  );
}

export async function advancedQuery1(season) {
  return await pool.query(`
  SELECT p.first_name, p.last_name, SUM(Player_Game_Stats.goals) AS total_goals
    FROM player AS p
      JOIN Player_Game_Stats ON p.player_id = Player_Game_Stats.player_id
    WHERE Player_Game_Stats.season = ?
    GROUP BY p.player_id
    ORDER BY total_goals DESC
    LIMIT 5;`,
  season
);
}
