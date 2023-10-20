import {
  addGame,
  addPlayer,
  addTeam,
  addAwayTeamGame,
  addHomeTeamGame,
  addPlayerGameStats,
  addPlayerToTeamSeason,
} from '../database.js';
import fs from 'fs';

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

// insert teams
console.log('Inserting teams...');
for (let key in teamsMap) {
  const team = teamsMap[key];
  const res = await addTeam(
    team.team_id,
    team.team_name,
    team.team_name_abbrev,
    team.year_founded,
    team.year_joined,
    team.city
  );
}

// insert players
console.log('Inserting players...');
playersByTeamBySeason.forEach(season => {
  season.season_competitor_players.forEach(team => {
    team.players.forEach(async player => {
      const res = await addPlayer(
        playerIdMap[player.id],
        player.first_name,
        player.last_name,
        player.date_of_birth,
        player.nationality,
        player.height,
        player.weight,
        player.jersey_number,
        player.type
      );
    });
  });
});

// insert games
console.log('Inserting games...');
matchDataBySeason.forEach(chunk => {
  chunk.summaries.forEach(async summary => {
    let home_team_id = null;
    let away_team_id = null;
    if (summary.sport_event_status.status != 'postponed' && summary.sport_event_status.status != 'cancelled' && summary.sport_event_status.status != 'not_started') {
      summary.statistics.totals.competitors.forEach(team => {
        if (team.qualifier == 'home') {
          home_team_id = teamsMap[team.id].team_id;
        } else if (team.qualifier == 'away') {
          away_team_id = teamsMap[team.id].team_id;
        }
      });
      const date = summary.sport_event.start_time.split('+')[0].replace('T', ' ');
      const game_type = summary.sport_event.sport_event_context.stage.phase;
      const round = game_type == 'regular season' ? null : summary.sport_event.sport_event_context.round.name;
      const res = await addGame(
        gameIdMap[summary.sport_event.id],
        date,
        summary.sport_event_status.home_score,
        summary.sport_event_status.away_score,
        home_team_id,
        away_team_id,
        game_type,
        round
      );
    }
  });
});

// insert player game stats
console.log('Inserting player match stats...');
matchDataBySeason.forEach(chunk => {
  chunk.summaries.forEach(summary => {
    if (summary.sport_event_status.status != 'postponed' && summary.sport_event_status.status != 'cancelled' && summary.sport_event_status.status != 'not_started') {
      summary.statistics.totals.competitors.forEach(team => {
        if (team.players != null) {
          team.players.forEach(async player => {
            const stats = player.statistics;
            const res = await addPlayerGameStats(
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
              stats.red_cards
            );
          });
        }
      });
    }
  });
});

// insert players to teams
// console.log('Inserting players to teams...');

// insert team home games
// console.log('Inserting team home games...');

// insert team away games
// console.log('Inserting team away games...');

console.log('Done');
