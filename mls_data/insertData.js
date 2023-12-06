import mysql from 'mysql2';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql
  .createPool({
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  }).promise();

const playersByTeamBySeason = [
  JSON.parse(fs.readFileSync('mls_data/2021playersbyteam.json', 'utf-8')),
  JSON.parse(fs.readFileSync('mls_data/2022playersbyteam.json', 'utf-8')),
  JSON.parse(fs.readFileSync('mls_data/2023playersbyteam.json', 'utf-8')),
];
const matchDataBySeason = [
  JSON.parse(fs.readFileSync('mls_data/2021matchstats1.json', 'utf-8')),
  JSON.parse(fs.readFileSync('mls_data/2021matchstats2.json', 'utf-8')),
  JSON.parse(fs.readFileSync('mls_data/2021matchstats3.json', 'utf-8')),
  JSON.parse(fs.readFileSync('mls_data/2022matchstats1.json', 'utf-8')),
  JSON.parse(fs.readFileSync('mls_data/2022matchstats2.json', 'utf-8')),
  JSON.parse(fs.readFileSync('mls_data/2022matchstats3.json', 'utf-8')),
  JSON.parse(fs.readFileSync('mls_data/2023matchstats1.json', 'utf-8')),
  JSON.parse(fs.readFileSync('mls_data/2023matchstats2.json', 'utf-8')),
  JSON.parse(fs.readFileSync('mls_data/2023matchstats3.json', 'utf-8')),
];
const teamsMap = JSON.parse(fs.readFileSync('mls_data/teams.json', 'utf-8'));
const playerIdMap = JSON.parse(fs.readFileSync('mls_data/playerIds.json', 'utf-8'));
const gameIdMap = JSON.parse(fs.readFileSync('mls_data/gameIds.json', 'utf-8'));

insertData();

async function insertData() {
  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    console.log('Inserting teams...');
    const teams = await insertTeams();
    await connection.query(teams.query, teams.values);

    console.log('Inserting players...');
    const players = await insertPlayers();
    await connection.query(players.query, players.values);

    console.log('Inserting games...');
    const games = await insertGames();
    await connection.query(games[0].query, games[0].values);
    await connection.query(games[1].query, games[1].values);
    await connection.query(games[2].query, games[2].values);

    console.log('Inserting players to teams...');
    const rosters = await insertPlayersToTeams();
    await connection.query(rosters.query, rosters.values);

    console.log('Inserting player match stats...');
    const stats = await insertPlayerGameStats();
    await connection.query(stats.query, stats.values);

    await connection.commit();
  } catch (err) {
    console.log('Error');
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
    pool.end();
    console.log('Finished inserting');
  }
}

async function insertTeams() {
  const query = `
    INSERT IGNORE INTO team (team_id, team_name, team_name_abbrev, year_founded, year_joined, city, primary_color, secondary_color)
      VALUES ?`;
  let values = [];
  for (let key in teamsMap) {
    const team = teamsMap[key];
    values.push([
      team.team_id,
      team.team_name,
      team.team_name_abbrev,
      team.year_founded,
      team.year_joined,
      team.city,
      team.primary_color,
      team.secondary_color,
    ]);
  }
  return {
    query: query,
    values: [values]
  };
}

async function insertPlayers() {
  const query = `
    INSERT IGNORE INTO player (player_id, first_name, last_name, date_of_birth, nationality, height_cm, weight_kg, jersey_number, position)
      VALUES ?`;
  let values = [];
  playersByTeamBySeason.forEach((season) => {
    season.season_competitor_players.forEach((team) => {
      team.players.forEach((player) => {
        values.push([
          playerIdMap[player.id],
          player.first_name,
          player.last_name,
          player.date_of_birth,
          player.nationality,
          player.height,
          player.weight,
          player.jersey_number,
          player.type,
        ]);
      });
    });
  });
  return {
    query: query,
    values: [values]
  };
}

