import express from 'express';
import bodyParser from 'body-parser';

import {
  getPlayers,
  getTeams,
  getGames,
  getPlayerIds,
  getTeamIds,
  getGameIds,
  addTeam,
  addPlayer,
  addGame,
  editTeam,
  editPlayer,
  editGame,
  deleteTeam,
  deletePlayer,
  deleteGame,
} from './database.js';

const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong.');
});

app.get('/', (req, res) => {
  res.render('index.ejs');
});

app.get('/getPlayers', async (req, res) => {
  const players = await getPlayers();
  res.send(players);
});

app.get('/getTeams', async (req, res) => {
  const teams = await getTeams();
  res.send(teams);
});

app.get('/getGames', async (req, res) => {
  const games = await getGames();
  res.send(games);
});

app.get('/getPlayerIds', async (req, res) => {
  const players = await getPlayerIds();
  res.send(players);
});

app.get('/getTeamIds', async (req, res) => {
  const teams = await getTeamIds();
  res.send(teams);
});

app.get('/getGameIds', async (req, res) => {
  const games = await getGameIds();
  res.send(games);
});

app.post('/addTeam', async (req, res) => {
  const result = await addTeam(
    null,
    req.body['team_name'],
    req.body['team_name_abbrev'],
    parseInt(req.body['year_founded']),
    parseInt(req.body['year_joined']),
    req.body['city'],
    req.body['primary_color'],
    req.body['secondary_color']
  );
  res.send(result);
});

app.post('/addPlayer', async (req, res) => {
  const result = await addPlayer(
    null,
    req.body['first_name'],
    req.body['last_name'],
    req.body['date_of_birth'],
    req.body['nationality'],
    parseInt(req.body['height_cm']),
    parseInt(req.body['weight_kg']),
    parseInt(req.body['jersey_number']),
    req.body['position']
  );
  res.send(result);
});

app.post('/addGame', async (req, res) => {
  const result = await addGame(
    null,
    req.body['date_played'],
    parseInt(req.body['home_team_score']),
    parseInt(req.body['away_team_score']),
    parseInt(req.body['home_team_id']),
    parseInt(req.body['away_team_id']),
    req.body['game_type'],
    req.body['round']
  );
  res.send(result);
});

app.post('/editTeam', async (req, res) => {
  const result = await editTeam(req.body);
  res.send(result);
});

app.post('/editPlayer', async (req, res) => {
  const result = await editPlayer(req.body);
  res.send(result);
});

app.post('/editGame', async (req, res) => {
  const result = await editGame(req.body);
  res.send(result);
});

app.post('/deleteTeam', async (req, res) => {
  const result = await deleteTeam(req.body['team_id']);
  res.send(result);
});

app.post('/deletePlayer', async (req, res) => {
  const result = await deletePlayer(req.body['player_id']);
  res.send(result);
});

app.post('/deleteGame', async (req, res) => {
  const result = await deleteGame(req.body['game_id']);
  res.send(result);
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