async function insertGames() {
  const query1 = `
    INSERT IGNORE INTO game (game_id, date_played, season, home_team_score, away_team_score, home_team_id, away_team_id, game_type, round)
      VALUES ?`;
  const query2 = `
    INSERT IGNORE INTO home_team_game (team_id, game_id, season)
      VALUES ?`;
  const query3 = `
    INSERT IGNORE INTO away_team_game (team_id, game_id, season)
      VALUES ?`;
  let values1 = [];
  let values2 = [];
  let values3 = [];
  matchDataBySeason.forEach((chunk) => {
    chunk.summaries.forEach(async (summary) => {
      let home_team_id = null;
      let away_team_id = null;
      if (
        summary.sport_event_status.status != "postponed" &&
        summary.sport_event_status.status != "cancelled" &&
        summary.sport_event_status.status != "not_started"
      ) {
        summary.statistics.totals.competitors.forEach((team) => {
          if (team.qualifier == "home") {
            home_team_id = teamsMap[team.id].team_id;
          } else if (team.qualifier == "away") {
            away_team_id = teamsMap[team.id].team_id;
          }
        });
        const date = summary.sport_event.start_time
          .split("+")[0]
          .replace("T", " ");
        const game_type = summary.sport_event.sport_event_context.stage.phase;
        const round =
          game_type == "regular season"
            ? null
            : summary.sport_event.sport_event_context.round.name;
        values1.push([
          gameIdMap[summary.sport_event.id],
          date,
          summary.sport_event.sport_event_context.season.year,
          summary.sport_event_status.home_score,
          summary.sport_event_status.away_score,
          home_team_id,
          away_team_id,
          game_type,
          round,
        ]);
        values2.push([
          home_team_id,
          gameIdMap[summary.sport_event.id],
          summary.sport_event.sport_event_context.season.year,
        ]);
        values3.push([
          away_team_id,
          gameIdMap[summary.sport_event.id],
          summary.sport_event.sport_event_context.season.year,
        ]);
      }
    });
  });
  return [
    {
      query: query1,
      values: [values1]
    },
    {
      query: query2,
      values: [values2]
    },
    {
      query: query3,
      values: [values3]
    }
  ];
}

async function insertPlayersToTeams() {
  let year = 2021;
  const query = `
    INSERT IGNORE INTO player_team_season (player_id, team_id, season, games_played)
      VALUES ?`;
  let values = [];
  playersByTeamBySeason.forEach((season) => {
    season.season_competitor_players.forEach((team) => {
      team.players.forEach((player) => {
        values.push([
          playerIdMap[player.id],
          teamsMap[team.id].team_id,
          year + '',
          0
        ]);
      });
    });
    year++;
  });
  return {
    query: query,
    values: [values]
  };
}

async function insertPlayerGameStats() {
  const query = `
    INSERT IGNORE INTO player_game_stats (player_id, game_id, season, goals, assists, saves, shots_faced, goals_conceded, shots_on_goal, minutes_played, yellow_cards, red_cards)
      VALUES ?`;
  let values = [];
  matchDataBySeason.forEach((chunk) => {
    chunk.summaries.forEach((summary) => {
      if (
        summary.sport_event_status.status != "postponed" &&
        summary.sport_event_status.status != "cancelled" &&
        summary.sport_event_status.status != "not_started"
      ) {
        summary.statistics.totals.competitors.forEach((team) => {
          if (team.players != null) {
            team.players.forEach((player) => {
              const stats = player.statistics;
              values.push([
                playerIdMap[player.id],
                gameIdMap[summary.sport_event.id],
                summary.sport_event.sport_event_context.season.year,
                stats.goals_scored,
                stats.assists,
                stats.shots_faced_saved,
                stats.shots_faced_total,
                stats.goals_conceded,
                stats.shots_on_target,
                stats.minutes_played,
                stats.yellow_cards,
                stats.red_cards,
              ]);
            });
          }
        });
      }
    });
  });
  return {
    query: query,
    values: [values]
  };
}
